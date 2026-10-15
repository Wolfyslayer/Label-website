import type { AppLocale } from "@/i18n/routing";
import type {
  Artist,
  ArtistSource,
  LabelInfo,
  LabelInfoSource,
  NewsArticle,
  NewsArticleSource,
  PressAsset,
  PressAssetSource,
  Release,
  ReleaseSource,
  SiteContent,
  SiteContentSource,
} from "@/lib/types/content";

export function pickLocalized(
  value: { en: string; sv?: string } | string | undefined,
  locale: AppLocale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const primary = locale === "sv" ? value.sv : value.en;
  if (primary?.trim()) return primary;
  if (value.en?.trim()) return value.en;
  if (value.sv?.trim()) return value.sv;
  return "";
}

export function localizeArtist(source: ArtistSource, locale: AppLocale): Artist {
  return {
    id: source.id,
    slug: source.slug,
    name: source.name,
    tagline: pickLocalized(source.tagline, locale),
    shortBio: pickLocalized(source.shortBio, locale),
    longBio: pickLocalized(source.longBio, locale),
    theme: source.theme,
    image: {
      src: source.image.src,
      alt: pickLocalized(source.image.alt, locale),
      placeholder: source.image.placeholder,
    },
    heroImage: source.heroImage
      ? {
          src: source.heroImage.src,
          alt: pickLocalized(source.heroImage.alt, locale),
          placeholder: source.heroImage.placeholder,
        }
      : undefined,
    spotifyArtistUrl: source.spotifyArtistUrl,
    streamingLinks: source.streamingLinks,
    socialLinks: source.socialLinks,
    featuredTrackIds: source.featuredTrackIds,
    status: source.status,
  };
}

export function localizeRelease(source: ReleaseSource, locale: AppLocale): Release {
  return {
    id: source.id,
    slug: source.slug,
    title: source.title,
    artistId: source.artistId,
    type: source.type,
    releaseDate: source.releaseDate,
    releaseAt: source.releaseAt,
    description: pickLocalized(source.description, locale),
    credits: source.credits ? pickLocalized(source.credits, locale) : undefined,
    cover: {
      src: source.cover.src,
      alt: pickLocalized(source.cover.alt, locale),
      placeholder: source.cover.placeholder,
    },
    streamingLinks: source.streamingLinks,
    spotifyAlbumUrl: source.spotifyAlbumUrl,
    trackIds: source.trackIds,
    featured: source.featured,
    status: source.status,
    preSaveUrl: source.preSaveUrl,
  };
}

export function localizeNews(source: NewsArticleSource, locale: AppLocale): NewsArticle {
  return {
    id: source.id,
    slug: source.slug,
    title: pickLocalized(source.title, locale),
    excerpt: pickLocalized(source.excerpt, locale),
    body: pickLocalized(source.body, locale),
    publishedAt: source.publishedAt,
    artistId: source.artistId,
    releaseId: source.releaseId,
    cover: {
      src: source.cover.src,
      alt: pickLocalized(source.cover.alt, locale),
      placeholder: source.cover.placeholder,
    },
    status: source.status,
  };
}

export function localizeLabel(source: LabelInfoSource, locale: AppLocale): LabelInfo {
  return {
    story: pickLocalized(source.story, locale),
    mission: pickLocalized(source.mission, locale),
  };
}

export function localizePressAsset(source: PressAssetSource, locale: AppLocale): PressAsset {
  return {
    id: source.id,
    title: pickLocalized(source.title, locale),
    type: source.type,
    artistId: source.artistId,
    downloadUrl: source.downloadUrl,
    src: source.src,
    alt: pickLocalized(source.alt, locale),
    placeholder: source.placeholder,
  };
}

export function localizeSiteContent(
  source: SiteContentSource,
  locale: AppLocale,
): SiteContent {
  return {
    artists: source.artists.map((a) => localizeArtist(a, locale)),
    releases: source.releases.map((r) => localizeRelease(r, locale)),
    tracks: source.tracks,
    news: source.news.map((n) => localizeNews(n, locale)),
    label: localizeLabel(source.label, locale),
    pressAssets: source.pressAssets.map((p) => localizePressAsset(p, locale)),
    featuredReleaseId: source.featuredReleaseId,
    homepageFeaturedNewsIds: source.homepageFeaturedNewsIds,
  };
}
