/**
 * Canonical artist media paths. Replace SVG placeholders with official photography
 * (same filenames, .webp or .jpg) when the asset package is added under public/artists/.
 */
export const artistMediaPaths = {
  frostmark: {
    portrait: "/artists/frostmark-raven-portrait.svg",
    hero: "/artists/frostmark-raven-hero.svg",
    portraitAlt: "Frostmark — raven portrait (temporary placeholder)",
    heroAlt: "Frostmark — atmospheric hero (temporary placeholder)",
  },
  wolfyslayer: {
    portrait: "/artists/wolfyslayer-viking-portrait.svg",
    hero: "/artists/wolfyslayer-viking-hero.svg",
    portraitAlt: "Wolfyslayer — Viking portrait (temporary placeholder)",
    heroAlt: "Wolfyslayer — hero imagery (temporary placeholder)",
  },
  labelLogo: "/placeholders/logo-wolfyslayer.svg",
} as const;

export const missingOfficialAssets = [
  "public/artists/frostmark-raven-portrait.webp (or .jpg) — official Frostmark raven portrait",
  "public/artists/wolfyslayer-viking-portrait.webp (or .jpg) — official Wolfyslayer Viking portrait",
  "Optional: label logo PNG/SVG from Wolfyslayer Records asset package",
] as const;
