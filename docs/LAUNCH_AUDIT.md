# Launch audit — Wolfyslayer Records

**Date:** 2026-10-15  
**Repository:** Wolfyslayer/Label-website  
**Canonical domain:** https://wolfyslayer.online  
**Hosting:** GitHub Pages · Next.js static export  

This document records Phase 14 production-readiness findings. **Verified facts** are separated from **assumptions** and **owner actions**.

---

## Executive summary

| Area | Status |
|------|--------|
| Static build & deploy workflow | **Ready** (export, CNAME, CI checks) |
| Content validation (critical) | **Pass** |
| Launch content (placeholders) | **Owner action required** before public marketing |
| Contact form on production | **Needs endpoint or mailto** (does not fake success) |
| Social links on production | **Needs env vars** (or accept footer helper text) |
| Branded 404 (GitHub Pages) | **Fixed in Phase 14** (`app/not-found.tsx` → `out/404.html`) |
| Live HTTPS / www | **Partially verified** (see Production checks) |

**Launch-readiness assessment:** Safe to deploy **technically**; **not** ready for full public launch marketing until placeholder releases, Wolfyslayer bios, contact path, and optional social URLs are finalized by the label.

---

## 1. Production website audit

Pages reviewed in code, static export (`out/`), Playwright e2e (en/sv routes), and **live fetch of** https://wolfyslayer.online/en/ **(content snapshot, 2026-10-15).**

| Page | en | sv | Notes |
|------|----|----|-------|
| Homepage | ✓ | ✓ | Featured spotlight still shows **placeholder release** (content) |
| Artists index | ✓ | ✓ | |
| Artist detail (Frostmark, Wolfyslayer) | ✓ | ✓ | Wolfyslayer bios are placeholder copy |
| Music catalog | ✓ | ✓ | |
| Release detail | ✓ | ✓ | Placeholder titles/banners clearly marked |
| Release hub (`/releases/[slug]`) | ✓ | ✓ | Smart link + streaming grid |
| Upcoming | ✓ | ✓ | Countdown for dated placeholder |
| News | ✓ | ✓ | One published welcome article |
| About | ✓ | ✓ | |
| Press | ✓ | ✓ | Official assets wired |
| Contact | ✓ | ✓ | Form **errors** on static hosting without endpoint |
| Header / footer / language | ✓ | ✓ | WR rune + wordmark; language `<select>` |
| 404 (unknown URL) | ✓ | — | Branded `404.html` after Phase 14 fix |
| Admin | ✓ | — | Static notice (no CMS on Pages) |

**Assumption:** Styling matches Phase 13 Nordic design on production after PR #17 is merged/deployed.

---

## 2. Content integrity (`content/`)

**Verified (automated):** `npm run validate:content` — schema, references, asset paths, dates, duplicate ids.

**Launch warnings (non-blocking, printed after validate):** `lib/content/launch-warnings.ts`

| Code | Location | Owner action |
|------|----------|--------------|
| `placeholder_release_title` | Both published releases | Replace `[Placeholder…]` titles with official names |
| `placeholder_release_artwork` | Both releases | Replace neutral SVG covers with official art |
| `missing_streaming_urls` | Both releases | Add HTTPS streaming URLs when live |
| `placeholder_artist_bio` | Frostmark long bio, Wolfyslayer short/long | Replace bracket placeholder paragraphs |
| `featured_release_placeholder` | `content/site.json` | Point `featuredReleaseId` at first **real** release |

**Verified behaviors:**

- Draft news/templates (`_template.md`, `_template.json`) are **not** loaded (`_` prefix skipped).
- `status: "draft"` items are filtered via `published()` in `lib/content/index.ts`.
- Streaming buttons use `getConfiguredStreamingLinks()` — empty URLs hidden.
- Placeholder artwork shows localized banner (`common.placeholderAsset` / “Platshållare”).
- No fabricated “real” release names were added in Phase 14.

**Owner must confirm:** Spotify artist IDs in `content/artists/*.json` match official profiles (not re-verified against Spotify API in this audit).

---

## 3. SEO & domain

**Local export verified:** `npm run validate:seo` after `npm run build:pages`

| Check | Result |
|-------|--------|
| `out/CNAME` | `wolfyslayer.online` |
| `robots.txt` | `Sitemap: https://wolfyslayer.online/sitemap.xml`, `Disallow: /admin/` |
| `sitemap.xml` | Absolute URLs on `https://wolfyslayer.online`, `xhtml:link` hreflang en/sv |
| Canonical / OG / Twitter | Present in `out/en/index.html` |
| Favicons / apple-touch | Under `out/assets/favicons/` + root sync |
| JSON-LD | Artists/releases via existing `JsonLd` components |

