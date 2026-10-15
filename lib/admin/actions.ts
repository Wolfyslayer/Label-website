"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertAdminWrite() {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) throw new Error("Unauthorized");
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

export async function upsertRelease(formData: FormData) {
  const supabase = await assertAdminWrite();
  const id = String(formData.get("id") || crypto.randomUUID());
  const payload = {
    id,
    slug: String(formData.get("slug")),
    title: String(formData.get("title")),
    artist_id: String(formData.get("artist_id")),
    type: String(formData.get("type")),
    release_date: String(formData.get("release_date")),
    release_at: String(formData.get("release_at")),
    description: String(formData.get("description") ?? ""),
    cover: JSON.parse(String(formData.get("cover") || "{}")),
    streaming_links: JSON.parse(String(formData.get("streaming_links") || "{}")),
    spotify_album_url: String(formData.get("spotify_album_url") || "") || null,
    pre_save_url: String(formData.get("pre_save_url") || "") || null,
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") || "draft"),
    track_ids: [],
  };
  const { error } = await supabase.from("releases").upsert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/music");
  revalidatePath("/upcoming");
}

export async function upsertArtist(formData: FormData) {
  const supabase = await assertAdminWrite();
  const id = String(formData.get("id") || crypto.randomUUID());
  const payload = {
    id,
    slug: String(formData.get("slug")),
    name: String(formData.get("name")),
    tagline: String(formData.get("tagline") ?? ""),
    short_bio: String(formData.get("short_bio") ?? ""),
    long_bio: String(formData.get("long_bio") ?? ""),
    theme: String(formData.get("theme")),
    image: JSON.parse(String(formData.get("image") || "{}")),
    spotify_artist_url: String(formData.get("spotify_artist_url") ?? ""),
    streaming_links: JSON.parse(String(formData.get("streaming_links") || "{}")),
    status: String(formData.get("status") || "draft"),
    featured_track_ids: [],
    social_links: {},
  };
  const { error } = await supabase.from("artists").upsert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/artists");
}

export async function upsertNews(formData: FormData) {
  const supabase = await assertAdminWrite();
  const id = String(formData.get("id") || crypto.randomUUID());
  const payload = {
    id,
    slug: String(formData.get("slug")),
    title: String(formData.get("title")),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: String(formData.get("body") ?? ""),
    published_at: String(formData.get("published_at")),
    cover: JSON.parse(String(formData.get("cover") || "{}")),
    status: String(formData.get("status") || "draft"),
  };
  const { error } = await supabase.from("news").upsert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/news");
}

export async function updateSiteSettings(formData: FormData) {
  const supabase = await assertAdminWrite();
  const { error } = await supabase
    .from("site_settings")
    .update({
      label_story: String(formData.get("label_story") ?? ""),
      label_mission: String(formData.get("label_mission") ?? ""),
      featured_release_id: String(formData.get("featured_release_id") || "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/about");
}
