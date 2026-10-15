import type { SpotifyArtistRef, SpotifySimplifiedAlbum } from "@/lib/spotify/types";

/** Release belongs to the label artist if they are credited on the album. */
export function albumBelongsToSpotifyArtist(
  album: SpotifySimplifiedAlbum,
  spotifyArtistId: string,
): boolean {
  return album.artists.some((a) => a.id === spotifyArtistId);
}

export function primaryArtistIds(album: SpotifySimplifiedAlbum): string[] {
  return album.artists.map((a) => a.id);
}

export function collaborationArtistNames(
  album: SpotifySimplifiedAlbum,
  spotifyArtistId: string,
): string[] {
  return album.artists.filter((a) => a.id !== spotifyArtistId).map((a) => a.name);
}

export function trackBelongsToArtist(
  trackArtists: SpotifyArtistRef[],
  spotifyArtistId: string,
): boolean {
  return trackArtists.some((a) => a.id === spotifyArtistId);
}
