import { MANAGER_ARTISTS, type ArtistKey } from "@/lib/manager/artists";
import { releaseAtFromDate, slugify, uniqueId } from "@/lib/manager/slugs";
import type { ReleaseForm } from "@/lib/manager/types";

export function createEmptyRelease(type: ReleaseForm["type"], artistKey: ArtistKey, title = ""): ReleaseForm {
  const artist = MANAGER_ARTISTS[artistKey];
  const slug = slugify(title) || `new-${type}-${Date.now().toString(36).slice(-4)}`;
  const releaseDate = new Date().toISOString().slice(0, 10);
  return {
    id: uniqueId(`release-${artist.slug}`),
    slug,
    title: title || "Untitled release",
    artistId: artist.id,
    type,
    releaseDate,
    releaseAt: releaseAtFromDate(releaseDate),
    description: { en: "", sv: "" },
    cover: {
      src: `/assets/fallback/release-cover-neutral.svg`,
      alt: {
        en: "Release artwork — replace with official cover",
        sv: "Release-artwork — ersätt med officiell omslagsbild",
      },
      placeholder: true,
    },
    streamingLinks: {},
    trackIds: [],
    featured: false,
    status: "draft",
  };
}
