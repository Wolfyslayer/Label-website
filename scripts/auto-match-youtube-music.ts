#!/usr/bin/env tsx
/**
 * Conservative automated YouTube Music enrichment after Spotify import.
 * YouTube Data API search is not a complete Music catalog. Only unambiguous
 * exact-title, matching-duration uploads on named artist Topic channels qualify.
 * Never overwrite a pre-existing link. Uncertain matches go to a review report.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

const artists: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
const apiKey = process.env.YOUTUBE_API_KEY;
const limit = Number(process.env.YOUTUBE_SEARCH_LIMIT ?? "70");
const normalize = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const seconds = (s: string) => {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(s);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : null;
};
type SearchItem = { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; channelId?: string } };
type VideoItem = { id?: string; snippet?: { title?: string; channelTitle?: string; channelId?: string }; contentDetails?: { duration?: string } };
async function api<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL("https://www.googleapis.com/youtube/v3/" + endpoint);
  for (const [k, v] of Object.entries({ ...params, key: apiKey! })) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${endpoint} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}
const escape = (s: string) => s.replaceAll("|", "\\|").replace(/[\r\n]/g, " ");
async function main() {
  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY.");
  if (!Number.isInteger(limit) || limit < 1 || limit > 70) throw new Error("YOUTUBE_SEARCH_LIMIT must be 1..70 (YouTube search costs 100 quota units each).");
  const dir = join(process.cwd(), "content/tracks");
  const tracks = readdirSync(dir).filter((f) => f.endsWith(".json")).map((file) => ({
    file, value: JSON.parse(readFileSync(join(dir, file), "utf8")) as Track
  })).filter(({ value }) => artists[value.artistId] && !value.youtubeMusicTrackUrl && !!value.spotifyTrackId && !!value.durationSeconds)
    .sort((a, b) => a.value.artistId.localeCompare(b.value.artistId) || a.value.title.localeCompare(b.value.title) || a.file.localeCompare(b.file));
  // Search a fixed, capped batch. Future daily runs pick up the remaining missing entries.
  const pending = tracks.slice(0, limit);
  const lines = ["# Automated YouTube Music matching", "", `Missing before run: ${tracks.length}; searched: ${pending.length}; search cap: ${limit}.`, "", "Only exact artist Topic-channel, title and duration matches are saved. All other results need human review.", "", "| Artist | Track | Decision | Candidate |", "|---|---|---|---|"];
  let linked = 0;
  let quotaReached = false;
  for (const { file, value: track } of pending) {
    const artist = artists[track.artistId];
    let response: { items?: SearchItem[] };
    try {
      response = await api<{ items?: SearchItem[] }>("search", {
        part: "snippet", q: `${artist} ${track.title}`, type: "video", maxResults: "10"
      });
    } catch (error) {
      if (/HTTP (403|429).*?(quota|limit)|quota.*?(exceeded|limit)/is.test(String(error))) {
        quotaReached = true;
        lines.push(`| ${artist} | ${escape(track.title)} | Deferred: YouTube API quota exhausted | — |`);
        console.warn("YouTube API quota exhausted. Keeping previous successful matches and continuing Spotify catalog validation.");
        break;
      }
      throw error;
    }
    const ids = [...new Set((response.items ?? []).map((x) => x.id?.videoId).filter((id): id is string => !!id))];
    const details = ids.length ? await api<{ items?: VideoItem[] }>("videos", {
      part: "snippet,contentDetails", id: ids.join(",")
    }) : { items: [] };
    const matches = (details.items ?? []).filter((video) => {
      const title = normalize(video.snippet?.title ?? "");
      const channel = normalize(video.snippet?.channelTitle ?? "");
      const duration = seconds(video.contentDetails?.duration ?? "");
      const exactTitle = title === normalize(track.title) || title === normalize(`${artist} - ${track.title}`);
      const exactTopic = channel === normalize(`${artist} - Topic`);
      return !!video.id && exactTopic && exactTitle && duration !== null && Math.abs(duration - track.durationSeconds!) <= 3;
    });
    const unique = [...new Set(matches.map((v) => v.id!))];
    if (unique.length === 1) {
      track.youtubeMusicTrackUrl = `https://music.youtube.com/watch?v=${unique[0]}`;
      writeFileSync(join(dir, file), JSON.stringify(track, null, 2) + "\n");
      linked++;
      lines.push(`| ${artist} | ${escape(track.title)} | Linked (unique exact Topic match) | [Open](${track.youtubeMusicTrackUrl}) |`);
    } else {
      const candidates = (details.items ?? []).filter((v) => v.id).slice(0, 3)
        .map((v) => `[Candidate](https://music.youtube.com/watch?v=${v.id}) — ${escape(v.snippet?.channelTitle ?? "")}`).join("; ");
      lines.push(`| ${artist} | ${escape(track.title)} | Review (${unique.length} qualifying matches) | ${candidates || "None"} |`);
    }
  }
  lines.splice(4, 0, `Automatically linked: ${linked}; still missing: ${tracks.length - linked}; quota exhausted: ${quotaReached}.`, "");
  writeFileSync("youtube-music-auto-review.md", lines.join("\n") + "\n");
  console.log(`YouTube Music: searched ${pending.length}, linked ${linked}, missing ${tracks.length - linked}. Report generated.`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
