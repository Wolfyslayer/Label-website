/**
 * Canonical artist media paths.
 * Portrait/hero JPEGs are synced from Spotify oEmbed thumbnails for the official artist URLs
 * (see scripts/sync-artist-images.mjs). Replace with higher-res supplied photography anytime
 * using the same filenames.
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
  labelLogo: "/placeholders/logo-wolfyslayer.svg",
} as const;

export const missingOfficialAssets = [
  "Optional: higher-resolution frostmark-raven-portrait.webp from label asset package",
  "Optional: higher-resolution wolfyslayer-viking-portrait.webp from label asset package",
  "Optional: label logo PNG/SVG from Wolfyslayer Records asset package",
] as const;
