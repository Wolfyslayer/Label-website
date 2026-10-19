#!/usr/bin/env tsx
/**
 * Conservative YouTube Music enrichment.
 * Only links a track when exactly one upload on the configured artist channel
 * has an exact title match and duration within 3 seconds of Spotify.
 * This is NOT a YouTube Music catalog API.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "@/lib/types/content";

const artists = [
  { id: "artist-frostmark", handle: "frostmarkofficial", name: "Frostmark" },
  { id: "artist-wolfyslayer", handle: "wolfyslayermusic", name: "Wolfyslayer" },
];
const apiKey = process.env.YOUTUBE_API_KEY;
const dryRun = process.argv.includes("--dry-run");
const strictTitle = (s: string) => s.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
const seconds = (iso: string) => {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : null;
};
async function get(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [key, value] of Object.entries({ ...params, key: apiKey! })) url.searchParams.set(key, value);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${endpoint}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<any>;
}
async function main() {
  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY GitHub Actions secret.");
  const dir = join(process.cwd(), "content", "tracks");
  const files = readdirSync(dir).filter((file) => file.endsWith(".json") && !file.startsWith("_"));
  const tracks = files.map((file) => ({ file, track: JSON.parse(readFileSync(join(dir, file), "utf8")) as Track }));
  for (const artist of artists) {
    const channel = await get("channels", { part: "id,contentDetails,snippet", forHandle: artist.handle });
    if (channel.items?.length !== 1) throw new Error(`Cannot uniquely resolve @${artist.handle}`);
    const info = channel.items[0];
    // Never cross-link music from a channel with an unexpected display name.
    if (strictTitle(info.snippet?.title ?? "") !== strictTitle(artist.name)) {
      console.log(`REVIEW: channel @${artist.handle} has unexpected title ${info.snippet?.title}; skipping`);
      continue;
    }
    const playlist = info.contentDetails?.relatedPlaylists?.uploads;
    if (!playlist) throw new Error(`No uploads playlist for @${artist.handle}`);
    const ids: string[] = [];
    let pageToken: string | undefined;
    for (let page = 0; page < 5; page++) {
      const response = await get("playlistItems", { part: "contentDetails", playlistId: playlist, maxResults: "50", ...(pageToken ? { pageToken } : {}) });
      ids.push(...(response.items ?? []).map((item: any) => item.contentDetails?.videoId).filter(Boolean));
      pageToken = response.nextPageToken;
      if (!pageToken) break;
    }
    const videos: { id: string; title: string; duration: number | null }[] = [];
    for (let i = 0; i < ids.length; i += 50) {
      const response = await get("videos", { part: "snippet,contentDetails", id: ids.slice(i, i + 50).join(",") });
      for (const item of response.items ?? []) {
        if (item.snippet?.channelId !== info.id) continue;
        videos.push({ id: item.id, title: item.snippet.title, duration: seconds(item.contentDetails?.duration ?? "") });
      }
    }
    let matched = 0;
    for (const { file, track } of tracks) {
      if (track.artistId !== artist.id || !track.durationSeconds || track.youtubeMusicTrackUrl) continue;
      const expected = [strictTitle(track.title), strictTitle(`${artist.name} - ${track.title}`)];
      const candidates = videos.filter((video) =>
        expected.includes(strictTitle(video.title)) &&
        video.duration !== null &&
        Math.abs(video.duration - track.durationSeconds!) <= 3
      );
      if (candidates.length !== 1) continue;
      track.youtubeMusicTrackUrl = `https://music.youtube.com/watch?v=${candidates[0].id}`;
      matched++;
      if (!dryRun) writeFileSync(join(dir, file), JSON.stringify(track, null, 2) + "\n");
    }
    console.log(`@${artist.handle}: ${videos.length} uploads checked, ${matched} unique title+duration matches ${dryRun ? "(dry run)" : "saved"}.`);
  }
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