**Production checks:**

- **Verified:** Homepage HTML content at https://wolfyslayer.online/en/ (via automated fetch).
- **Not verified in this run:** Live `sitemap.xml` / `www.wolfyslayer.online` (fetch returned errors from audit tooling; **assumption:** apex works if homepage loads).
- **DNS:** Not modified (no evidence of misconfiguration in repo).

---

## 4. Mobile & accessibility

**Playwright:** `tests/e2e/responsive-overflow.spec.ts` — widths 320–2560px, public routes en/sv.  
**Phase 14 additions:** `tests/e2e/launch-readiness.spec.ts` (contact, 404, hreflang, SV placeholder label).

**Verified in CI/local e2e:** No horizontal overflow on key routes; mobile menu; language switcher at 320px; keyboard skip link; reduced-motion CSS; Spotify iframe `loading="lazy"`.

**Phase 14 fixes:** Social link `aria-label`s; localized placeholder banners; branded 404.

---

## 5. Performance (Lighthouse)

**Environment:** Local static server (`serve out`), mobile form factor, `npm run audit:lighthouse`.

| URL | Performance | Accessibility | LCP (ms) | CLS | TBT (ms) |
|-----|-------------|---------------|----------|-----|----------|
| `/en` | 75 | 96 | ~7654 | 0 | ~69 |
| `/en/music` | 93 | 95 | ~3247 | 0 | ~61 |
| `/en/artists/frostmark` | 90 | 96 | ~3617 | 0 | ~20 |
| `/en/contact` | 95 | 96 | ~2872 | 0 | ~34 |

**Finding:** Home LCP is driven by hero imagery + font preload (expected for cinematic hero). CLS is good. No code change required for launch; optional future: lighter mobile hero priority.

---

## 6. Contact & external links

| Item | Status |
|------|--------|
| Contact form | **Verified:** Shows error on static hosting when `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` unset — does **not** show success |
| GitHub Actions | Can inject `vars.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` at build time |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional mailto on contact page |
| Social links | From env at build; footer shows helper text when empty |
| Internal links | Covered by e2e smoke + overflow tests |

---

## 7. GitHub Pages deployment

**Verified in** `.github/workflows/deploy-github-pages.yml`:

- `npm ci` → verify assets → validate content → sync icons → lint → typecheck → build with `NEXT_PUBLIC_SITE_URL=https://wolfyslayer.online`
- Export checks: `CNAME`, `404.html` (branded), locale indexes, sitemap, favicons, no service role leak
- `validate:seo` on `out/`
- No runtime Node/DB required for public site

---

## 8. Testing (Phase 14 run)

```text
npm run validate:content   — pass (+ launch warnings)
npm run lint               — pass
npm run typecheck          — pass
npm run build:pages        — pass
npm run validate:seo       — pass
npm run test:e2e           — 54/54 (after Phase 14 fixes)
npm run audit:lighthouse   — see table above
```

---

## 9. Issues fixed in Phase 14

| Severity | Issue | Fix |
|----------|-------|-----|
| **Critical** | Generic Next.js `404.html` on static hosting | `app/not-found.tsx` branded export; CI grep |
| Minor | Placeholder banner English-only on sv pages | `PlaceholderBanner` uses `next-intl` |
| Minor | Social icons raw `aria-label={key}` | `footer.socialAria.*` |
| Minor | Locale `not-found` header overlap | `page-offset`; footer social props |
| Tooling | No launch content report | `collectLaunchWarnings()` + validate output |

---

## 10. Remaining launch blockers (owner)

1. Replace placeholder **releases**, **featured release**, and **Wolfyslayer** bios in `content/`.
2. Configure **contact**: GitHub variable `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` and/or `NEXT_PUBLIC_CONTACT_EMAIL`.
3. Optional: `NEXT_PUBLIC_SOCIAL_*` for footer/social icons.
4. Confirm **Spotify** (and future streaming) URLs when releases go live.
5. Re-deploy `main` after content/env updates.

---

## 11. Files changed (Phase 14)

- `app/not-found.tsx` — branded static 404
- `app/[locale]/not-found.tsx` — layout polish
- `components/ui/placeholder-banner.tsx` — i18n
- `components/layout/social-links.tsx`, `components/artists/artist-social-links.tsx` — a11y labels
- `lib/content/launch-warnings.ts`, `scripts/validate-content.ts` — launch warnings
- `tests/e2e/launch-readiness.spec.ts` — regressions
- `.github/workflows/deploy-github-pages.yml` — 404 check
- `messages/en.json`, `messages/sv.json` — `socialAria`
- `docs/LAUNCH_AUDIT.md` — this document

---

*Phase 15 was not started.*
