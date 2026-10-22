#!/usr/bin/env tsx
/**
 * Export recording and release identifiers to a workflow artifact only.
 * Does not modify the website catalog or commit identifier data.
 */
import { writeFileSync } from "node:fs";
import { fetchClientCredentialsToken, requireSpotifyCredentials } from "../lib/spotify/auth";
import { importSpotifyCatalog } from "../lib/spotify/import-catalog";
import { fetchAlbumWithTracks } from "../lib/spotify/api";

type SpotifyTrack = { id: string; external_ids?: { isrc?: string } };
type SpotifyAlbum = { id: string; external_ids?: { upc?: string; ean?: string } };
const csv = (value: unknown) => {
  const s = String(value ?? "");
  return '"' + s.replaceAll('"', '""') + '"';
};
async function spotifyGet<T>(token: string, path: string): Promise<T> {
  const response = await fetch("https://api.spotify.com/v1/" + path, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) throw new Error("Spotify metadata HTTP " + response.status + " for " + path);
  return response.json() as Promise<T>;
}
async function main() {
  const { clientId, clientSecret } = requireSpotifyCredentials();
  const token = await fetchClientCredentialsToken(fetch, clientId, clientSecret);
  const catalog = await importSpotifyCatalog(token);
  const trackIds = [...new Set(catalog.tracks.map(t => t.spotifyTrackId).filter((id): id is string => !!id))];
  const albumIds = [...new Set(catalog.releases.map(r => r.spotifyAlbumId).filter((id): id is string => !!id))];
  const tracks = new Map<string, SpotifyTrack>();
  const albums = new Map<string, SpotifyAlbum>();
  // Spotify may reject /v1/tracks with HTTP 403 for this application.
  // Album metadata is already available to the importer; reuse its supported endpoint.
  for (const albumId of albumIds) {
    try {
      const album = await fetchAlbumWithTracks(token, albumId);
      albums.set(albumId, { id: albumId, external_ids: (album as typeof album & { external_ids?: SpotifyAlbum["external_ids"] }).external_ids });
    } catch (error) {
      console.warn("Album identifiers unavailable for " + albumId + ": " + String(error));
    }
  }
  try {
    for (let i = 0; i < trackIds.length; i += 50) {
      const response = await spotifyGet<{ tracks: (SpotifyTrack | null)[] }>(token, "tracks?ids=" + trackIds.slice(i, i + 50).join(","));
      for (const track of response.tracks) if (track?.id) tracks.set(track.id, track);
    }
  } catch (error) {
    console.warn("Spotify track identifier endpoint denied access; exporting available UPCs and blank ISRC cells instead: " + String(error).slice(0, 140));
  }
  const albumByRelease = new Map(catalog.releases.map(r => [r.id, r]));
  const names: Record<string, string> = { "artist-frostmark": "Frostmark", "artist-wolfyslayer": "Wolfyslayer" };
  const rows = [["artist", "release", "track", "spotify_track_id", "isrc", "spotify_album_id", "upc", "ean"]];
  for (const track of catalog.tracks) {
    const release = albumByRelease.get(track.releaseId);
    const albumId = release?.spotifyAlbumId ?? "";
    const ids = albums.get(albumId)?.external_ids;
    rows.push([names[track.artistId] ?? track.artistId, release?.title ?? "", track.title,
      track.spotifyTrackId ?? "", tracks.get(track.spotifyTrackId ?? "")?.external_ids?.isrc ?? "",
      albumId, ids?.upc ?? "", ids?.ean ?? ""]);
  }
  writeFileSync("spotify-identifiers.csv", rows.map(row => row.map(csv).join(",")).join("\n") + "\n", "utf8");
  console.log("Identifier artifact: " + (rows.length - 1) + " tracks, " + tracks.size + " Spotify track metadata results, " + albums.size + " album metadata results.");
  console.log("Missing ISRC values: " + rows.slice(1).filter(row => !row[4]).length + ". Missing UPC values: " + rows.slice(1).filter(row => !row[6]).length + ".");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
