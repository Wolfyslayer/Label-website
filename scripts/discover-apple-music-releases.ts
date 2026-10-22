#!/usr/bin/env tsx
/** Read-only Apple Music album discovery via public iTunes lookup/search API.
 * Results are candidates for human review, never automatic published links.
 * iTunes does not reliably expose UPC; no UPC is inferred or invented.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReleaseSource, StreamingPlatform } from "../lib/types/content";
const artistNames: Record<string,string> = {"artist-frostmark":"Frostmark","artist-wolfyslayer":"Wolfyslayer"};
const normalize = (s:string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
const releases = readdirSync("content/releases").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(readFileSync(join("content/releases",f),"utf8")) as ReleaseSource);
const limit = Number(process.env.APPLE_DISCOVERY_LIMIT ?? "15");
if (!Number.isInteger(limit) || limit<1 || limit>35) throw new Error("APPLE_DISCOVERY_LIMIT must be 1–35");
const candidates: unknown[] = [];
const report = ["# Apple Music release discovery","","Read-only suggestions. Apple search does not verify UPC or recording ISRC. Every suggestion needs review before publishing.","","| Release | Result |","|---|---|"];
const clean=(s:unknown)=>String(s??"").replaceAll("|","/").replaceAll("\n"," ").slice(0,150);
async function main(){
 for(const release of releases.filter(r=>artistNames[r.artistId]&&!r.streamingLinks.appleMusic).slice(0,limit)){
  const term=artistNames[release.artistId]+" "+release.title;
  const url=new URL("https://itunes.apple.com/search");
  url.searchParams.set("term",term);url.searchParams.set("entity","album");url.searchParams.set("limit","25");
  let status="No exact artist/title match";
  try{
   const res=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{"User-Agent":"WolfyslayerRecordsCatalog/1.0"}});
   if(!res.ok){status="HTTP "+res.status;if(res.status===429){report.push("| "+clean(release.title)+" | "+status+" |");break;}}
   else{
    const data=await res.json() as {results?:Array<{artistName?:string;collectionName?:string;collectionViewUrl?:string;trackCount?:number;collectionType?:string}>};
    const matches=(data.results??[]).filter(item=>normalize(item.artistName??"")===normalize(artistNames[release.artistId])&&normalize(item.collectionName??"")===normalize(release.title)&&typeof item.collectionViewUrl==="string"&&/^https:\/\/music\.apple\.com\//.test(item.collectionViewUrl));
    if(matches.length===1){
     const item=matches[0];
     candidates.push({releaseId:release.id,platform:"appleMusic" satisfies StreamingPlatform,url:item.collectionViewUrl,artistId:release.artistId,releaseType:release.type,title:item.collectionName,trackCount:item.trackCount});
     status="Candidate for manual review (UPC unverified)";
    }else if(matches.length>1)status="Ambiguous matches: "+matches.length;
   }
  }catch(e){status="Lookup failed: "+String(e).slice(0,70)}
  report.push("| "+clean(release.title)+" | "+clean(status)+" |");
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 writeFileSync("apple-music-release-candidates.json",JSON.stringify(candidates,null,2)+"\n");
 writeFileSync("apple-music-discovery-report.md",report.join("\n")+"\n");
 console.log("Found "+candidates.length+" review-only Apple Music candidates.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
