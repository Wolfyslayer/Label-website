/** Official Spotify artist IDs — never resolve by name search. */
export const SPOTIFY_LABEL_ARTISTS = {
  frostmark: {
    spotifyArtistId: "0edDVF0bL7PFu2Sc3ijDrP",
    contentArtistId: "artist-frostmark",
    slug: "frostmark",
    name: "Frostmark",
  },
  wolfyslayer: {
    spotifyArtistId: "4B4kHkS5D9gK6Q3lNbDPml",
    contentArtistId: "artist-wolfyslayer",
    slug: "wolfyslayer",
    name: "Wolfyslayer",
  },
} as const;

export type LabelSpotifyArtistKey = keyof typeof SPOTIFY_LABEL_ARTISTS;

export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/** Prefer Swedish catalog; falls back via API if some items are region-locked. */
export const SPOTIFY_MARKET = "SE";

/** Spotify Web API max for `GET /artists/{id}/albums` (not 50). */
export const SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT = 10;

/** Spotify Web API max for `GET /albums/{id}/tracks`. */
export const SPOTIFY_ALBUM_TRACKS_PAGE_LIMIT = 50;

export const PLACEHOLDER_RELEASE_IDS = [
  "release-frostmark-placeholder-01",
  "release-wolfyslayer-upcoming-01",
] as const;

export const PLACEHOLDER_TRACK_IDS = ["track-frostmark-01"] as const;

export const PLACEHOLDER_RELEASE_FILES = [
  "frostmark-placeholder-release.json",
  "wolfyslayer-upcoming-placeholder.json",
] as const;

export const PLACEHOLDER_TRACK_FILES = ["frostmark-placeholder-track.json"] as const;

export const DEFAULT_RELEASE_DESCRIPTION = {
  en: "Official release available on Spotify.",
  sv: "Officiell release tillgänglig på Spotify.",
} as const;
