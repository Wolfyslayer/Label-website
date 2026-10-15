# Phase 14.7 — Premium Music Experience

## Summary

Polished the public music catalog, release detail pages, artist profiles, and homepage listen section while preserving the Spotify import pipeline and static export build.

## Files changed

| Area | Files |
|------|--------|
| Catalog cards | `components/music/release-card.tsx` |
| Release detail | `components/music/release-tracklist.tsx`, `app/[locale]/(site)/music/[slug]/page.tsx` |
| Artist pages | `components/music/latest-release-spotlight.tsx`, `app/[locale]/(site)/artists/[slug]/page.tsx` |
| Homepage | `components/home/spotify-artist-panel.tsx`, `app/[locale]/(site)/page.tsx` |
| Discovery | `lib/content/discovery.ts` |
| Spotify URLs | `lib/utils/streaming.ts` |
| Layout | `app/globals.css` |
| i18n | `messages/en.json`, `messages/sv.json` |
| Tests | `tests/e2e/functional-smoke.spec.ts` |

## Preserved

- Spotify import (`lib/spotify/`, `scripts/import-spotify.ts`, GitHub workflow)
- Content validation and 31 imported releases / 83 tracks
- Music catalog filters, locale routes, release hub smart links
- Static export (`STATIC_EXPORT=1`) compatibility
- No client-side Spotify API credentials

## Visual improvements

- Release cards: translated format badges, 1:1 artwork, dedicated Spotify link, hover respects reduced motion
- Release pages: track-level Spotify links with accessible labels, artist profile badge link, removed iframe embed
- Artist pages: introduction, latest release spotlight, albums/EPs vs singles sections (hidden when empty), Spotify profile CTA instead of embed
- Homepage: listen section uses artist panels with Spotify + catalog paths instead of heavy embeds

## Mobile

- Tighter album grid gap on narrow viewports (320px class of devices)
- Card max-width on small screens to avoid oversized tiles
- Responsive image `sizes` on catalog artwork

## Performance

- Removed Spotify iframes from home, artist, and release detail pages (fewer third-party resources, better privacy)
- Lazy loading unchanged on non-priority images

## Test results

```
npm run validate:content  — pass
npm run lint              — pass
npm run typecheck         — pass
npm run build             — pass (155 static pages)
npm run test:e2e          — 56/56 pass
```

## Remaining issues

- Release hub (`/releases/[slug]`) still uses optional Spotify embed where configured; music detail route is the primary catalog experience.
- Apple Music / other platforms only appear when configured in content JSON.
