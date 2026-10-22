#!/usr/bin/env tsx
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";
const base = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !secret) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
type Proposal = { track_id: string; spotify_track_id: string; youtube_url: string; proposed_by: string };
const valid = (url: string) => /^https:\/\/music\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(url);
async function main() {
  const url = new URL("/rest/v1/youtube_link_proposals", base);
  url.searchParams.set("select", "track_id,spotify_track_id,youtube_url,proposed_by");
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Could not fetch proposals: HTTP ${res.status}`);
  const proposals = await res.json() as Proposal[];
  const adminsUrl = new URL("/rest/v1/admin_users", base);
  adminsUrl.searchParams.set("select", "user_id");
  const adminRes = await fetch(adminsUrl, { headers });
  if (!adminRes.ok) throw new Error(`Could not verify admins: HTTP ${adminRes.status}`);
  const admins = new Set(((await adminRes.json()) as {user_id:string}[]).map(a => a.user_id));
  const dir = join(process.cwd(), "content/tracks");
  const paths = readdirSync(dir).filter(f => f.endsWith(".json"));
  const records = paths.map(file => ({ file, track: JSON.parse(readFileSync(join(dir,file),"utf8")) as Track }));
  let changed = 0;
  for (const proposal of proposals) {
    if (!admins.has(proposal.proposed_by) || !valid(proposal.youtube_url)) {
      console.warn("Skipping invalid or non-admin proposal", proposal.track_id);
      continue;
    }
    const matching = records.filter(x => x.track.id === proposal.track_id && x.track.spotifyTrackId === proposal.spotify_track_id);
    if (matching.length !== 1) { console.warn("Skipping unknown or ambiguous track", proposal.track_id); continue; }
    const item = matching[0];
    if (item.track.youtubeMusicTrackUrl === proposal.youtube_url) continue;
    item.track.youtubeMusicTrackUrl = proposal.youtube_url;
    writeFileSync(join(dir,item.file), JSON.stringify(item.track,null,2)+"\n");
    changed++;
  }
  console.log(`Applied ${changed} admin proposals to track catalog. Changes require PR review and merge.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
