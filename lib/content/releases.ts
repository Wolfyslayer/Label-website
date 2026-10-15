import type { Release } from "@/lib/types/content";

export function isReleaseUpcoming(release: Release, now = new Date()): boolean {
  return new Date(release.releaseAt).getTime() > now.getTime();
}
