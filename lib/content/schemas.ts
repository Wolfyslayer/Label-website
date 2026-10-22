import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published"]);
export const releaseTypeSchema = z.enum(["single", "ep", "album"]);

export const localizedStringSchema = z.object({
  en: z.string().min(1, "English text is required"),
  sv: z.string().min(1, "Swedish (sv) translation is required"),
});

export const imageAssetSourceSchema = z.object({
  src: z
    .string()
    .min(1)
    .refine(
      (s) => s.startsWith("/") || s.startsWith("https://"),
      "Image src must be a site path (/) or https URL",
    ),
  alt: localizedStringSchema,
  placeholder: z.boolean(),
});

const httpsUrl = z
  .string()
  .url("Must be a valid URL")
  .refine((u) => u.startsWith("https://"), "Streaming and external links must use https://");

const optionalHttpsUrl = z.union([z.literal(""), httpsUrl]).optional();

export const streamingLinksSchema = z
  .object({
    spotify: optionalHttpsUrl,
    appleMusic: optionalHttpsUrl,
    youtubeMusic: optionalHttpsUrl,
    bandcamp: optionalHttpsUrl,
    soundcloud: optionalHttpsUrl,
    deezer: optionalHttpsUrl,
    tidal: optionalHttpsUrl,
    amazonMusic: optionalHttpsUrl,
  })
  .partial()
  .strict();

export const artistSourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  name: z.string().min(1),
  tagline: localizedStringSchema,
  shortBio: localizedStringSchema,
  longBio: localizedStringSchema,
  theme: z.enum(["frost", "wolf"]),
  image: imageAssetSourceSchema,
  heroImage: imageAssetSourceSchema.optional(),
  spotifyArtistUrl: httpsUrl,
  streamingLinks: streamingLinksSchema.default({}),
  socialLinks: z
    .object({
      instagram: optionalHttpsUrl,
      youtube: optionalHttpsUrl,
      facebook: optionalHttpsUrl,
      x: optionalHttpsUrl,
      tiktok: optionalHttpsUrl,
    })
    .partial()
    .default({}),
  featuredTrackIds: z.array(z.string()).default([]),
  featuredReleaseIds: z.array(z.string()).optional(),
  status: contentStatusSchema,
});

export const trackSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  artistId: z.string().min(1),
  releaseId: z.string().min(1),
  trackNumber: z.number().int().positive(),
  discNumber: z.number().int().positive().optional(),
  durationSeconds: z.number().int().positive().optional(),
  spotifyTrackUrl: httpsUrl.optional(),
  spotifyTrackId: z.string().min(1).optional(),
  youtubeMusicTrackUrl: httpsUrl.optional(),
  isrc: z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/).optional(),
});

export const releaseDatePrecisionSchema = z.enum(["year", "month", "day"]);

export const releaseSourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  artistId: z.string().min(1),
  type: releaseTypeSchema,
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  releaseAt: z.string().datetime({ message: "Use ISO 8601 UTC, e.g. 2026-11-20T00:00:00.000Z" }),
  releaseDatePrecision: releaseDatePrecisionSchema.optional(),
  description: localizedStringSchema,
  credits: localizedStringSchema.optional(),
  cover: imageAssetSourceSchema,
  streamingLinks: streamingLinksSchema.default({}),
  spotifyAlbumUrl: httpsUrl.optional(),
  spotifyAlbumId: z.string().min(1).optional(),
  upc: z.string().regex(/^\d{12,14}$/).optional(),
  trackIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: contentStatusSchema,
  preSaveUrl: httpsUrl.optional(),
  importSource: z.literal("spotify").optional(),
});

/** gray-matter parses YAML datetimes as JavaScript Date objects. */
export const isoDateTimeStringSchema = z.preprocess((val) => {
  if (val instanceof Date) return val.toISOString();
  return val;
}, z.string().datetime({ message: "Use ISO 8601 UTC, e.g. 2026-10-01T10:00:00.000Z" }));

export const newsFrontmatterSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: contentStatusSchema,
  publishedAt: isoDateTimeStringSchema,
  title: localizedStringSchema,
  excerpt: localizedStringSchema,
  body: localizedStringSchema,
  artistId: z.string().optional(),
  releaseId: z.string().optional(),
  cover: imageAssetSourceSchema,
});

export const pressAssetSourceSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  type: z.enum(["photo", "logo", "epk"]),
  artistId: z.string().optional(),
  downloadUrl: httpsUrl.optional(),
  src: z.string().min(1).regex(/^\//),
  alt: localizedStringSchema,
  placeholder: z.boolean(),
});

export const siteMetaSchema = z.object({
  label: z.object({
    story: localizedStringSchema,
    mission: localizedStringSchema,
  }),
  featuredReleaseId: z.string().nullable(),
  homepageFeaturedNewsIds: z.array(z.string()).default([]),
  pressAssets: z.array(pressAssetSourceSchema).default([]),
});

export type SiteMetaFile = z.infer<typeof siteMetaSchema>;
