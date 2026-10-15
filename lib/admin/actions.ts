"use server";

import {
  imageAltFromForm,
  readLocalizedField,
  toLocalizedString,
} from "@/lib/admin/i18n-form";
import { revalidatePublicContent } from "@/lib/admin/revalidate-public";
import type { ActionResult } from "@/lib/admin/types";
import {
  artistSchema,
  newsSchema,
  releaseSchema,
  trackSchema,
} from "@/lib/admin/validation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedString } from "@/lib/types/content";

async function adminClient(): Promise<
  | { supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>; user: { id: string } }
  | { error: string }
> {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) return { error: "Unauthorized" };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" };
  return { supabase, user };
}

function parseImageJson(formData: FormData, prefix: string) {
  const src = String(formData.get(`${prefix}_src`) ?? "").trim();
  const alt = imageAltFromForm(formData, prefix);
  const placeholder = formData.get(`${prefix}_placeholder`) === "on";
  return { src, alt, placeholder };
}

function parseStreamingLinks(formData: FormData) {
  const keys = [
    "spotify",
    "appleMusic",
    "youtubeMusic",
    "bandcamp",
    "soundcloud",
    "deezer",
    "tidal",
  ] as const;
  const out: Record<string, string> = {};
  for (const key of keys) {
    const v = String(formData.get(`stream_${key}`) ?? "").trim();
    if (v) out[key] = v;
  }
  return out;
}

function parseSocialLinks(formData: FormData) {
  const keys = ["instagram", "youtube", "facebook", "x", "tiktok"] as const;
  const out: Record<string, string> = {};
  for (const key of keys) {
    const v = String(formData.get(`social_${key}`) ?? "").trim();
    if (v) out[key] = v;
  }
  return out;
}

