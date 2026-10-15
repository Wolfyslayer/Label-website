export type ContentStatus = "draft" | "published";

export type ReleaseType = "album" | "single" | "ep";

export type StreamingPlatform =
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "bandcamp"
  | "soundcloud"
  | "deezer"
  | "tidal";

export type StreamingLinks = Partial<Record<StreamingPlatform, string>>;

export interface Artist {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortBio: string;
  longBio: string;
  theme: "frost" | "wolf";
  image: {
    src: string;
    alt: string;
    /** When true, replace with official photography */
    placeholder: boolean;
  };
  heroImage?: {
    src: string;
    alt: string;
    placeholder: boolean;
  };
  spotifyArtistUrl: string;
  streamingLinks: StreamingLinks;
  socialLinks: Partial<
    Record<"instagram" | "youtube" | "facebook" | "x" | "tiktok", string>
  >;
  featuredTrackIds: string[];
  status: ContentStatus;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  releaseId: string;
  trackNumber: number;
  durationSeconds?: number;
  spotifyTrackUrl?: string;
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  type: ReleaseType;
  releaseDate: string;
  /** ISO timestamp for countdown precision */
  releaseAt: string;
  description: string;
  credits?: string;
  cover: {
    src: string;
    alt: string;
    placeholder: boolean;
  };
  streamingLinks: StreamingLinks;
  spotifyAlbumUrl?: string;
  trackIds: string[];
  featured: boolean;
  status: ContentStatus;
  /** Pre-save URL — only shown when configured */
  preSaveUrl?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  artistId?: string;
  releaseId?: string;
  cover: {
    src: string;
    alt: string;
    placeholder: boolean;
  };
  status: ContentStatus;
}

export interface LabelInfo {
  story: string;
  mission: string;
}

export interface PressAsset {
  id: string;
  title: string;
  type: "photo" | "logo" | "epk";
  artistId?: string;
  downloadUrl?: string;
  src: string;
  alt: string;
  placeholder: boolean;
}

export interface SiteContent {
  artists: Artist[];
  releases: Release[];
  tracks: Track[];
  news: NewsArticle[];
  label: LabelInfo;
  pressAssets: PressAsset[];
  featuredReleaseId: string | null;
  homepageFeaturedNewsIds: string[];
}
