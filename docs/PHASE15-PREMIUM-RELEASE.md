# Phase 15.0 — Premium Release Experience

## Implemented
- Add a Spotify embed on release detail pages only when a valid Spotify URL is configured (the existing embed helper validates URLs).
- Add release share controls with native sharing/copy fallback on music detail pages, pointing to the existing release hub.
- Add a tracklist to the smart-link release hub when tracks are present; retain streaming, pre-save, countdown and localized release time.
- Improve duration handling for invalid or missing track lengths.
- Add Swedish/English labels and replace stale public references to the removed admin page.

## Release QA checklist
- Verify Spotify iframe only appears for valid Spotify release links; no auto-playing audio or synthetic streaming links.
- Verify share and copy on mobile and desktop, including browser permission errors.
- Verify tracklists on both music detail and release hub, including releases without tracks.
- Verify upcoming releases and pre-save flows.
- Verify mobile widths 320px, 375px, 768px and desktop; keyboard navigation, focus and reduced motion.
- Run `npm run verify:assets`, `npm run validate:content`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run validate:seo` after building.

## Follow-up quality backlog
1. Automated Playwright coverage for release hubs, embedded media and share flows.
2. Lighthouse mobile audits (LCP, CLS, accessibility) using real production pages.
3. Audit metadata and social sharing previews on Spotify, TikTok and messaging apps.
4. Test static export routes for every published release, including missing artwork and empty streaming links.
5. Validate release import data and pre-save URLs before publication; monitor GitHub Actions failures.
6. Review media compression and long catalog performance as the discography grows.

All changes retain static GitHub Pages hosting; no backend or secrets are added.
