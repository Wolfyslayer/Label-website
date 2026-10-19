#!/usr/bin/env tsx
/**
 * Read-only YouTube Data API candidate finder. It never changes catalog links.
 * Search is expensive (100 quota units per request): explicitly capped to 10 tracks.
 * Topic channels are only suggestions, never treated as verified ownership.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

const key = process.env.YOUTUBE_API_KEY;
const max = Number(process.env.CANDIDATE_LIMIT ?? "5");
const artistFilter = process.env.CANDIDATE_ARTIST ?? "frostmark";
const names: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
const normalize = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const duration = (iso: string): number | null => {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : null;
};
type SearchResult = { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; channelId?: string } };
type VideoResult = { id?: string; snippet?: { title?: string; channelTitle?: string }; contentDetails?: { duration?: string } };
async function api<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL("https://www.googleapis.com/youtube/v3/" + endpoint);
  Object.entries({ ...params, key: key! }).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`YouTube ${endpoint} HTTP ${response.status}: ${(await response.text()).slice(0, 250)}`);
  return response.json() as Promise<T>;
}
function escapeCell(s: string) { return s.replaceAll("|", "\\|").replace(/[\r\n]+/g, " "); }
async function main() {
  if (!key) throw new Error("YOUTUBE_API_KEY is required.");
  if (!Number.isInteger(max) || max < 1 || max > 10) throw new Error("CANDIDATE_LIMIT must be 1–10.");
  if (!["frostmark", "wolfyslayer"].includes(artistFilter)) throw new Error("Invalid CANDIDATE_ARTIST.");
  const tracksDir = join(process.cwd(), "content/tracks");
  const tracks = readdirSync(tracksDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(tracksDir, f), "utf8")) as Track)
    .filter((t) => names[t.artistId]?.toLowerCase() === artistFilter && !t.youtubeMusicTrackUrl && !!t.spotifyTrackId)
    .sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id)).slice(0, max);
  const lines = [
    "# YouTube Music candidate review",
    "",
    `Artist: **${artistFilter}** · tracks checked: **${tracks.length}** · read-only, no links saved.`,
    "",
    "These are **unverified suggestions**, including possible Topic uploads. Confirm recording and artist on YouTube Music before using Link Manager.",
    ""
  ];
  for (const track of tracks) {
    const artist = names[track.artistId];
    const search = await api<{ items?: SearchResult[] }>("search", { part: "snippet", q: `${artist} ${track.title}`, type: "video", maxResults: "5" });
    const ids = [...new Set((search.items ?? []).map((item) => item.id?.videoId).filter((id): id is string => !!id))];
    const videos = ids.length ? await api<{ items?: VideoResult[] }>("videos", { part: "snippet,contentDetails", id: ids.join(",") }) : { items: [] };
    const candidates = (videos.items ?? []).map((video) => {
      const title = video.snippet?.title ?? "";
      const channel = video.snippet?.channelTitle ?? "";
      const length = duration(video.contentDetails?.duration ?? "");
      const titleExact = [normalize(track.title), normalize(`${artist} - ${track.title}`)].includes(normalize(title));
      const timeClose = length !== null && track.durationSeconds !== undefined && Math.abs(length - track.durationSeconds) <= 3;
      return { video, title, channel, length, titleExact, timeClose };
    }).sort((a, b) => Number(b.titleExact && b.timeClose) - Number(a.titleExact && a.timeClose));
    lines.push(`## ${escapeCell(track.title)}`, "", `Spotify track ID: \`${track.spotifyTrackId}\` · expected duration: ${track.durationSeconds ?? "unknown"}s`, "");
    lines.push("| Candidate | Channel | Duration | Exact title | Within 3s |", "|---|---|---:|---|---|");
    for (const c of candidates) {
      if (!c.video.id) continue;
      lines.push(`| [${escapeCell(c.title)}](https://music.youtube.com/watch?v=${c.video.id}) | ${escapeCell(c.channel)} | ${c.length ?? "?"}s | ${c.titleExact ? "Yes" : "No"} | ${c.timeClose ? "Yes" : "No"} |`);
    }
    if (!candidates.length) lines.push("No candidates found.");
    lines.push("");
  }
  writeFileSync("youtube-music-candidates.md", lines.join("\n") + "\n");
  console.log(`Created review report for ${tracks.length} unlinked ${artistFilter} tracks. No catalog files changed.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
