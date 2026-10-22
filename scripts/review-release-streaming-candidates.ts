#!/usr/bin/env tsx
/** Offline review of independently sourced release-level streaming candidates.
 * Input JSON: [{releaseId,platform,url,artistId,releaseType,upc,title,trackCount,trackIsrcs}]
 * Never updates content. UPC/ISRC must come from release metadata, not inferred from track links.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluateReleaseCandidate, type StreamingCandidate } from "../lib/utils/release-streaming-match";
import type { ReleaseSource, Track, StreamingPlatform } from "../lib/types/content";

type Input = StreamingCandidate & { releaseId: string };
const allowed = new Set<StreamingPlatform>(["appleMusic","youtubeMusic","deezer","tidal","amazonMusic","bandcamp","soundcloud"]);
const inputFile = process.argv[2] ?? "scripts/data/release-streaming-candidates.json";
const readDir = <T>(path: string): T[] => readdirSync(path).filter(f => f.endsWith(".json")).map(f => JSON.parse(readFileSync(join(path,f),"utf8")) as T);
const releases = new Map(readDir<ReleaseSource>("content/releases").map(r => [r.id,r]));
const tracks = readDir<Track>("content/tracks");
const input: unknown = JSON.parse(readFileSync(inputFile,"utf8"));
if (!Array.isArray(input)) throw new Error("Expected a JSON array");
const rows = ["# Release streaming candidate review","","This is a report only. No catalog links were changed.","","| Release | Platform | Decision | Reason | URL |","|---|---|---|---|---|"];
const clean = (value: unknown) => String(value ?? "").replaceAll("|","/").replaceAll("\n"," ").slice(0,250);
for (const raw of input) {
  const candidate = raw as Partial<Input>;
  const release = releases.get(candidate.releaseId ?? "");
  let status = "rejected", reason = "invalid_candidate";
  if (!release) reason = "unknown_release";
  else if (!candidate.platform || !allowed.has(candidate.platform as StreamingPlatform)) reason = "unsupported_platform";
  else if (release.streamingLinks[candidate.platform as StreamingPlatform]) { status = "review"; reason = "existing_link_preserved"; }
  else if (typeof candidate.url !== "string" || typeof candidate.artistId !== "string" || !candidate.releaseType) reason = "missing_required_metadata";
  else {
    const result = evaluateReleaseCandidate(release,tracks,candidate as StreamingCandidate);
    status = result.status; reason = result.reason;
  }
  rows.push("| " + [release?.title ?? candidate.releaseId,candidate.platform,status,reason,candidate.url].map(clean).join(" | ") + " |");
}
writeFileSync("release-streaming-review.md",rows.join("\n")+"\n");
console.log("Reviewed "+input.length+" candidates; no catalog changes.");
