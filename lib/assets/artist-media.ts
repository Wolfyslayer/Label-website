import { siteBrandPaths } from "@/lib/assets/site-brand";

/** Official artist & banner paths under `public/assets/`. */
export const artistMediaPaths = {
  frostmark: {
    portrait: "/assets/artists/frostmark/profile-1024.webp",
    portrait512: "/assets/artists/frostmark/profile-512.webp",
    hero: "/assets/banners/frostmark-hero-1280x512.webp",
    hero2x: "/assets/banners/frostmark-hero-2560x1024.webp",
    background: "/assets/backgrounds/frostmark-dark-1920x1080.webp",
    socialSquare: "/assets/social/frostmark-square-1080.webp",
    portraitAlt: "Frostmark — official artist profile",
    heroAlt: "Frostmark — artist hero",
  },
  wolfyslayer: {
    portrait: "/assets/artists/wolfyslayer/profile-1024.webp",
    portrait512: "/assets/artists/wolfyslayer/profile-512.webp",
    hero: "/assets/banners/wolfyslayer-hero-1280x512.webp",
    hero2x: "/assets/banners/wolfyslayer-hero-2560x1024.webp",
    background: "/assets/backgrounds/wolfyslayer-dark-1920x1080.webp",
    socialSquare: "/assets/social/wolfyslayer-square-1080.webp",
    portraitAlt: "Wolfyslayer — official artist profile",
    heroAlt: "Wolfyslayer — artist hero",
  },
  labelMonogram: siteBrandPaths.wrRuneMonogram,
  labelPressLogo: siteBrandPaths.logoLightPng,
} as const;

export const missingOfficialAssets = [] as const;
