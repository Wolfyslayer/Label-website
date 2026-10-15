# Placeholder audit — Phase 14.5

**Date:** 2026-10-15  
**Goal:** Remove visible placeholder/demo content from the public site while preserving draft sources in the repo.

---

## Summary

| Action | Count |
|--------|------:|
| Content set to **draft** (hidden from site) | 3 files |
| **Removed** from public UI (unpublished) | Featured spotlight, catalog grid, upcoming, news |
| **Replaced** with factual copy (no invented history) | Wolfyslayer bios; Frostmark long bio trimmed |
| **Hidden** UI sections | Homepage catalog (no published releases), featured release, news preview, upcoming |
| **Code** | Featured release no auto-fallback; empty-catalog static export; contact form disabled without endpoint |

Public site now presents **two official artists with real artwork and Spotify embeds**, and **no published releases or news** until owner content is ready.

---

## Placeholders found and disposition

### `content/` (public-facing)

| Path | Issue | Action |
|------|--------|--------|
| `content/site.json` | `featuredReleaseId` pointed at placeholder release | **`featuredReleaseId`: `null`**, `homepageFeaturedNewsIds`: `[]` |
| `content/releases/frostmark-placeholder-release.json` | Sample title, neutral SVG cover, published | **`status`: `draft`** — kept in repo |
| `content/releases/wolfyslayer-upcoming-placeholder.json` | Sample upcoming title | **`status`: `draft`** — kept in repo |
| `content/tracks/frostmark-placeholder-track.json` | Sample track tied to draft release | **Unchanged** — not public (release draft) |
| `content/news/welcome-to-wolfyslayer-records.md` | Example post body with bracket placeholders | **`status`: `draft`** |
| `content/artists/frostmark.json` | Long bio ended with “[Placeholder…]” | **Removed bracket paragraph**; cleared `featuredReleaseIds` |
| `content/artists/wolfyslayer.json` | Bracket placeholder bios | **Replaced** with short factual intros (no invented discography) |

### Preserved (not public)

- `content/releases/_template.json`, `content/news/_template.md` — editor templates (`_` prefix or draft).
- `content/_review/README.md` — index of draft sample files for maintainers.

### Components / UI (legitimate internal use — **not removed**)

| Location | Notes |
|----------|--------|
| `components/ui/placeholder-banner.tsx` | Shown only when `cover.placeholder: true` on **published** content — none currently |
| `messages/*/placeholderAsset`, `placeholderPhoto` | i18n for asset flags |
| `lib/manager/*` | Music Manager form placeholders — not public site copy |
| `public/placeholders/*` | Legacy SVG stand-ins (not used for live artist display per ASSET_INVENTORY) |

### Build-only (not linked in nav or sitemap)

| Path | Purpose |
|------|---------|
| `/en|sv/{music,news,releases}/__static_export_placeholder__` | Next.js `output: export` requires at least one dynamic param when catalog is empty; pages call `notFound()` |

---

## Verified assets in use

| Entity | Paths |
|--------|--------|
| Label | `/assets/banners/label-hero-1280x512.webp`, logos under `/assets/logos/` |
| Frostmark | `/assets/artists/frostmark/profile-1024.webp`, `/assets/banners/frostmark-hero-1280x512.webp` |
| Wolfyslayer | `/assets/artists/wolfyslayer/profile-1024.webp`, `/assets/banners/wolfyslayer-hero-1280x512.webp` |

No unrelated artwork substituted.

---

## Code changes

| File | Change |
|------|--------|
| `lib/content/index.ts` | `getFeaturedRelease()` only when `featuredReleaseId` set — no fallback to first release |
| `app/[locale]/(site)/page.tsx` | Hide catalog section when zero published releases |
| `lib/content/static-export-params.ts` | Empty catalog static export helper |
| `app/[locale]/(site)/music|news|releases/[slug]/page.tsx` | Use helper + `notFound()` for placeholder slug |
| `components/contact/contact-form.tsx` | Hide submit when no `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` |
| `messages/en.json`, `messages/sv.json` | `contactForm.disabledStatic` |

---

## Still requires owner input

1. **First real release(s)** — publish JSON in `content/releases/` with official title, date, art, and HTTPS streaming URLs; set `featuredReleaseId` in `content/site.json` when ready.
2. **Wolfyslayer extended biography** — replace concise stub with approved long-form copy (both languages).
3. **Frostmark long biography** — optional expanded approved text (current text is factual, non-placeholder).
4. **News** — publish `welcome-to-wolfyslayer-records.md` or new posts when copy is final (`status: published`).
5. **Contact** — `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` and/or `NEXT_PUBLIC_CONTACT_EMAIL` in GitHub Actions variables.
6. **Social links** — `NEXT_PUBLIC_SOCIAL_*` env vars if footer should show icons instead of helper text.
7. **Spotify artist URLs** — present in content; **owner should confirm** they match official profiles (not re-verified against Spotify API in this phase).

---

## Screenshots (post-cleanup build)

<img alt="Homepage mobile EN 390px" src="/opt/cursor/artifacts/phase14-5-home-en-390.png" width="390" />

<img alt="Wolfyslayer artist page mobile 390px" src="/opt/cursor/artifacts/phase14-5-artist-wolfyslayer-390.png" width="390" />

<img alt="Homepage desktop EN 1440px" src="/opt/cursor/artifacts/phase14-5-home-en-1440.png" width="720" />

---

## Test results

```text
npm run validate:content  — pass (0 published news; draft warnings only)
npm run lint              — pass
npm run typecheck         — pass
npm run build             — pass
npm run test:e2e          — 55/55 pass
```

Functional smoke now asserts: no `[Placeholder` text on home/artist pages, empty music/news/upcoming states, contact without submit button, sitemap excludes `frostmark-placeholder-release`.

---

*Phase 15 (Music Manager) was not started as part of this task.*
