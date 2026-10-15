import { siteConfig } from "@/lib/config/site";

/** Prefix for static files (GitHub Pages project sites). */
export function publicAssetPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.basePath}${normalized}`;
}

/** Official label assets under `public/assets/` (see `public/assets/readme.md`). */
export const siteBrandPaths = {
  /** Official WR rune symbol (transparent). */
  wrRuneMonogram: "/assets/logos/wolfyslayer-records-symbol.svg",
  logoLight: "/assets/logos/wolfyslayer-records-light.svg",
  logoLightPng: "/assets/logos/wolfyslayer-records-light.png",
  logoDark: "/assets/logos/wolfyslayer-records-dark.svg",
  labelHeroBanner: "/assets/banners/label-hero-1280x512.webp",
  labelHeroBanner2x: "/assets/banners/label-hero-2560x1024.webp",
  releaseCoverFallback: "/assets/fallback/release-cover-neutral.svg",
  ogDefault: "/assets/banners/label-hero-1280x512.webp",
  favicon: {
    svg: "/assets/favicons/favicon.svg",
    png32: "/assets/favicons/icon-32.png",
    png48: "/assets/favicons/icon-48.png",
    png180: "/assets/favicons/icon-180.png",
    png192: "/assets/favicons/icon-192.png",
    png512: "/assets/favicons/icon-512.png",
  },
} as const;

export const missingBrandAssets = [
  "Per-release cover files under public/assets/releases/ when titles are confirmed",
] as const;
