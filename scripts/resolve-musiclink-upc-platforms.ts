#!/usr/bin/env tsx
/** Read-only, release-safe multi-platform MusicLink resolution. */
import {readFileSync,readdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import type {ReleaseSource,StreamingPlatform} from "../lib/types/content";
const apiKey=process.env.MUSICLINK_API_KEY;
if(!apiKey)throw Error("MUSICLINK_API_KEY missing");
const mapping:Record<string,{platform:StreamingPlatform;hosts:string[]}>={
 apple_music:{platform:"appleMusic",hosts:["music.apple.com"]},
 deezer:{platform:"deezer",hosts:["deezer.com","www.deezer.com"]},
 tidal:{platform:"tidal",hosts:["tidal.com","listen.tidal.com"]},
 amazon_music:{platform:"amazonMusic",hosts:["music.amazon.com"]},
 youtube_music:{platform:"youtubeMusic",hosts:["music.youtube.com"]},
 soundcloud:{platform:"soundcloud",hosts:["soundcloud.com","www.soundcloud.com"]},
 bandcamp:{platform:"bandcamp",hosts:["bandcamp.com"]}
};
type Approved={releaseId:string;platform:StreamingPlatform;url:string;approved:true;upc:string};
type Review={releaseId:string;title:string;reason:string;expectedUpc?:string;observedUpc?:string};
const approved:Approved[]=[];const review:Review[]=[];
const releases=readdirSync("content/releases").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(readFileSync(join("content/releases",f),"utf8")) as ReleaseSource).filter(r=>r.spotifyAlbumUrl);
const normalize=(v:string)=>v.replace(/\D/g,"").replace(/^0+(?=\d)/,"");
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
for(const release of releases){
 const fail=(reason:string,observedUpc?:string)=>review.push({releaseId:release.id,title:release.title,reason,expectedUpc:release.upc,observedUpc});
 if(!release.upc||!/^\d{8,14}$/.test(release.upc)){fail("missing_catalog_upc");continue;}
 try{
  const endpoint=new URL("https://api.musiclink.one/v2/resolve");
  endpoint.searchParams.set("q",release.spotifyAlbumUrl!);
  const response=await fetch(endpoint,{headers:{Authorization:"Bearer "+apiKey},signal:AbortSignal.timeout(30000)});
  if(!response.ok){fail("http_"+response.status);if([401,403,429,500,502,503,504].includes(response.status))break;continue;}
  const payload=await response.json() as {success?:boolean;data?:Array<{type?:string;upc?:string;platforms?:Record<string,string>;track_count?:number}>};
  if(!payload.success||!Array.isArray(payload.data)){fail("invalid_response");continue;}
  const matches=payload.data.filter(item=>item.type==="album"&&item.upc&&normalize(item.upc)===normalize(release.upc));
  if(matches.length!==1){fail(matches.length?"ambiguous_upc":"no_matching_upc",payload.data.find(i=>i.type==="album")?.upc);continue;}
  const item=matches[0];
  if(item.track_count!==undefined&&item.track_count!==release.trackIds.length){fail("track_count_mismatch",item.upc);continue;}
  let found=0;
  for(const [key,config] of Object.entries(mapping)){
   const raw=item.platforms?.[key];
   if(typeof raw!=="string"||release.streamingLinks[config.platform])continue;
   try{
    const url=new URL(raw);
    if(url.protocol!=="https:"||!config.hosts.some(host=>url.hostname===host||url.hostname.endsWith("."+host)))continue;
    if(["apple_music","deezer","tidal"].includes(key)&&!url.pathname.includes("/album/"))continue;
    approved.push({releaseId:release.id,platform:config.platform,url:raw,approved:true,upc:release.upc});found++;
   }catch{}
  }
  if(!found)fail("no_new_supported_platform_links",item.upc);
 }catch{fail("request_or_parse_error");}
 await sleep(1500);
}
writeFileSync("musiclink-resolve-upc-approved.json",JSON.stringify(approved,null,2)+"\n");
writeFileSync("musiclink-resolve-upc-review.json",JSON.stringify(review,null,2)+"\n");
writeFileSync("musiclink-resolve-upc-report.md",["# MusicLink UPC-based multi-platform resolution","","Release identity: Spotify album UPC must match MusicLink album UPC. ISRC is never used.","","- Releases checked: "+releases.length,"- UPC-matched candidate links: "+approved.length,"- Releases requiring review: "+review.length,"","No links were published. Review the output before applying.",""].join("\n"));
console.log("UPC resolve: "+approved.length+" candidate links; "+review.length+" releases for review.");
