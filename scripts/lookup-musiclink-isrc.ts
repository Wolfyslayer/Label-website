#!/usr/bin/env tsx
/**
 * Read-only MusicLink Spotify track -> ISRC lookup.
 * Outputs a downloadable CSV; never changes content/ or exposes the API key.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
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
  const selected = unique.slice(0, limit);
  const rows = [["artist", "track", "spotify_track_id", "isrc", "status"]];
  let resolved = 0;
  for (const track of selected) {
    const endpoint = new URL("https://api.musiclink.one/v2/convert");
    endpoint.searchParams.set("q", "https://open.spotify.com/track/" + track.spotifyTrackId);
    endpoint.searchParams.set("to", "isrc");
    let isrc = "";
    let status = "not_found";
    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: "Bearer " + key },
        signal: AbortSignal.timeout(30000),
      });
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
    await sleep(1300);
  }

  writeFileSync("musiclink-isrc.csv", "\uFEFF" + rows.map(row => row.map(escapeCsv).join(",")).join("\n") + "\n", "utf8");
  const summary = [
    "# MusicLink ISRC lookup",
    "",
    "Read-only run. No website content was changed.",
    "",
    "- Catalog tracks with Spotify IDs: " + unique.length,
    "- Requested in this run: " + selected.length,
    "- Successful ISRC format matches: " + resolved,
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
