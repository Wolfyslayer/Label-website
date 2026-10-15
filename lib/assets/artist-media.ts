import { siteBrandPaths } from "@/lib/assets/site-brand";

/**
 * Canonical artist media paths (official raven / Viking artwork in `public/artists/`).
 * JPEGs may be refreshed from Spotify oEmbed via `scripts/sync-artist-images.mjs`.
 * Prefer `.jpg` over legacy labeled `.svg` stand-ins in `public/artists/`.
 */
export const artistMediaPaths = {
  frostmark: {
    portrait: "/artists/frostmark-raven-portrait.jpg",
    hero: "/artists/frostmark-raven-hero.jpg",
    portraitAlt: "Frostmark — official artist profile",
    heroAlt: "Frostmark — artist hero",
  },
  wolfyslayer: {
    portrait: "/artists/wolfyslayer-viking-portrait.jpg",
    hero: "/artists/wolfyslayer-viking-hero.jpg",
    portraitAlt: "Wolfyslayer — official artist profile",
    heroAlt: "Wolfyslayer — artist hero",
  },
  labelMonogram: siteBrandPaths.wrRuneMonogram,
} as const;

export const missingOfficialAssets = [
  "public/assets/brand/wolfyslayer-records-wordmark.svg — full label wordmark for press",
  "Higher-resolution frostmark-raven-portrait.jpg (current file is 320×320 oEmbed)",
  "Higher-resolution wolfyslayer-viking-portrait.jpg (current file is 320×320 oEmbed)",
  "Per-release cover files under public/assets/releases/ when titles are confirmed",
] as const;
