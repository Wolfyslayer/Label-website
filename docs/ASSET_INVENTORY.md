# Wolfyslayer Records — asset inventory (Phase 11.5)

There is **no** top-level `public/assets/` package beyond the paths below. Legacy labeled SVGs live under `public/placeholders/` and `public/artists/*.svg` (deprecated for display; official JPEGs are used instead).

## Official assets in repository

| Path | Description | Used on |
|------|-------------|---------|
| `public/assets/brand/wr-rune-monogram.svg` | Transparent WR rune monogram | Header/footer (`LabelMonogram`), favicon, press logo, JSON-LD logo |
| `public/assets/fallback/release-cover-neutral.svg` | Neutral release cover (no invented artwork) | Seed releases without official covers |
| `public/artists/frostmark-raven-portrait.jpg` | Frostmark official profile (320×320, oEmbed) | Artist cards, artist hero portrait, press |
| `public/artists/frostmark-raven-hero.jpg` | Frostmark hero / banner | Artist hero background, home hero accent (md+), welcome news cover |
| `public/artists/wolfyslayer-viking-portrait.jpg` | Wolfyslayer official profile | Artist cards, artist hero portrait, press |
| `public/artists/wolfyslayer-viking-hero.jpg` | Wolfyslayer hero / banner | Artist hero background, artist cards |
| `public/assets/favicons/*` | Official favicon set (SVG + PNG sizes) | **`app/layout.tsx` metadata (primary)** |
| `public/favicon.svg` | Synced copy of official SVG | Legacy `/favicon.svg` requests (`npm run sync:icons`) |
| `public/apple-touch-icon.png` | Synced from `icon-180.png` | Legacy Apple touch requests |
| `public/og-default.png` | Label wordmark + rune (1200×630) | Default Open Graph / Twitter |

## Deprecated / not used for live UI

| Path | Notes |
|------|--------|
| `public/placeholders/*` | Generic SVG stand-ins; superseded for artists & logo |
| `public/artists/*.svg` | Labeled gradient stand-ins; use matching `.jpg` instead |

## Missing (upload when available)

Documented in `lib/assets/site-brand.ts` → `missingBrandAssets` and `lib/assets/artist-media.ts` → `missingOfficialAssets`:

- `public/assets/brand/wolfyslayer-records-wordmark.svg` (or PNG) — full horizontal logo for press downloads
- Higher-resolution artist JPEGs/WebPs (replace 320×320 oEmbed files in place)
- `public/assets/releases/<slug>.jpg` — per-title official cover art (update seed/CMS; do not invent)

## Page mapping

| Page / area | Primary assets |
|-------------|----------------|
| Global header & footer | WR rune + “WOLFYSLAYER” / “RECORDS” typography |
| Home hero | CSS Nordic lighting; Frostmark `frostmark-raven-hero.jpg` (desktop accent) |
| Home roster | Artist card heroes from each artist’s `heroImage` JPEG |
| `/artists/[slug]` | Hero + square portrait JPEGs, object-fit cover (no circle crop) |
| `/music`, releases | Neutral fallback cover until official art is added |
| `/news` | Welcome post uses Frostmark hero JPEG |
| `/press` | WR monogram + artist portrait JPEGs |

## Verification

```bash
npm run verify:assets
npm run build:pages
# Confirm out/assets/, out/artists/, favicon, and icons are present
```
