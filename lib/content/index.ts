import { seedContent } from "@/lib/data/seed";
import {
  localizeArtist,
  localizeLabel,
  localizeNews,
  localizePressAsset,
  localizeRelease,
} from "@/lib/content/localize";
import type {
  Artist,
  LabelInfo,
  NewsArticle,
  PressAsset,
  Release,
  SiteContent,
  SiteContentSource,
  Track,
} from "@/lib/types/content";
import type { AppLocale } from "@/i18n/routing";
import { isReleaseUpcoming } from "@/lib/content/releases";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function published<T extends { status: string }>(items: T[]): T[] {
  return items.filter((item) => item.status === "published");
}

function byDateDesc(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

async function loadContentSource(): Promise<SiteContentSource> {
  // The public static catalog is sourced from the imported content/ files.
  // A configured Supabase project must not silently replace it with empty tables.
  // Database-backed content is opt-in for environments explicitly using the CMS.
  if (process.env.CONTENT_SOURCE === "supabase" && isSupabaseConfigured()) {
    try {
      const { fetchContentFromDb } = await import("@/lib/content/db");
      const dbContent = await fetchContentFromDb();
      if (dbContent && dbContent.artists.length > 0 && dbContent.releases.length > 0) {
        return dbContent;
      }
    } catch {
      // Fall back to the imported static catalog.
    }
  }
  return seedContent;
}

async function loadContent(locale: AppLocale): Promise<SiteContent> {
  const source = await loadContentSource();
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

export async function getSiteContent(locale: AppLocale): Promise<SiteContent> {
  return loadContent(locale);
}

export async function getPublishedArtists(locale: AppLocale): Promise<Artist[]> {
  const source = await loadContentSource();
  return published(source.artists).map((a) => localizeArtist(a, locale));
}

export async function getArtistBySlug(
  slug: string,
  locale: AppLocale,
): Promise<Artist | null> {
  const artists = await getPublishedArtists(locale);
  return artists.find((a) => a.slug === slug) ?? null;
}

export async function getArtistById(
  id: string,
  locale: AppLocale,
): Promise<Artist | null> {
  const artists = await getPublishedArtists(locale);
  return artists.find((a) => a.id === id) ?? null;
}

export async function getPublishedReleases(locale: AppLocale): Promise<Release[]> {
  const source = await loadContentSource();
  return published(source.releases)
    .map((r) => localizeRelease(r, locale))
    .sort((a, b) => byDateDesc(a.releaseAt, b.releaseAt));
}

export async function getReleaseBySlug(
  slug: string,
  locale: AppLocale,
): Promise<Release | null> {
  const releases = await getPublishedReleases(locale);
  return releases.find((r) => r.slug === slug) ?? null;
}

export async function getReleaseById(
  id: string,
  locale: AppLocale,
): Promise<Release | null> {
  const releases = await getPublishedReleases(locale);
  return releases.find((r) => r.id === id) ?? null;
}

export async function getTracksForRelease(releaseId: string): Promise<Track[]> {
  const source = await loadContentSource();
  return source.tracks
    .filter((t) => t.releaseId === releaseId)
    .sort((a, b) => a.trackNumber - b.trackNumber);
}

export async function getPublishedNews(locale: AppLocale): Promise<NewsArticle[]> {
  const source = await loadContentSource();
  return published(source.news)
    .map((n) => localizeNews(n, locale))
    .sort((a, b) => byDateDesc(a.publishedAt, b.publishedAt));
}

export async function getNewsBySlug(
  slug: string,
  locale: AppLocale,
): Promise<NewsArticle | null> {
  const news = await getPublishedNews(locale);
  return news.find((n) => n.slug === slug) ?? null;
}

export { isReleaseUpcoming } from "@/lib/content/releases";

export async function getUpcomingReleases(locale: AppLocale): Promise<Release[]> {
  const releases = await getPublishedReleases(locale);
  const now = new Date();
  return releases
    .filter((r) => isReleaseUpcoming(r, now))
    .sort((a, b) => new Date(a.releaseAt).getTime() - new Date(b.releaseAt).getTime());
}

export async function getReleasedCatalog(locale: AppLocale): Promise<Release[]> {
  const releases = await getPublishedReleases(locale);
  const now = new Date();
  return releases.filter((r) => !isReleaseUpcoming(r, now));
}

export async function getFeaturedRelease(locale: AppLocale): Promise<Release | null> {
  const source = await loadContentSource();
  const { pickFeaturedReleaseId } = await import("@/lib/content/featured-release");
  const id = pickFeaturedReleaseId(source.releases, source.featuredReleaseId);
  if (!id) return null;
  const releases = await getPublishedReleases(locale);
  return releases.find((r) => r.id === id) ?? null;
}

export async function getLabelInfo(locale: AppLocale): Promise<LabelInfo> {
  const source = await loadContentSource();
  return localizeLabel(source.label, locale);
}

export async function getPressAssets(locale: AppLocale): Promise<PressAsset[]> {
  const source = await loadContentSource();
  return source.pressAssets.map((p) => localizePressAsset(p, locale));
}

export async function getHomepageNews(locale: AppLocale, limit = 3) {
  const source = await loadContentSource();
  const all = await getPublishedNews(locale);
  const featured = source.homepageFeaturedNewsIds
    .map((id) => all.find((n) => n.id === id))
    .filter(Boolean) as NewsArticle[];
  const rest = all.filter((n) => !source.homepageFeaturedNewsIds.includes(n.id));
  return [...featured, ...rest].slice(0, limit);
}