export async function upsertArtist(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id") || crypto.randomUUID());
  const parsed = artistSchema.safeParse({
    id,
    slug: formData.get("slug"),
    name: formData.get("name"),
    theme: formData.get("theme"),
    status: formData.get("status"),
    spotify_artist_url: formData.get("spotify_artist_url") || "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid artist data" };
  }

  const tagline = toLocalizedString(readLocalizedField(formData, "tagline"));
  const shortBio = toLocalizedString(readLocalizedField(formData, "short_bio"));
  const longBio = toLocalizedString(readLocalizedField(formData, "long_bio"));

  const featuredReleaseIds = String(formData.get("featured_release_ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const image = parseImageJson(formData, "image");
  const heroImage = parseImageJson(formData, "hero_image");
  const streamingLinks = parseStreamingLinks(formData);
  const socialLinks = parseSocialLinks(formData);

  const payload = {
    id: parsed.data.id,
    slug: parsed.data.slug,
    name: parsed.data.name,
    theme: parsed.data.theme,
    status: parsed.data.status,
    spotify_artist_url: parsed.data.spotify_artist_url || "",
    tagline: tagline.en,
    short_bio: shortBio.en,
    long_bio: longBio.en,
    tagline_i18n: tagline,
    short_bio_i18n: shortBio,
    long_bio_i18n: longBio,
    image: {
      src: image.src,
      alt: image.alt,
      placeholder: image.placeholder,
    },
    hero_image: {
      src: heroImage.src || image.src,
      alt: heroImage.alt.en ? heroImage.alt : image.alt,
      placeholder: heroImage.placeholder,
    },
    streaming_links: streamingLinks,
    social_links: socialLinks,
    featured_release_ids: featuredReleaseIds,
    updated_at: new Date().toISOString(),
  };

  const { error } = await ctx.supabase.from("artists").upsert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePublicContent();
  return { ok: true, message: "Artist saved successfully" };
}

export async function deleteArtist(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id"));
  const confirm = String(formData.get("confirm"));
  const slug = String(formData.get("slug"));
  if (confirm !== slug) {
    return { ok: false, error: "Confirmation text does not match artist slug" };
  }

  const { error, count } = await ctx.supabase.from("artists").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: "Artist was not deleted (not found or permission denied)" };

  revalidatePublicContent();
  return { ok: true, message: "Artist deleted" };
}

export async function upsertRelease(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id") || crypto.randomUUID());
  const parsed = releaseSchema.safeParse({
    id,
    slug: formData.get("slug"),
    title: formData.get("title"),
    artist_id: formData.get("artist_id"),
    type: formData.get("type"),
    release_date: formData.get("release_date"),
    release_at: formData.get("release_at"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid release data" };
  }

  const description = toLocalizedString(readLocalizedField(formData, "description"));
  const creditsRaw = readLocalizedField(formData, "credits");
  const credits: LocalizedString | null = creditsRaw.en || creditsRaw.sv ? toLocalizedString(creditsRaw) : null;
  const cover = parseImageJson(formData, "cover");

  const payload = {
    id: parsed.data.id,
    slug: parsed.data.slug,
    title: parsed.data.title,
    artist_id: parsed.data.artist_id,
    type: parsed.data.type,
    release_date: parsed.data.release_date,
    release_at: parsed.data.release_at,
    status: parsed.data.status,
    description: description.en,
    description_i18n: description,
    credits: credits?.en ?? null,
    credits_i18n: credits,
    cover: {
      src: cover.src,
      alt: cover.alt,
      placeholder: cover.placeholder,
    },
    streaming_links: parseStreamingLinks(formData),
    spotify_album_url: String(formData.get("spotify_album_url") || "") || null,
    pre_save_url: String(formData.get("pre_save_url") || "") || null,
    featured: formData.get("featured") === "on",
    track_ids: String(formData.get("track_ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    updated_at: new Date().toISOString(),
  };

  const { error } = await ctx.supabase.from("releases").upsert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePublicContent();
  return { ok: true, message: "Release saved successfully" };
}

export async function deleteRelease(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id"));
  const confirm = String(formData.get("confirm"));
  const slug = String(formData.get("slug"));
  if (confirm !== slug) {
    return { ok: false, error: "Confirmation text does not match release slug" };
  }

  const { error, count } = await ctx.supabase.from("releases").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: "Release was not deleted (not found or permission denied)" };

  revalidatePublicContent();
  return { ok: true, message: "Release deleted" };
}

export async function upsertTrack(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id") || crypto.randomUUID());
  const parsed = trackSchema.safeParse({
    id,
    slug: formData.get("slug"),
    title: formData.get("title"),
    artist_id: formData.get("artist_id"),
    release_id: formData.get("release_id"),
    track_number: formData.get("track_number"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid track data" };
  }

  const payload = {
    ...parsed.data,
    duration_seconds: formData.get("duration_seconds")
      ? Number(formData.get("duration_seconds"))
      : null,
    spotify_track_url: String(formData.get("spotify_track_url") || "") || null,
  };

  const { error } = await ctx.supabase.from("tracks").upsert(payload);
  if (error) return { ok: false, error: error.message };

  const { data: release } = await ctx.supabase
    .from("releases")
    .select("track_ids")
    .eq("id", parsed.data.release_id)
    .maybeSingle();

  const trackIds = new Set(release?.track_ids ?? []);
  trackIds.add(parsed.data.id);
  await ctx.supabase
    .from("releases")
    .update({ track_ids: Array.from(trackIds), updated_at: new Date().toISOString() })
    .eq("id", parsed.data.release_id);

  revalidatePublicContent();
  return { ok: true, message: "Track saved successfully" };
}

export async function deleteTrack(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id"));
  const confirm = String(formData.get("confirm"));
  const slug = String(formData.get("slug"));
  if (confirm !== slug) {
    return { ok: false, error: "Confirmation text does not match track slug" };
  }

  const { data: track } = await ctx.supabase.from("tracks").select("release_id").eq("id", id).maybeSingle();

  const { error, count } = await ctx.supabase.from("tracks").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: "Track was not deleted" };

  if (track?.release_id) {
    const { data: release } = await ctx.supabase
      .from("releases")
      .select("track_ids")
      .eq("id", track.release_id)
      .maybeSingle();
    const nextIds = (release?.track_ids ?? []).filter((tid: string) => tid !== id);
    await ctx.supabase
      .from("releases")
      .update({ track_ids: nextIds, updated_at: new Date().toISOString() })
      .eq("id", track.release_id);
  }

  revalidatePublicContent();
  return { ok: true, message: "Track deleted" };
}

export async function upsertNews(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id") || crypto.randomUUID());
  const title = readLocalizedField(formData, "title");
  const parsed = newsSchema.safeParse({
    id,
    slug: formData.get("slug"),
    title_en: title.en,
    published_at: formData.get("published_at"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid news data" };
  }

  const excerpt = toLocalizedString(readLocalizedField(formData, "excerpt"));
  const body = toLocalizedString(readLocalizedField(formData, "body"));
  const cover = parseImageJson(formData, "cover");

  const payload = {
    id: parsed.data.id,
    slug: parsed.data.slug,
    title: title.en,
    title_i18n: toLocalizedString(title),
    excerpt: excerpt.en,
    excerpt_i18n: excerpt,
    body: body.en,
    body_i18n: body,
    published_at: parsed.data.published_at,
    status: parsed.data.status,
    cover: {
      src: cover.src,
      alt: cover.alt,
      placeholder: cover.placeholder,
    },
    artist_id: String(formData.get("artist_id") || "") || null,
    release_id: String(formData.get("release_id") || "") || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await ctx.supabase.from("news").upsert(payload);
  if (error) return { ok: false, error: error.message };

  revalidatePublicContent();
  return { ok: true, message: "News article saved successfully" };
}

export async function deleteNews(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const id = String(formData.get("id"));
  const confirm = String(formData.get("confirm"));
  const slug = String(formData.get("slug"));
  if (confirm !== slug) {
    return { ok: false, error: "Confirmation text does not match article slug" };
  }

  const { error, count } = await ctx.supabase.from("news").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: "Article was not deleted" };

  revalidatePublicContent();
  return { ok: true, message: "News article deleted" };
}

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const story = toLocalizedString(readLocalizedField(formData, "label_story"));
  const mission = toLocalizedString(readLocalizedField(formData, "label_mission"));
  const featuredNews = String(formData.get("homepage_featured_news_ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await ctx.supabase
    .from("site_settings")
    .update({
      label_story: story.en,
      label_mission: mission.en,
      label_story_i18n: story,
      label_mission_i18n: mission,
      featured_release_id: String(formData.get("featured_release_id") || "") || null,
      homepage_featured_news_ids: featuredNews,
      social_links: parseSocialLinks(formData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };

  revalidatePublicContent();
  return { ok: true, message: "Site settings saved successfully" };
}
