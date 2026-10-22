#!/usr/bin/env tsx
/** MusicLink Spotify release -> streaming platform links. Read-only preview.
 * Unlike track conversion, release URLs must be checked for album/single identity.
 */
import { readFileSync,readdirSync,writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReleaseSource } from "../lib/types/content";
const platforms = ["apple_music","deezer","tidal","amazon_music","youtube_music"] as const;
const key = process.env.MUSICLINK_API_KEY;
if(!key) throw new Error("MUSICLINK_API_KEY missing");
const limit=Number(process.env.MUSICLINK_RELEASE_LIMIT??"3");
if(!Number.isInteger(limit)||limit<1||limit>20) throw new Error("MUSICLINK_RELEASE_LIMIT must be 1-20");
const releases=readdirSync("content/releases").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(readFileSync(join("content/releases",f),"utf8")) as ReleaseSource).filter(r=>!!r.spotifyAlbumUrl).slice(0,limit);
const rows=["# MusicLink release conversion preview","","No catalog changes. Candidate URLs are not verified until album/single identity is checked.","","| Release | Platform | Result |","|---|---|---|"];
const results:unknown[]=[];
const safe=(s:unknown)=>String(s??"").replaceAll("|","/").replaceAll("\n"," ").slice(0,220);
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 for(const release of releases){
  for(const platform of platforms){
   const url=new URL("https://api.musiclink.one/v2/convert");
   url.searchParams.set("q",release.spotifyAlbumUrl!);
   url.searchParams.set("to",platform);
   let result="Unavailable";
   try{
    const res=await fetch(url,{headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(30000)});
    if(res.ok){
     const data=await res.json() as {success?:boolean;data?:{to?:{value?:unknown};item?:{title?:string;artist?:string}}};
     const target=data.data?.to?.value;
     if(data.success&&typeof target==="string"&&/^https:\/\//.test(target)){
      results.push({releaseId:release.id,platform,spotifyAlbumId:release.spotifyAlbumId,url:target,source:"musiclink",verified:false});
      result="Candidate: "+target;
     }else result="No release link returned";
    }else{
     result="HTTP "+res.status;
     if([401,403,429].includes(res.status)){rows.push("| "+[release.title,platform,result].map(safe).join(" | ")+" |");writeFileSync("musiclink-release-preview.md",rows.join("\n")+"\n");writeFileSync("musiclink-release-candidates.json",JSON.stringify(results,null,2)+"\n");return;}
    }
   }catch(e){result="Request failed: "+String(e).slice(0,60)}
   rows.push("| "+[release.title,platform,result].map(safe).join(" | ")+" |");
   await sleep(7000);
  }
 }
 writeFileSync("musiclink-release-preview.md",rows.join("\n")+"\n");
 writeFileSync("musiclink-release-candidates.json",JSON.stringify(results,null,2)+"\n");
 console.log("MusicLink preview completed. "+results.length+" unverified release links; no catalog edits.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
