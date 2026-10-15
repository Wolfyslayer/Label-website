import type { ImageAssetSource, LocalizedString, SiteContentSource } from "@/lib/types/content";
import { createClient } from "@/lib/supabase/server";

function asLocalized(value: unknown): LocalizedString {
  if (typeof value === "string") return { en: value };
  if (value && typeof value === "object" && "en" in value) {
    const v = value as LocalizedString;
    return { en: v.en ?? "", sv: v.sv };
  }
  return { en: "" };
}

function asImageAsset(value: unknown): ImageAssetSource {
  if (value && typeof value === "object" && "src" in value) {
    const v = value as ImageAssetSource & { alt?: unknown };
    return {
      src: String(v.src),
      alt: asLocalized(v.alt),
      placeholder: Boolean(v.placeholder),
    };
  }
  return { src: "", alt: { en: "" }, placeholder: true };
}

/** Loads published content from Supabase when tables exist; returns null to fall back to seed. */
export async function fetchContentFromDb(): Promise<SiteContentSource | null> {
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
    tagline: asLocalized(row.tagline ?? row.tagline_i18n),
    shortBio: asLocalized(row.short_bio ?? row.short_bio_i18n),
    longBio: asLocalized(row.long_bio ?? row.long_bio_i18n),
    theme: (row.theme as "frost" | "wolf") ?? "frost",
    image: asImageAsset(row.image),
    heroImage: row.hero_image ? asImageAsset(row.hero_image) : undefined,
    spotifyArtistUrl: (row.spotify_artist_url as string) ?? "",
    streamingLinks:
      (row.streaming_links as SiteContentSource["artists"][0]["streamingLinks"]) ?? {},
    socialLinks:
      (row.social_links as SiteContentSource["artists"][0]["socialLinks"]) ?? {},
    featuredTrackIds: (row.featured_track_ids as string[]) ?? [],
    featuredReleaseIds: (row.featured_release_ids as string[] | undefined) ?? undefined,
    status: row.status as "draft" | "published",
  });

  const mapRelease = (row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    artistId: row.artist_id as string,
    type: row.type as SiteContentSource["releases"][0]["type"],
    releaseDate: row.release_date as string,
    releaseAt: row.release_at as string,
    description: asLocalized(row.description ?? row.description_i18n),
    credits: row.credits ? asLocalized(row.credits) : undefined,
    cover: asImageAsset(row.cover),
    streamingLinks:
      (row.streaming_links as SiteContentSource["releases"][0]["streamingLinks"]) ?? {},
    spotifyAlbumUrl: row.spotify_album_url as string | undefined,
    trackIds: (row.track_ids as string[]) ?? [],
    featured: Boolean(row.featured),
    status: row.status as "draft" | "published",
    preSaveUrl: row.pre_save_url as string | undefined,
  });

  return {
    label: {
      story: asLocalized(settingsRes.data?.label_story ?? settingsRes.data?.label_story_i18n),
      mission: asLocalized(settingsRes.data?.label_mission ?? settingsRes.data?.label_mission_i18n),
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
      title: asLocalized(row.title ?? row.title_i18n),
      excerpt: asLocalized(row.excerpt ?? row.excerpt_i18n),
      body: asLocalized(row.body ?? row.body_i18n),
      publishedAt: row.published_at as string,
      artistId: row.artist_id as string | undefined,
      releaseId: row.release_id as string | undefined,
      cover: asImageAsset(row.cover),
      status: row.status as "draft" | "published",
    })),
    pressAssets: (pressRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: asLocalized(row.title ?? row.title_i18n),
      type: row.type as "photo" | "logo" | "epk",
      artistId: row.artist_id as string | undefined,
      downloadUrl: row.download_url as string | undefined,
      src: row.src as string,
      alt: asLocalized(row.alt ?? row.alt_i18n),
      placeholder: Boolean(row.placeholder),
    })),
  };
}
