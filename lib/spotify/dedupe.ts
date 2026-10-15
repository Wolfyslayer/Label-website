import type { SpotifySimplifiedAlbum } from "@/lib/spotify/types";

const SKIPPED_ALBUM_GROUPS = new Set(["appears_on", "compilation"]);

/** Keep one row per Spotify album id; skip guest/compilation groups. */
export function dedupeSpotifyAlbums(albums: SpotifySimplifiedAlbum[]): SpotifySimplifiedAlbum[] {
  const byId = new Map<string, SpotifySimplifiedAlbum>();
  for (const album of albums) {
    if (album.album_group && SKIPPED_ALBUM_GROUPS.has(album.album_group)) continue;
    if (!byId.has(album.id)) byId.set(album.id, album);
  }
  return [...byId.values()];
}
