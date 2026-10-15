# Test results — Phase 8 QA

**Branch:** `cursor/phase8-qa-audit-f353`  
**Environment:** Cloud agent VM, production build, seed data (Supabase not configured unless noted)

## Build & static checks

| Command | Result | When |
|---------|--------|------|
| `npm run lint` | Pass | 2026-10-15 |
| `npm run typecheck` | Pass | 2026-10-15 |
| `npm run build` | Pass (47 prerendered routes) | 2026-10-15 |

## Playwright E2E

| Suite | Tests | Result |
|-------|-------|--------|
| `tests/e2e/responsive-overflow.spec.ts` | 33 | **48 total including landscape** — all pass |
| `tests/e2e/functional-smoke.spec.ts` | 11 | All pass |
| `tests/e2e/a11y-keyboard.spec.ts` | 4 | All pass |
| **Total** | **48** | **48 passed** |

Run: `npm run build && npm run test:e2e`  
JSON report: `test-results/playwright-report.json`

### Functional coverage (automated)

| Feature | Verified | Notes |
|---------|----------|-------|
| EN / SV home | Yes | Render smoke |
| Language switch | Yes | `/en/music` ↔ `/sv/music` via `#site-language` |
| Music search & artist filter | Yes | Seed placeholder release title |
| Artist page + Spotify iframe | Yes | `loading="lazy"` on iframe |
| Release hub (smart link) | Yes | Copy link control present |
| Upcoming page | Yes | `h1` visible |
| News article | Yes | |
| Contact API | Yes | **503** + `notConfigured` without Supabase/webhook |
| Admin `/api/admin/status` | Yes | **401** unauthenticated |
| Admin login page | Yes | Loads |
| `robots.txt` / `sitemap.xml` | Yes | Admin disallowed; news + release hub URLs present |

### Requires credentials or manual verification

| Feature | Status |
|---------|--------|
| Admin login success | **Not tested** — needs Supabase project + allowlisted user |
| Content create / edit / delete | **Not tested** — server actions require admin session |
| Media uploads to `media` bucket | **Not tested** — needs Supabase + admin |
| Draft vs published on public site | **Partially** — public API only exposes `published`; draft hiding not re-tested against live DB |
| Contact form success path | **Not tested** — needs `SUPABASE_SERVICE_ROLE_KEY` or `CONTACT_WEBHOOK_URL` |
| Spotify playback / link destinations | **Not tested** — external service |
| Share API on release hub | **Not tested** in automation (button present only) |

## Accessibility (automated smoke)

| Check | Result |
|-------|--------|
| Skip link → `#main-content` | Pass |
| Mobile menu Escape closes; focus return | Pass |
| Contact field labels | Pass |
| `prefers-reduced-motion: reduce` → `scroll-behavior: auto` | Pass |

**WCAG 2.2 AA:** Full conformance was **not** certified. Lighthouse accessibility scores on sample pages were 91–96 (lab). Remaining gaps to verify manually: color contrast on all states, complete keyboard paths on admin forms, focus order on release carousel, and screen reader review of bilingual content.

## Performance (lab — local `next start`, mobile Lighthouse)

Source: `test-results/lighthouse/summary.json` (run `PLAYWRIGHT_SKIP_WEBSERVER=1 npm run audit:lighthouse` with server on port 3456)

| URL | Perf score | LCP (ms) | CLS | TBT (ms) | A11y score |
|-----|------------|----------|-----|----------|------------|
| `/en` | 70 | 3490 | 0.499 | 56 | 96 |
| `/en/music` | 91 | 3489 | 0.000 | 62 | 91 |
| `/en/artists/frostmark` | 69 | 3638 | 0.499 | 32 | 96 |
| `/en/contact` | 73 | 3344 | 0.409 | 51 | 92 |

### Core Web Vitals targets (claimed only where measured)

| Metric | Target | Lab result | Meets target? |
|--------|--------|------------|---------------|
| LCP | ≤ 2500 ms | ~3344–3638 ms on sample pages | **No** (local cold lab) |
| CLS | ≤ 0.1 | 0 on `/music`; ~0.41–0.50 on home, artist, contact | **No** on those pages |
| INP | ≤ 200 ms | **Not measured** (field metric; no RUM in repo) | **Unknown** |

**Interpretation:** High CLS on home/artist/contact likely combines hero motion, font loading, and below-the-fold content in mobile Lighthouse. `/music` shows CLS can be excellent on catalog-style pages. Production CDN, caching, and real-user monitoring (e.g. Vercel Speed Insights) are required before claiming production CWV compliance.

### Performance-related code changes (Phase 8)

- `next/image` AVIF + WebP formats
- Spotify embeds already use `loading="lazy"`
- Google fonts use `display: swap`
- `poweredByHeader: false`

## SEO (smoke)

| Item | Verified |
|------|----------|
| Per-page titles/descriptions (sample pages) | Via existing metadata helpers |
| Canonical + hreflang | `buildAlternates`; link headers on `/en` |
| `sitemap.xml` | Automated fetch |
| `robots.txt` | Disallows `/admin/`, `/api/`, `/api/admin` |
| JSON-LD | Present on news, about, artists, releases (manual spot-check recommended) |

Open Graph/Twitter: implemented on Phase 7 pages; **not** re-scraped with Facebook/Twitter debuggers in this run.
