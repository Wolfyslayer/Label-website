import {
  SPOTIFY_ALBUM_TRACKS_PAGE_LIMIT,
  SPOTIFY_API_BASE,
  SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT,
  SPOTIFY_MARKET,
} from "@/lib/spotify/constants";
import { spotifyGetJson, type SpotifyHttpOptions } from "@/lib/spotify/http";
import type {
  SpotifyAlbumsPage,
  SpotifyFullAlbum,
  SpotifySimplifiedAlbum,
} from "@/lib/spotify/types";

const ALBUM_GROUPS = "album,single";

export async function fetchArtistAlbumsPage(
  accessToken: string,
  spotifyArtistId: string,
  offset: number,
  limit: number,
  options: SpotifyHttpOptions = {},
): Promise<SpotifyAlbumsPage> {
  const params = new URLSearchParams({
    include_groups: ALBUM_GROUPS,
    market: SPOTIFY_MARKET,
    limit: String(limit),
    offset: String(offset),
  });
  const url = `${SPOTIFY_API_BASE}/artists/${spotifyArtistId}/albums?${params}`;
  return spotifyGetJson<SpotifyAlbumsPage>(url, accessToken, options);
}

export async function fetchAllArtistAlbums(
  accessToken: string,
  spotifyArtistId: string,
  options: SpotifyHttpOptions = {},
): Promise<SpotifySimplifiedAlbum[]> {
  const limit = SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT;
  let offset = 0;
  const all: SpotifySimplifiedAlbum[] = [];
  while (true) {
    const page = await fetchArtistAlbumsPage(accessToken, spotifyArtistId, offset, limit, options);
    all.push(...page.items);
    if (!page.next || page.items.length === 0) break;
    offset += page.items.length;
    if (offset >= page.total) break;
  }
  return all;
}

export async function fetchAlbumWithTracks(
  accessToken: string,
  albumId: string,
  options: SpotifyHttpOptions = {},
): Promise<SpotifyFullAlbum> {
  const params = new URLSearchParams({ market: SPOTIFY_MARKET });
  const url = `${SPOTIFY_API_BASE}/albums/${albumId}?${params}`;
  return spotifyGetJson<SpotifyFullAlbum>(url, accessToken, options);
}

export async function fetchAllAlbumTracks(
  accessToken: string,
  albumId: string,
  options: SpotifyHttpOptions = {},
): Promise<SpotifyFullAlbum["tracks"]["items"]> {
  const limit = SPOTIFY_ALBUM_TRACKS_PAGE_LIMIT;
  let offset = 0;
  const items: SpotifyFullAlbum["tracks"]["items"] = [];
  while (true) {
    const params = new URLSearchParams({
      market: SPOTIFY_MARKET,
      limit: String(limit),
      offset: String(offset),
    });
    const url = `${SPOTIFY_API_BASE}/albums/${albumId}/tracks?${params}`;
    const page = await spotifyGetJson<SpotifyFullAlbum["tracks"]>(url, accessToken, options);
    items.push(...page.items);
    if (!page.next || page.items.length === 0) break;
    offset += page.items.length;
    if (offset >= page.total) break;
  }
  return items;
}
