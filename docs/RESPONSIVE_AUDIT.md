# Responsive audit — Wolfyslayer Records

**Date:** 2026-10-15  
**Method:** Playwright (`npm run test:e2e:responsive`) against production build (`next start`, port 3456)  
**Report:** `test-results/playwright-report.json` (generated locally; not committed)

## Viewport matrix

| Width (px) | Portrait (14 public routes) | Landscape (home, music, artist) |
|------------|------------------------------|----------------------------------|
| 320 | Pass | Pass |
| 360 | Pass | Pass |
| 375 | Pass | Pass |
| 390 | Pass | Pass |
| 414 | Pass | Pass |
| 430 | Pass | Pass |
| 480 | Pass | Pass |
| 600 | Pass | Pass |
| 768 | Pass | Pass |
| 820 | Pass | Pass |
| 1024 | Pass | Pass |
| 1280 | Pass | Pass |
| 1440 | Pass | Pass |
| 1920 | Pass | Pass |
| 2560 | Pass | Pass |

**Overflow rule:** `document.documentElement.scrollWidth - clientWidth ≤ 2px` on each route after load.

### Routes exercised (portrait)

`/en`, `/sv`, `/en/artists`, `/en/artists/frostmark`, `/en/music`, `/en/music/frostmark-placeholder-release`, `/en/releases/frostmark-placeholder-release`, `/en/upcoming`, `/en/news`, `/en/news/welcome-to-wolfyslayer-records`, `/en/about`, `/en/contact`, `/en/press`

## Targeted scenarios (automated)

| Scenario | Result |
|----------|--------|
| Mobile menu open @ 375px, no horizontal overflow | Pass (after fixing `hidden={false}` on dialog — see fixes below) |
| Simulated 125% root font size on contact | Pass |
| 120-character music search @ 320px | Pass |

## Not fully automated in this run

| Area | Status |
|------|--------|
| Admin CRUD layouts @ all widths | **Manual / credentials required** — only `/admin/login` smoke-tested |
| Spotify iframe internal UI | Third-party; outer container checked via overflow tests on artist page |
| Real device browsers (Safari iOS, Chrome Android) | **Manual recommended** |
| Portrait/landscape on every route @ every width | Landscape subset only (3 routes × 15 widths) to keep CI time bounded |

## Fixes applied during audit

1. **Mobile navigation:** Removed HTML `hidden={!open}` on the menu panel. In HTML, `hidden="false"` still hides the element; replaced with `aria-hidden={!open}` so open state is visible to users and tests.
2. **Page titles:** Added `headingLevel={1}` on primary `SectionHeader` instances (music, artists list, upcoming, news, about, contact, press) for semantics without changing visual styles.

## Visual design

No approved typography, color, or layout tokens were changed. Only accessibility/visibility corrections above.
