#!/usr/bin/env tsx
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

const artists: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
type Response = { success?: boolean; data?: { to?: { value?: string }; item?: { title?: string; artist?: string; duration_ms?: number } } };
const rows: string[] = ["# MusicLink enrichment", "", "| Artist | Track | Result |", "|---|---|---|"];
async function main() {
  const key = process.env.MUSICLINK_API_KEY;
  if (!key) throw new Error("MUSICLINK_API_KEY missing");
  const limit = Number(process.env.MUSICLINK_BATCH_SIZE ?? "10");
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("Invalid batch size");
  const dir = join(process.cwd(), "content/tracks");
  const files = readdirSync(dir).filter(f => f.endsWith(".json"));
  const pending = files.map(file => ({file, track: JSON.parse(readFileSync(join(dir, file), "utf8")) as Track}))
    .filter(({track}) => artists[track.artistId] && track.spotifyTrackId && track.durationSeconds && !track.youtubeMusicTrackUrl)
    .sort((a,b) => a.track.artistId.localeCompare(b.track.artistId) || a.track.title.localeCompare(b.track.title)).slice(0,limit);
  let saved = 0;
  for (const {file,track} of pending) {
    const url = new URL("https://api.musiclink.one/v2/convert");
    url.searchParams.set("q", "https://open.spotify.com/track/" + track.spotifyTrackId);
    url.searchParams.set("to", "youtube_music");
    let status = "Not verified";
    try {
      const res = await fetch(url, {headers: {Authorization: "Bearer " + key}, signal: AbortSignal.timeout(30000)});
      if (!res.ok) {
        status = "HTTP " + res.status;
        if ([401,403,429].includes(res.status)) { rows.push("| " + [artists[track.artistId], track.title, status].map(s=>s.replaceAll("|","/")).join(" | ") + " |"); break; }
      } else {
        const data = await res.json() as Response;
        const item = data.data?.item;
        const link = data.data?.to?.value ?? "";
        const valid = data.success === true && /^https:\/\/music\.youtube\.com\/watch\?v=[\w-]{11}(?:&.*)?$/.test(link)
          && !!item?.title && normalize(item.title) === normalize(track.title)
          && !!item?.artist && normalize(item.artist).split(" feat ")[0] === normalize(artists[track.artistId])
          && typeof item?.duration_ms === "number" && Math.abs(item.duration_ms/1000 - track.durationSeconds!) <= 3;
        if (valid) {
          const current = JSON.parse(readFileSync(join(dir,file),"utf8")) as Track;
          if (!current.youtubeMusicTrackUrl && current.spotifyTrackId === track.spotifyTrackId) {
            current.youtubeMusicTrackUrl = link;
            writeFileSync(join(dir,file),JSON.stringify(current,null,2)+"\n");
            saved++;
            status = "Saved";
          }
        }
      }
    } catch { status = "Request failed"; }
    rows.push("| " + [artists[track.artistId],track.title,status].map(s=>s.replaceAll("|","/")).join(" | ") + " |");
    await new Promise(resolve=>setTimeout(resolve,1300));
  }
  rows.splice(2,0,"Saved "+saved+" verified links from "+pending.length+" attempts.","");
  writeFileSync("musiclink-enrichment-report.md",rows.join("\n")+"\n");
  console.log("MusicLink saved "+saved+" verified links");
}
main().catch(e=>{console.error(e);process.exitCode=1});
