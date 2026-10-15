import { z } from "zod";

const localizedRequiredEn = z.object({
  en: z.string().min(1, "English text is required"),
  sv: z.string().optional(),
});

export const artistSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  theme: z.enum(["frost", "wolf"]),
  status: z.enum(["draft", "published"]),
  spotify_artist_url: z.string().url().optional().or(z.literal("")),
});

export const releaseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  artist_id: z.string().min(1),
  type: z.enum(["album", "single", "ep"]),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  release_at: z.string().min(10),
  status: z.enum(["draft", "published"]),
});

export const newsSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title_en: z.string().min(1),
  published_at: z.string().min(10),
  status: z.enum(["draft", "published"]),
});

export const trackSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  artist_id: z.string().min(1),
  release_id: z.string().min(1),
  track_number: z.coerce.number().int().min(1),
});

export { localizedRequiredEn };
