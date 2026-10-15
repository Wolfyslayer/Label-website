export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
