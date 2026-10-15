import type { ReleaseSource } from "@/lib/types/content";

/** Most recent published release whose street date is not in the future (UTC). */
export function pickFeaturedReleaseId(
  releases: ReleaseSource[],
  featuredReleaseId: string | null,
  now = new Date(),
): string | null {
  if (featuredReleaseId) {
    const exists = releases.some(
      (r) => r.id === featuredReleaseId && r.status === "published",
    );
    if (exists) return featuredReleaseId;
  }
  const eligible = releases
    .filter((r) => r.status === "published")
    .filter((r) => new Date(r.releaseAt).getTime() <= now.getTime())
    .sort((a, b) => new Date(b.releaseAt).getTime() - new Date(a.releaseAt).getTime());
  return eligible[0]?.id ?? null;
}
