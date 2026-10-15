import frostmarkBaseline from "../../content/artists/frostmark.json";
import wolfyslayerBaseline from "../../content/artists/wolfyslayer.json";
import type { ArtistForm, ArtistKey } from "@/lib/manager/types";

export type { ArtistKey };

export const MANAGER_ARTISTS: Record<
  ArtistKey,
  { id: string; slug: string; name: string; theme: "frost" | "wolf" }
> = {
  frostmark: {
    id: "artist-frostmark",
    slug: "frostmark",
    name: "Frostmark",
    theme: "frost",
  },
  wolfyslayer: {
    id: "artist-wolfyslayer",
    slug: "wolfyslayer",
    name: "Wolfyslayer",
    theme: "wolf",
  },
};

export function artistKeyFromId(artistId: string): ArtistKey | null {
  if (artistId === MANAGER_ARTISTS.frostmark.id) return "frostmark";
  if (artistId === MANAGER_ARTISTS.wolfyslayer.id) return "wolfyslayer";
  return null;
}

const BASELINE: Record<ArtistKey, ArtistForm> = {
  frostmark: frostmarkBaseline as ArtistForm,
  wolfyslayer: wolfyslayerBaseline as ArtistForm,
};

export function defaultArtistForm(key: ArtistKey, base?: ArtistForm): ArtistForm {
  if (base) return structuredClone(base);
  return structuredClone(BASELINE[key]);
}
