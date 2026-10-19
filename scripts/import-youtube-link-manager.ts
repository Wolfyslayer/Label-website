#!/usr/bin/env tsx
/**
 * GitHub Actions-backed manual YouTube Music link manager.
 * No public editing endpoint or credentials in the static website.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Track = { id: string; title: string; artistId: string; spotifyTrackId?: string; youtubeMusicTrackUrl?: string };
type Release = { id: string; title: string; artistId: string; spotifyAlbumId?: string; streamingLinks: Record<string, string | undefined> };
const root = process.cwd();
const tracksDir = join(root, "content/tracks");
const releasesDir = join(root, "content/releases");
const readEntries = <T>(dir: string) => readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => ({ path: join(dir, name), value: JSON.parse(readFileSync(join(dir, name), "utf8")) as T }));
const save = (path: string, value: unknown) => writeFileSync(path, JSON.stringify(value, null, 2) + "\n");

function verifiedMusicUrl(input: string, kind: "track" | "release") {
  const url = new URL(input);
  if (url.protocol !== "https:" || url.hostname !== "music.youtube.com" || url.username || url.password || url.port || url.hash) {
    throw new Error("Only direct https://music.youtube.com links are accepted.");
  }
  const id = url.searchParams.get(kind === "track" ? "v" : "list");
  if (kind === "track" && (url.pathname !== "/watch" || !id || !/^[A-Za-z0-9_-]{11}$/.test(id))) {
    throw new Error("Track URL must be https://music.youtube.com/watch?v=VIDEO_ID.");
  }
  if (kind === "release" && (url.pathname !== "/playlist" || !id || !/^[A-Za-z0-9_-]{10,}$/.test(id))) {
    throw new Error("Release URL must be https://music.youtube.com/playlist?list=PLAYLIST_ID.");
  }
  return kind === "track" ? `https://music.youtube.com/watch?v=${id}` : `https://music.youtube.com/playlist?list=${id}`;
}
function report() {
  const tracks = readEntries<Track>(tracksDir);
  const releases = readEntries<Release>(releasesDir);
  const artists: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
  const lines = ["# YouTube Music link coverage", "", "| Artist | Title | Type | Spotify ID | Status |", "|---|---|---|---|---|"];
  for (const { value: t } of tracks) {
    if (!artists[t.artistId]) continue;
    lines.push(`| ${artists[t.artistId]} | ${t.title.replaceAll("|", "\\|")} | Track | \`${t.spotifyTrackId ?? "—"}\` | ${t.youtubeMusicTrackUrl ? "Linked" : "Missing"} |`);
  }
  for (const { value: r } of releases) {
    if (!artists[r.artistId]) continue;
    lines.push(`| ${artists[r.artistId]} | ${r.title.replaceAll("|", "\\|")} | Release | \`${r.spotifyAlbumId ?? "—"}\` | ${r.streamingLinks?.youtubeMusic ? "Linked" : "Missing"} |`);
  }
  writeFileSync(join(root, "youtube-music-coverage.md"), lines.join("\n") + "\n");
  console.log(`Report created: ${tracks.length} tracks, ${releases.length} releases scanned.`);
}
function update(kind: "track" | "release", spotifyId: string, urlInput: string) {
  if (!spotifyId || !urlInput) throw new Error("Spotify ID and YouTube Music URL are required.");
  const url = verifiedMusicUrl(urlInput, kind);
  if (kind === "track") {
    const matches = readEntries<Track>(tracksDir).filter(({ value }) => value.spotifyTrackId === spotifyId);
    if (matches.length !== 1) throw new Error(`Expected exactly one Spotify track ID match, found ${matches.length}.`);
    const { path, value } = matches[0];
    if (value.youtubeMusicTrackUrl === url) return console.log("Already linked; no changes.");
    value.youtubeMusicTrackUrl = url;
    save(path, value);
    return console.log(`Updated ${value.title}`);
  }
  const matches = readEntries<Release>(releasesDir).filter(({ value }) => value.spotifyAlbumId === spotifyId);
  if (matches.length !== 1) throw new Error(`Expected exactly one Spotify album ID match, found ${matches.length}.`);
  const { path, value } = matches[0];
  value.streamingLinks ??= {};
  if (value.streamingLinks.youtubeMusic === url) return console.log("Already linked; no changes.");
  value.streamingLinks.youtubeMusic = url;
  save(path, value);
  console.log(`Updated ${value.title}`);
}
const [action, spotifyId, url] = process.argv.slice(2);
try {
  if (action === "report") report();
  else if (action === "set-track" || action === "set-release") update(action === "set-track" ? "track" : "release", spotifyId, url);
  else throw new Error("Usage: import-youtube-link-manager.ts report | set-track SPOTIFY_ID MUSIC_URL | set-release SPOTIFY_ALBUM_ID MUSIC_URL");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
