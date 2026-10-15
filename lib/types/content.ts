export type ContentStatus = "draft" | "published";

export type ReleaseType = "album" | "single" | "ep";

/** Admin-editable localized copy (seed + Supabase JSONB). `en` is required fallback. */
export type LocalizedString = {
  en: string;
  sv?: string;
};

export type StreamingPlatform =
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "bandcamp"
  | "soundcloud"
  | "deezer"
  | "tidal";

export type StreamingLinks = Partial<Record<StreamingPlatform, string>>;

export interface ImageAssetSource {
  src: string;
  alt: LocalizedString;
  placeholder: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  placeholder: boolean;
}

export interface ArtistSource {
  id: string;
  slug: string;
  /** Official artist name — not translated */
  name: string;
  tagline: LocalizedString;
  shortBio: LocalizedString;
  longBio: LocalizedString;
  theme: "frost" | "wolf";
  image: ImageAssetSource;
  heroImage?: ImageAssetSource;
  spotifyArtistUrl: string;
  streamingLinks: StreamingLinks;
  socialLinks: Partial<
    Record<"instagram" | "youtube" | "facebook" | "x" | "tiktok", string>
  >;
  featuredTrackIds: string[];
  /** Highlighted on artist profile (managed order) */
  featuredReleaseIds?: string[];
  status: ContentStatus;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortBio: string;
  longBio: string;
  theme: "frost" | "wolf";
  image: ImageAsset;
  heroImage?: ImageAsset;
  spotifyArtistUrl: string;
  streamingLinks: StreamingLinks;
  socialLinks: Partial<
    Record<"instagram" | "youtube" | "facebook" | "x" | "tiktok", string>
  >;
  featuredTrackIds: string[];
  featuredReleaseIds?: string[];
  status: ContentStatus;
}

export interface Track {
  id: string;
  slug: string;
  /** Official track title */
  title: string;
  artistId: string;
  releaseId: string;
  trackNumber: number;
  discNumber?: number;
  durationSeconds?: number;
  spotifyTrackUrl?: string;
  spotifyTrackId?: string;
}

export interface ReleaseSource {
  id: string;
  slug: string;
  /** Official release title */
  title: string;
  artistId: string;
  type: ReleaseType;
  releaseDate: string;
  releaseAt: string;
  releaseDatePrecision?: "year" | "month" | "day";
  description: LocalizedString;
  credits?: LocalizedString;
  cover: ImageAssetSource;
  streamingLinks: StreamingLinks;
  spotifyAlbumUrl?: string;
  spotifyAlbumId?: string;
  trackIds: string[];
  featured: boolean;
  status: ContentStatus;
  preSaveUrl?: string;
  importSource?: "spotify";
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  type: ReleaseType;
  releaseDate: string;
  releaseAt: string;
  releaseDatePrecision?: "year" | "month" | "day";
  description: string;
  credits?: string;
  cover: ImageAsset;
  streamingLinks: StreamingLinks;
  spotifyAlbumUrl?: string;
  spotifyAlbumId?: string;
  trackIds: string[];
  featured: boolean;
  status: ContentStatus;
  preSaveUrl?: string;
  importSource?: "spotify";
}

export interface NewsArticleSource {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  body: LocalizedString;
  publishedAt: string;
  artistId?: string;
  releaseId?: string;
  cover: ImageAssetSource;
  status: ContentStatus;
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
  cover: ImageAsset;
  status: ContentStatus;
}

export interface LabelInfoSource {
  story: LocalizedString;
  mission: LocalizedString;
}

export interface LabelInfo {
  story: string;
  mission: string;
}

export interface PressAssetSource {
  id: string;
  title: LocalizedString;
  type: "photo" | "logo" | "epk";
  artistId?: string;
  downloadUrl?: string;
  src: string;
  alt: LocalizedString;
  placeholder: boolean;
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

export interface SiteContentSource {
  artists: ArtistSource[];
  releases: ReleaseSource[];
  tracks: Track[];
  news: NewsArticleSource[];
  label: LabelInfoSource;
  pressAssets: PressAssetSource[];
  featuredReleaseId: string | null;
  homepageFeaturedNewsIds: string[];
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
