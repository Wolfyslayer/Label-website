"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/admin/types";
import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadAdminMedia(formData: FormData): Promise<ActionResult & { url?: string }> {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const file = formData.get("file");
  const folder = String(formData.get("folder") || "uploads").replace(/[^a-z0-9-_/]/gi, "");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File exceeds 5 MB limit" };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(buffer)
      .rotate()
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return { ok: false, error: "Image could not be processed" };
  }

  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage.from("media").upload(path, output, {
    contentType: "image/webp",
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
  if (!publicUrl?.publicUrl) {
    return { ok: false, error: "Upload succeeded but public URL is unavailable" };
  }

  return { ok: true, message: "Image uploaded", url: publicUrl.publicUrl };
}
