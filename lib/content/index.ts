import { seedContent } from "@/lib/data/seed";
import type {
  Artist,
  NewsArticle,
  Release,
  SiteContent,
  Track,
} from "@/lib/types/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function published<T extends { status: string }>(items: T[]): T[] {
  return items.filter((item) => item.status === "published");
}

function byDateDesc(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

async function loadContent(): Promise<SiteContent> {
  if (isSupabaseConfigured()) {
    try {
      const { fetchContentFromDb } = await import("@/lib/content/db");
      const dbContent = await fetchContentFromDb();
      if (dbContent) return dbContent;
    } catch {
      // Fall back to seed when DB is unavailable
    }
  }
  return seedContent;
}

export async function getSiteContent(): Promise<SiteContent> {
  return loadContent();
}

export async function getPublishedArtists(): Promise<Artist[]> {
  const content = await loadContent();
  return published(content.artists);
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const artists = await getPublishedArtists();
  return artists.find((a) => a.slug === slug) ?? null;
}

export async function getPublishedReleases(): Promise<Release[]> {
  const content = await loadContent();
  return published(content.releases).sort((a, b) =>
    byDateDesc(a.releaseAt, b.releaseAt),
  );
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  const releases = await getPublishedReleases();
  return releases.find((r) => r.slug === slug) ?? null;
}

export async function getTracksForRelease(releaseId: string): Promise<Track[]> {
  const content = await loadContent();
  return content.tracks
    .filter((t) => t.releaseId === releaseId)
    .sort((a, b) => a.trackNumber - b.trackNumber);
}

export async function getPublishedNews(): Promise<NewsArticle[]> {
  const content = await loadContent();
  return published(content.news).sort((a, b) =>
    byDateDesc(a.publishedAt, b.publishedAt),
  );
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const news = await getPublishedNews();
  return news.find((n) => n.slug === slug) ?? null;
}

export function isReleaseUpcoming(release: Release, now = new Date()): boolean {
  return new Date(release.releaseAt).getTime() > now.getTime();
}

export async function getUpcomingReleases(): Promise<Release[]> {
  const releases = await getPublishedReleases();
  const now = new Date();
  return releases
    .filter((r) => isReleaseUpcoming(r, now))
    .sort((a, b) => new Date(a.releaseAt).getTime() - new Date(b.releaseAt).getTime());
}

export async function getReleasedCatalog(): Promise<Release[]> {
  const releases = await getPublishedReleases();
  const now = new Date();
  return releases.filter((r) => !isReleaseUpcoming(r, now));
}

export async function getFeaturedRelease(): Promise<Release | null> {
  const content = await loadContent();
  const releases = await getPublishedReleases();
  if (content.featuredReleaseId) {
    const featured = releases.find((r) => r.id === content.featuredReleaseId);
    if (featured) return featured;
  }
  return releases[0] ?? null;
}

export async function getLabelInfo() {
  const content = await loadContent();
  return content.label;
}

export async function getPressAssets() {
  const content = await loadContent();
  return content.pressAssets;
}

export async function getHomepageNews(limit = 3) {
  const content = await loadContent();
  const all = await getPublishedNews();
  const featured = content.homepageFeaturedNewsIds
    .map((id) => all.find((n) => n.id === id))
    .filter(Boolean) as NewsArticle[];
  const rest = all.filter((n) => !content.homepageFeaturedNewsIds.includes(n.id));
  return [...featured, ...rest].slice(0, limit);
}
