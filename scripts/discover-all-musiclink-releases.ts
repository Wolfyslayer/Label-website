#!/usr/bin/env tsx
/** MusicLink all-release discovery. Each manual run processes the next batch.
 * Durable cache is a workflow artifact; never modifies published catalog.
 */
import {existsSync,readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import type {ReleaseSource} from "../lib/types/content";
const platforms=["apple_music","deezer","tidal"] as const;
const key=process.env.MUSICLINK_API_KEY;
if(!key)throw Error("MUSICLINK_API_KEY missing");
const batch=Number(process.env.MUSICLINK_RELEASE_LIMIT??"10");
if(!Number.isInteger(batch)||batch<1||batch>35)throw Error("Limit must be 1-35");
const cacheFile="musiclink-release-progress.json";
type Candidate={releaseId:string;platform:string;spotifyAlbumId?:string;url:string;source:"musiclink";verified:false};
type Progress={attempted:string[];candidates:Candidate[]};
const progress:Progress=existsSync(cacheFile)?JSON.parse(readFileSync(cacheFile,"utf8")):{attempted:[],candidates:[]};
const attempted=new Set(progress.attempted);
const releases=readdirSync("content/releases").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(readFileSync(join("content/releases",f),"utf8")) as ReleaseSource).filter(r=>r.spotifyAlbumUrl);
const work=releases.flatMap(release=>platforms.filter(platform=>!release.streamingLinks[platform==="apple_music"?"appleMusic":platform]).map(platform=>({release,platform,key:release.id+":"+platform}))).filter(item=>!attempted.has(item.key)).slice(0,batch);
const lines=["# MusicLink all-catalog progress","","Read-only candidates; no streaming URLs are published.","","| Release | Platform | Status |","|---|---|---|"];
const safe=(s:unknown)=>String(s??"").replaceAll("|","/").replaceAll("\n"," ").slice(0,200);
const save=()=>{
 writeFileSync(cacheFile,JSON.stringify(progress,null,2)+"\n");
 writeFileSync("musiclink-release-candidates.json",JSON.stringify(progress.candidates,null,2)+"\n");
 writeFileSync("musiclink-release-preview.md",lines.join("\n")+"\n");
};
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 for(const item of work){
  const url=new URL("https://api.musiclink.one/v2/convert");
  url.searchParams.set("q",item.release.spotifyAlbumUrl!);url.searchParams.set("to",item.platform);
  let status="Unavailable";let retry=false;
  try{
   const res=await fetch(url,{headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(30000)});
   if(res.ok){
    const data=await res.json() as {success?:boolean;data?:{to?:{value?:unknown}}};
    const target=data.data?.to?.value;
    const host:Record<string,string[]>={apple_music:["music.apple.com"],deezer:["www.deezer.com","deezer.com"],tidal:["listen.tidal.com","tidal.com"]};
    if(data.success&&typeof target==="string"){
     const parsed=new URL(target);
     if(parsed.protocol==="https:"&&host[item.platform].includes(parsed.hostname)&&parsed.pathname.includes("/album/")){
      progress.candidates.push({releaseId:item.release.id,platform:item.platform,spotifyAlbumId:item.release.spotifyAlbumId,url:target,source:"musiclink",verified:false});
      status="Candidate saved for review";
     }else status="Unexpected link format";
    }else status="No release link returned";
   }else{status="HTTP "+res.status;retry=[401,403,429,500,502,503,504].includes(res.status);}
  }catch(e){status="Request failed";retry=true;}
  lines.push("| "+[item.release.title,item.platform,status].map(safe).join(" | ")+" |");
  if(retry){save();console.warn("Stopped on retryable error; this item will be retried next run: "+status);return;}
  progress.attempted.push(item.key);attempted.add(item.key);save();
  await sleep(7000);
 }
 console.log("Batch completed: "+work.length+" conversions; "+progress.attempted.length+" completed total; "+progress.candidates.length+" unverified links.");
 save();
}
main().catch(e=>{console.error(e);process.exitCode=1});
