#!/usr/bin/env tsx
/** Diagnostic only: resolve up to five Spotify tracks to YouTube Music. No catalog writes. */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

const key = process.env.MUSICLINK_API_KEY;
const names: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
const norm = (s: string) => s.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const safe = (s: unknown) => String(s ?? "").replaceAll("|", "\\|").replace(/[\r\n]/g, " ").slice(0, 140);
type Conversion = { success: boolean; data?: { to?: { value?: string }; item?: { title?: string; artist?: string; duration_ms?: number } }; error?: string };
const lines = ["# MusicLink Spotify → YouTube Music diagnostic", "", "Read-only test; no content was modified.", "", "| Artist | Track | Status | YouTube Music |", "|---|---|---|---|"];
async function main() {
  if (!key) throw new Error("Missing MUSICLINK_API_KEY secret");
  const folder = join(process.cwd(), "content/tracks");
  const tracks = readdirSync(folder).filter(f => f.endsWith(".json"))
    .map(file => JSON.parse(readFileSync(join(folder, file), "utf8")) as Track)
    .filter(t => names[t.artistId] && t.spotifyTrackId && !t.youtubeMusicTrackUrl)
    .sort((a, b) => a.artistId.localeCompare(b.artistId) || a.title.localeCompare(b.title))
    .slice(0, 5);
  if (!tracks.length) lines.push("| — | — | No missing links to test | — |");
  for (const track of tracks) {
    const url = new URL("https://api.musiclink.one/v2/convert");
    url.searchParams.set("q", "https://open.spotify.com/track/" + track.spotifyTrackId);
    url.searchParams.set("to", "youtube_music");
    let status = "", link = "";
    try {
      const res = await fetch(url, { headers: { Authorization: "Bearer " + key }, signal: AbortSignal.timeout(30000) });
      const result = await res.json() as Conversion;
      if (!res.ok || !result.success) {
        status = "HTTP " + res.status + (result.error ? ": " + safe(result.error) : "");
      } else {
        const item = result.data?.item;
        const candidate = result.data?.to?.value ?? "";
        const validUrl = /^https:\/\/music\.youtube\.com\/watch\?v=[\w-]{11}(?:&.*)?$/.test(candidate);
        const titleOk = !!item?.title && norm(item.title) === norm(track.title);
        const artistOk = !!item?.artist && norm(item.artist).split(" feat ")[0] === norm(names[track.artistId]);
        const durationOk = !!track.durationSeconds && typeof item?.duration_ms === "number" && Math.abs(item.duration_ms / 1000 - track.durationSeconds) <= 3;
        status = validUrl && titleOk && artistOk && durationOk ? "Candidate verified by metadata" : "Review: incomplete/mismatched metadata";
        if (validUrl) link = candidate;
      }
    } catch (error) { status = "Request failed: " + safe(error instanceof Error ? error.name : "unknown error"); }
    lines.push("| " + [safe(names[track.artistId]), safe(track.title), safe(status), link ? "[Candidate](" + link + ")" : "—"].join(" | ") + " |");
    console.log("MusicLink conversion: " + status);
    if (/HTTP (401|403|429)/.test(status)) break;
    await new Promise(resolve => setTimeout(resolve, 1300));
  }
  writeFileSync("musiclink-test-report.md", lines.join("\n") + "\n");
  console.log("Report generated; no catalog changes.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
