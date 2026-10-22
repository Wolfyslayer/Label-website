#!/usr/bin/env tsx
/** Verify MusicLink release URLs against the exact release UPC.
 * No UPC => no approval. ISRC must never be used to infer release identity.
 * Deezer exposes UPC via its album API. Other platforms require a trusted
 * UPC-bearing metadata source; absent such evidence they stay in review.
 */
import {readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import type {ReleaseSource} from "../lib/types/content";

type Candidate={releaseId:string;platform:string;url:string;verified?:boolean};
type Approval={releaseId:string;platform:"appleMusic"|"deezer"|"tidal";url:string;approved:true};
type Review={releaseId:string;platform:string;url:string;reason:string;expectedUpc?:string;observedUpc?:string};
const file=process.argv[2]??"musiclink-release-candidates.json";
const candidates=JSON.parse(readFileSync(file,"utf8")) as Candidate[];
if(!Array.isArray(candidates))throw Error("Expected candidate array");
const releases=new Map<string,ReleaseSource>();
for(const name of readdirSync("content/releases").filter(n=>n.endsWith(".json"))){
 const release=JSON.parse(readFileSync(join("content/releases",name),"utf8")) as ReleaseSource;
 releases.set(release.id,release);
}
const approvals:Approval[]=[];const reviews:Review[]=[];
const seen=new Set<string>();
const platformNames:Record<string,Approval["platform"]>={apple_music:"appleMusic",deezer:"deezer",tidal:"tidal"};
const hosts:Record<string,string[]>={apple_music:["music.apple.com"],deezer:["www.deezer.com","deezer.com"],tidal:["listen.tidal.com","tidal.com"]};
const normalize=(s:string)=>s.replace(/[^0-9]/g,"").replace(/^0+(?=\d)/,"");
const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
for(const candidate of candidates){
 const release=releases.get(candidate.releaseId);
 const review=(reason:string,observedUpc?:string)=>reviews.push({releaseId:candidate.releaseId,platform:candidate.platform,url:candidate.url,reason,expectedUpc:release?.upc,observedUpc});
 if(!release){review("unknown_release");continue;}
 if(!platformNames[candidate.platform]){review("unsupported_platform");continue;}
 if(!release.upc||!/^\d{8,14}$/.test(release.upc)){review("missing_or_invalid_catalog_upc");continue;}
 if(release.streamingLinks[platformNames[candidate.platform]]){review("existing_link_preserved");continue;}
 const pair=candidate.releaseId+":"+candidate.platform;
 if(seen.has(pair)){review("duplicate_candidate");continue;}seen.add(pair);
 let url:URL;
 try{url=new URL(candidate.url);}catch{review("invalid_url");continue;}
 if(url.protocol!=="https:"||!hosts[candidate.platform].includes(url.hostname)||!/^\/album\/\d+\/?$/.test(url.pathname)){review("invalid_album_url");continue;}
 if(candidate.platform!=="deezer"){review("no_trusted_upc_metadata_source_for_platform");continue;}
 const id=url.pathname.split("/")[2];
 try{
  const response=await fetch("https://api.deezer.com/album/"+encodeURIComponent(id),{signal:AbortSignal.timeout(20000)});
  if(!response.ok){review("metadata_http_"+response.status);continue;}
  const data=await response.json() as {id?:number;upc?:string;error?:unknown;title?:string};
  if(data.error||String(data.id??"")!==id){review("metadata_invalid_album");continue;}
  if(!data.upc){review("metadata_upc_missing");continue;}
  if(normalize(data.upc)!==normalize(release.upc)){review("upc_mismatch",data.upc);continue;}
  approvals.push({releaseId:release.id,platform:"deezer",url:candidate.url,approved:true});
 }catch{review("metadata_request_failed");}
 await pause(400);
}
writeFileSync("musiclink-upc-approved.json",JSON.stringify(approvals,null,2)+"\n");
writeFileSync("musiclink-upc-review.json",JSON.stringify(reviews,null,2)+"\n");
writeFileSync("musiclink-upc-report.md",["# MusicLink UPC verification","","Only identical release UPC values can be approved.","","- Candidates: "+candidates.length,"- UPC-verified: "+approvals.length,"- Requires review: "+reviews.length,"","Apple Music and Tidal candidates remain in review until a trusted UPC-bearing metadata endpoint is configured. No ISRC fallback is used.",""].join("\n"));
console.log("UPC verification complete: "+approvals.length+" approved, "+reviews.length+" review.");
