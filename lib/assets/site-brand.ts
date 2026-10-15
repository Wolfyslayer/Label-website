/** Official label brand assets under `public/assets/`. */
export const siteBrandPaths = {
  /** Transparent WR rune monogram (no square frame). */
  wrRuneMonogram: "/assets/brand/wr-rune-monogram.svg",
  /** Default social / label preview when no page-specific image. */
  ogDefault: "/og-default.png",
  /** Neutral square when release artwork is not yet published. */
  releaseCoverFallback: "/assets/fallback/release-cover-neutral.svg",
} as const;

/** Assets expected from the label package but not yet in the repo. */
export const missingBrandAssets = [
  "public/assets/brand/wolfyslayer-records-wordmark.svg (or .png) — full horizontal logo",
  "public/assets/brand/wolfyslayer-records-wordmark-dark.png — press / download kit",
  "Higher-resolution artist photography (replace 320×320 Spotify oEmbed JPEGs when available)",
  "Official release cover artwork per title (replace neutral fallback when confirmed)",
] as const;
