import type { SiteContent } from "@/lib/types/content";
import { createClient } from "@/lib/supabase/server";

/** Loads published content from Supabase when tables exist; returns null to fall back to seed. */
export async function fetchContentFromDb(): Promise<SiteContent | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    artistsRes,
    releasesRes,
    tracksRes,
    newsRes,
    settingsRes,
    pressRes,
  ] = await Promise.all([
    supabase.from("artists").select("*").eq("status", "published"),
    supabase.from("releases").select("*").eq("status", "published"),
    supabase.from("tracks").select("*"),
    supabase.from("news").select("*").eq("status", "published"),
    supabase.from("site_settings").select("*").maybeSingle(),
    supabase.from("press_assets").select("*"),
  ]);

  if (artistsRes.error || releasesRes.error) {
    return null;
  }

  const mapArtist = (row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    tagline: (row.tagline as string) ?? "",
    shortBio: (row.short_bio as string) ?? "",
    longBio: (row.long_bio as string) ?? "",
    theme: (row.theme as "frost" | "wolf") ?? "frost",
    image: row.image as SiteContent["artists"][0]["image"],
    heroImage: row.hero_image as SiteContent["artists"][0]["heroImage"],
    spotifyArtistUrl: (row.spotify_artist_url as string) ?? "",
    streamingLinks: (row.streaming_links as SiteContent["artists"][0]["streamingLinks"]) ?? {},
    socialLinks: (row.social_links as SiteContent["artists"][0]["socialLinks"]) ?? {},
    featuredTrackIds: (row.featured_track_ids as string[]) ?? [],
    status: row.status as "draft" | "published",
  });

  const mapRelease = (row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    artistId: row.artist_id as string,
    type: row.type as SiteContent["releases"][0]["type"],
    releaseDate: row.release_date as string,
    releaseAt: row.release_at as string,
    description: (row.description as string) ?? "",
    credits: row.credits as string | undefined,
    cover: row.cover as SiteContent["releases"][0]["cover"],
    streamingLinks: (row.streaming_links as SiteContent["releases"][0]["streamingLinks"]) ?? {},
    spotifyAlbumUrl: row.spotify_album_url as string | undefined,
    trackIds: (row.track_ids as string[]) ?? [],
    featured: Boolean(row.featured),
    status: row.status as "draft" | "published",
    preSaveUrl: row.pre_save_url as string | undefined,
  });

  return {
    label: {
      story: (settingsRes.data?.label_story as string) ?? "",
      mission: (settingsRes.data?.label_mission as string) ?? "",
    },
    featuredReleaseId: (settingsRes.data?.featured_release_id as string) ?? null,
    homepageFeaturedNewsIds:
      (settingsRes.data?.homepage_featured_news_ids as string[]) ?? [],
    artists: (artistsRes.data ?? []).map(mapArtist),
    releases: (releasesRes.data ?? []).map(mapRelease),
    tracks: (tracksRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      artistId: row.artist_id as string,
      releaseId: row.release_id as string,
      trackNumber: row.track_number as number,
      durationSeconds: row.duration_seconds as number | undefined,
      spotifyTrackUrl: row.spotify_track_url as string | undefined,
    })),
    news: (newsRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: row.excerpt as string,
      body: row.body as string,
      publishedAt: row.published_at as string,
      artistId: row.artist_id as string | undefined,
      releaseId: row.release_id as string | undefined,
      cover: row.cover as SiteContent["news"][0]["cover"],
      status: row.status as "draft" | "published",
    })),
    pressAssets: (pressRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      type: row.type as "photo" | "logo" | "epk",
      artistId: row.artist_id as string | undefined,
      downloadUrl: row.download_url as string | undefined,
      src: row.src as string,
      alt: row.alt as string,
      placeholder: Boolean(row.placeholder),
    })),
  };
}
