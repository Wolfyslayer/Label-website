#!/usr/bin/env tsx
/** Apply explicitly approved MusicLink release candidates only.
 * Approval file is intentionally separate from raw API responses.
 */
import {readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import type {ReleaseSource,StreamingPlatform} from "../lib/types/content";
type Approval={releaseId:string;platform:"appleMusic"|"deezer"|"tidal"|"amazonMusic"|"youtubeMusic";url:string;approved:boolean;upc?:string};
const file=process.argv[2]??"scripts/data/approved-musiclink-release-links.json";
const approvals=JSON.parse(readFileSync(file,"utf8")) as Approval[];
if(!Array.isArray(approvals))throw Error("Expected approval array");
const hosts:Record<Approval["platform"],string[]>={appleMusic:["music.apple.com"],deezer:["deezer.com","www.deezer.com"],tidal:["listen.tidal.com","tidal.com"],amazonMusic:["music.amazon.com"],youtubeMusic:["music.youtube.com"]};
const releases=readdirSync("content/releases").filter(f=>f.endsWith(".json")).map(f=>({file:f,release:JSON.parse(readFileSync(join("content/releases",f),"utf8")) as ReleaseSource}));
let saved=0,skipped=0;const seen=new Set<string>();
for(const a of approvals){
 if(a.approved!==true)continue;
 if(!a.releaseId||!hosts[a.platform])throw Error("Invalid approved record");
 const pair=a.releaseId+":"+a.platform;
 if(seen.has(pair))throw Error("Duplicate release/platform approval "+pair);
 seen.add(pair);
 const record=releases.find(r=>r.release.id===a.releaseId);
 if(!record)throw Error("Unknown release "+a.releaseId);
 if(file!=="scripts/data/approved-musiclink-release-links.json"){
  if(!a.upc||!record.release.upc||a.upc.replace(/\\D/g,"")!==record.release.upc.replace(/\\D/g,""))throw Error("UPC mismatch or missing UPC for "+pair);
 }
 const url=new URL(a.url);
 if(url.protocol!=="https:"||!hosts[a.platform].includes(url.hostname))throw Error("Invalid release URL for "+a.platform);
 const path=url.pathname;
 const valid=a.platform==="youtubeMusic"?path==="/playlist"&&url.searchParams.has("list"):a.platform==="amazonMusic"?/^\/albums\/[A-Za-z0-9]+\/?$/.test(path):/^\/(?:album|us\/album|[a-z]{2}\/album)\//.test(path);
 if(!valid)throw Error("Invalid release path for "+a.platform);
 if(record.release.streamingLinks[a.platform as StreamingPlatform]){skipped++;continue;}
 record.release.streamingLinks[a.platform as StreamingPlatform]=a.url;
 writeFileSync(join("content/releases",record.file),JSON.stringify(record.release,null,2)+"\n");
 saved++;
}
console.log("Applied "+saved+" UPC-matched links; skipped "+skipped+" existing links.");
