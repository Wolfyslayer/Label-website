/** Site content slug: lowercase letters, digits, hyphens only (see Zod schemas). */
export const CONTENT_SLUG_PATTERN = /^[a-z0-9-]+$/;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Guarantee a slug valid for `content/` JSON (Spotify IDs may contain A–Z). */
export function ensureContentSlug(base: string, fallbackTitle: string, uniqueToken: string): string {
  const token = uniqueToken.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(-8) || "id";
  let s = slugify(base);
  if (!s) s = slugify(fallbackTitle) || "item";
  let combined = `${s}-${token}`.replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  if (!combined || !CONTENT_SLUG_PATTERN.test(combined)) {
    combined = `item-${token}`;
  }
  return combined;
}

export function isValidContentSlug(slug: string): boolean {
  return CONTENT_SLUG_PATTERN.test(slug);
}

export function uniqueId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function releaseAtFromDate(releaseDate: string): string {
  return `${releaseDate}T12:00:00.000Z`;
}

export function trackSlug(title: string, releaseSlug: string, index: number): string {
  const base = slugify(title) || `track-${index + 1}`;
  return `${releaseSlug}-${base}`.slice(0, 80);
}
