#!/usr/bin/env tsx
/**
 * Read-only MusicLink Spotify track -> ISRC lookup.
 * Outputs a downloadable CSV; never changes content/ or exposes the API key.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

type Conversion = { success?: boolean; data?: { to?: { value?: unknown } } };
const artistNames: Record<string, string> = {
  "artist-frostmark": "Frostmark",
  "artist-wolfyslayer": "Wolfyslayer",
};
const escapeCsv = (value: unknown) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const key = process.env.MUSICLINK_API_KEY;
  if (!key) throw new Error("MUSICLINK_API_KEY secret is missing");
  const limit = Number(process.env.MUSICLINK_ISRC_LIMIT ?? "20");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("MUSICLINK_ISRC_LIMIT must be an integer between 1 and 100");
  }

  const folder = join(process.cwd(), "content/tracks");
  const tracks = readdirSync(folder)
    .filter(file => file.endsWith(".json") && !file.startsWith("_"))
    .map(file => JSON.parse(readFileSync(join(folder, file), "utf8")) as Track)
    .filter(track => !!artistNames[track.artistId] && !!track.spotifyTrackId)
    .sort((a, b) => a.artistId.localeCompare(b.artistId) || a.title.localeCompare(b.title));

  const unique = [...new Map(tracks.map(track => [track.spotifyTrackId!, track])).values()];
  const cachePath = ".musiclink-isrc-cache/results.json";
  const cache: Record<string, string> = {};
  // Preserve the eight matches recovered from the user's first run.
  const seedPath = "scripts/data/musiclink-isrc-initial.csv";
  if (existsSync(seedPath)) {
    for (const line of readFileSync(seedPath, "utf8").trim().split("\n").slice(1)) {
      const cells = [...line.matchAll(/"([^"]*)"/g)].map(m => m[1]);
      if (cells.length >= 4 && isrcPattern.test(cells[3])) cache[cells[2]] = cells[3];
    }
  }
  if (existsSync(cachePath)) {
    const stored = JSON.parse(readFileSync(cachePath, "utf8")) as Record<string, string>;
    for (const [id, code] of Object.entries(stored)) if (isrcPattern.test(code)) cache[id] = code;
  }
  mkdirSync(".musiclink-isrc-cache", { recursive: true });
  const persist = () => writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
  persist();
  const selected = unique.filter(track => !cache[track.spotifyTrackId!]).slice(0, limit);
  // Free tier: 1 request/sec, 10/min. Seven seconds avoids both limits.
  let lastRequest = 0;
  const pacedFetch = async (url: URL) => {
    const remaining = 7000 - (Date.now() - lastRequest);
    if (remaining > 0) await sleep(remaining);
    lastRequest = Date.now();
    return fetch(url, { headers: { Authorization: "Bearer " + key }, signal: AbortSignal.timeout(30000) });
  };
  const retryWait = (header: string | null, attempt: number) => {
    if (header) {
      const seconds = Number(header);
      if (Number.isFinite(seconds) && seconds >= 0) return Math.max(7000, Math.min(300000, seconds * 1000 + 1000));
      const dateWait = Date.parse(header) - Date.now();
      if (Number.isFinite(dateWait)) return Math.max(7000, Math.min(300000, dateWait + 1000));
    }
    return Math.min(300000, 65000 * (attempt + 1));
  };
  const rows = [["artist", "track", "spotify_track_id", "isrc", "status"]];
  let resolved = 0;
  for (const track of selected) {
    const endpoint = new URL("https://api.musiclink.one/v2/convert");
    endpoint.searchParams.set("q", "https://open.spotify.com/track/" + track.spotifyTrackId);
    endpoint.searchParams.set("to", "isrc");
    let isrc = "";
    let status = "not_found";
    try {
      let response = await pacedFetch(endpoint);
      for (let attempt = 0; response.status === 429 && attempt < 2; attempt++) {
        const delay = retryWait(response.headers.get("retry-after"), attempt);
        console.log("MusicLink 429: waiting " + Math.ceil(delay / 1000) + " seconds");
        await sleep(delay);
        response = await pacedFetch(endpoint);
      }
      if (!response.ok) {
        status = "http_" + response.status;
      } else {
        const body = await response.json() as Conversion;
        const value = body.data?.to?.value;
        const candidate = typeof value === "string" ? value.trim().toUpperCase().replaceAll("-", "") : "";
        if (body.success === true && isrcPattern.test(candidate)) {
          isrc = candidate;
          status = "verified_format";
          resolved++;
          cache[track.spotifyTrackId!] = isrc;
          persist();
        } else {
          status = "missing_or_invalid";
        }
      }
    } catch {
      status = "request_failed";
    }
    rows.push([artistNames[track.artistId], track.title, track.spotifyTrackId ?? "", isrc, status]);
    console.log("ISRC lookup: " + status + " (" + rows.length + "/" + (selected.length + 1) + ")");
    if (status === "http_401" || status === "http_403" || status === "http_429") break;

  }

  const recorded = new Set(rows.slice(1).map(row => row[2]));
  for (const track of unique) {
    const id = track.spotifyTrackId!;
    if (cache[id] && !recorded.has(id)) rows.push([artistNames[track.artistId], track.title, id, cache[id], "cached"]);
  }
  writeFileSync("musiclink-isrc.csv", "\uFEFF" + rows.map(row => row.map(escapeCsv).join(",")).join("\n") + "\n", "utf8");
  const summary = [
    "# MusicLink ISRC lookup",
    "",
    "Read-only run. No website content was changed.",
    "",
    "- Catalog tracks with Spotify IDs: " + unique.length,
    "- Requested in this run: " + selected.length,
    "- New successful ISRC format matches: " + resolved,
    "- Total cached ISRC matches: " + Object.keys(cache).length,
    "- Rows recorded: " + (rows.length - 1),
    "",
    "Download musiclink-isrc.csv from the workflow artifacts for per-track results.",
    "An ISRC format match is not proof that the returned recording belongs to the intended release; review before publishing.",
    "",
  ];
  writeFileSync("musiclink-isrc-report.md", summary.join("\n"), "utf8");
  console.log("ISRC results: " + resolved + "/" + (rows.length - 1));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "MusicLink ISRC lookup failed");
  process.exitCode = 1;
});
