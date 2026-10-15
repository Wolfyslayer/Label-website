import type { Artist, Release } from "@/lib/types/content";

export type ReleaseSort = "newest" | "oldest";

export function sortReleases(releases: Release[], sort: ReleaseSort): Release[] {
  const copy = [...releases];
  copy.sort((a, b) => {
    const ta = new Date(a.releaseAt).getTime();
    const tb = new Date(b.releaseAt).getTime();
    return sort === "newest" ? tb - ta : ta - tb;
  });
  return copy;
}

export function getReleasesForArtist(releases: Release[], artistId: string): Release[] {
  return sortReleases(
    releases.filter((r) => r.artistId === artistId),
    "newest",
  );
}

export function getFeaturedReleasesForArtist(
  releases: Release[],
  artist: Artist,
): Release[] {
  const forArtist = getReleasesForArtist(releases, artist.id);
  if (artist.featuredReleaseIds?.length) {
    const picked = artist.featuredReleaseIds
      .map((id) => forArtist.find((r) => r.id === id))
      .filter(Boolean) as Release[];
    if (picked.length) return picked;
  }
  return forArtist.filter((r) => r.featured).slice(0, 3);
}

export function getRelatedReleasesForRelease(
  allReleases: Release[],
  release: Release,
  limit = 4,
): Release[] {
  const sameArtist = allReleases.filter(
    (r) => r.artistId === release.artistId && r.id !== release.id,
  );
  const otherArtists = allReleases.filter(
    (r) => r.artistId !== release.artistId && r.id !== release.id,
  );
  return sortReleases([...sameArtist, ...otherArtists], "newest").slice(0, limit);
}

export function getLabelMateReleases(
  allReleases: Release[],
  artist: Artist,
  limit = 3,
): Release[] {
  return sortReleases(
    allReleases.filter((r) => r.artistId !== artist.id),
    "newest",
  ).slice(0, limit);
}
