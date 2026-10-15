export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type SpotifyArtistRef = {
  id: string;
  name: string;
};

export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifySimplifiedAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  total_tracks: number;
  external_urls: { spotify?: string };
  artists: SpotifyArtistRef[];
  images: SpotifyImage[];
  album_group?: string;
};

export type SpotifyAlbumsPage = {
  items: SpotifySimplifiedAlbum[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  track_number: number;
  disc_number: number;
  duration_ms: number;
  external_urls: { spotify?: string };
  artists: SpotifyArtistRef[];
};

export type SpotifyAlbumTracksPage = {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

export type SpotifyFullAlbum = SpotifySimplifiedAlbum & {
  tracks: SpotifyAlbumTracksPage;
};

export type FetchLike = typeof fetch;
