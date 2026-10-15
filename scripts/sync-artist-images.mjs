/**
 * Downloads official Spotify profile thumbnails (oEmbed) for roster artists.
 * Run: node scripts/sync-artist-images.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const artists = [
  {
    id: "frostmark",
    url: "https://open.spotify.com/artist/0edDVF0bL7PFu2Sc3ijDrP",
    portrait: "frostmark-raven-portrait.jpg",
    hero: "frostmark-raven-hero.jpg",
  },
  {
    id: "wolfyslayer",
    url: "https://open.spotify.com/artist/4B4kHkS5D9gK6Q3lNbDPml",
    portrait: "wolfyslayer-viking-portrait.jpg",
    hero: "wolfyslayer-viking-hero.jpg",
  },
];

const publicDir = join(process.cwd(), "public", "artists");

for (const artist of artists) {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(artist.url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`oEmbed failed for ${artist.id}`);
  const data = await res.json();
  const thumb = data.thumbnail_url;
  if (!thumb) throw new Error(`No thumbnail for ${artist.id}`);
  const imgRes = await fetch(thumb);
  if (!imgRes.ok) throw new Error(`Thumbnail download failed for ${artist.id}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  writeFileSync(join(publicDir, artist.portrait), buf);
  writeFileSync(join(publicDir, artist.hero), buf);
  console.log(`Synced ${artist.id} → ${artist.portrait}`);
}
