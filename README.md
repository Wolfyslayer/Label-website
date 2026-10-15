# WOLFYSLAYER RECORDS — Official Label Website

Premium independent record label site for **Frostmark** and **Wolfyslayer**, built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and optional Supabase for auth, CMS, storage, and contact submissions.

## Quick start (no backend required)

Public pages run from typed seed data in `lib/data/seed.ts` until Supabase is connected.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000/en/](http://localhost:3000/en/) after `npm run dev` (or serve `out/` after `npm run build`).

**GitHub Pages:** see [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Static export to `out/` (GitHub Pages) |
| `npm run build:node`| Node server build (CMS in `server-routes/`) |
| `npm run start`| Serve Node build (`build:node` only) |
| `npm run lint` | ESLint                   |
| `npm run typecheck` | TypeScript check    |
| `npm run test:e2e`  | Playwright E2E (build + start server) |
| `npm run test:e2e:responsive` | Responsive overflow matrix only |
| `npm run audit:lighthouse` | Mobile Lighthouse (server must be running) |

## Environment variables

See `.env.example`. Minimum for local preview:

- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO

Optional:

- **Contact:** `NEXT_PUBLIC_CONTACT_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` + Supabase table *or* `CONTACT_WEBHOOK_URL`
- **Social links:** `NEXT_PUBLIC_SOCIAL_*`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase setup (CMS — Phase 5)

Run migrations **in order** in the Supabase SQL editor (each file is additive; they do not overwrite existing rows):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_localized_content.sql`
3. `supabase/migrations/003_artist_featured_releases.sql`
4. `supabase/migrations/004_cms_storage_indexes.sql` — creates the `media` bucket and storage RLS policies
5. `supabase/migrations/005_contact_submissions_insert_rls.sql` — removes anonymous INSERT on contact submissions (Phase 8)

Then:

1. Create a free [Supabase](https://supabase.com) project (if you have not already).
2. Copy **Project URL** and **anon key** to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add **service role** key as `SUPABASE_SERVICE_ROLE_KEY` (server only — contact form + service tasks).
4. In **Authentication**, create an admin user (email/password). Disable public sign-up for production.
5. Allowlist the user (service role SQL editor or privileged account):

   ```sql
   insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
   ```

6. **Optional seed** (does not overwrite existing IDs): `supabase/seed-from-app.sql`
7. Sign in at `/admin/login`. Use the dashboard to manage artists, releases, tracks, news, upcoming schedule, and site settings.

**Security model**

- No public admin grants; only rows in `admin_users` pass `is_admin()` RLS checks.
- Server actions call `requireAdmin()` and return explicit errors if save/delete fails (no fake success).
- Anonymous users cannot write content tables; storage uploads require admin RLS.
- Verify: `GET /api/admin/status` → `401` when logged out, `403` when logged in but not allowlisted, `200` for admins.

**Media uploads**

- Admin forms upload to the `media` bucket (WebP optimization via Sharp, max 5 MB).
- Official repo portraits under `public/artists/*.jpg` stay until you replace URLs in the artist editor.

## Contact form

The form validates on client and server, includes a honeypot, and rate-limits by IP. Success is returned only after:

- Insert into Supabase `contact_submissions` (service role), **or**
- Successful POST to `CONTACT_WEBHOOK_URL`

If neither is configured, the API responds with `503` and the UI shows an error (no fake success).

## Deployment (free tier friendly)

- **Vercel** — import repo, set environment variables, deploy.
- **Netlify / Cloudflare Pages** — standard Next.js adapter.

Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## Content placeholders

Seed entries use `[Placeholder …]` titles and SVG artwork under `public/placeholders/`. Replace via admin or by editing seed data before go-live. Do not publish invented releases, stats, or press without approval.

### Official artist photography (Phase 2)

The repo expects these files when you add the asset package (same paths, `.webp` or `.jpg`):

- `public/artists/frostmark-raven-portrait.*` — Frostmark raven portrait
- `public/artists/wolfyslayer-viking-portrait.*` — Wolfyslayer Viking portrait

Official JPEGs live under `public/artists/` (see `lib/assets/artist-media.ts`). The WR rune monogram is at `public/assets/brand/wr-rune-monogram.svg`. Full asset map: **`docs/ASSET_INVENTORY.md`**. Legacy `public/placeholders/` and `public/artists/*.svg` are not used in the live UI.

## Design system

Tokens live in `app/globals.css` (`@theme`) and `lib/design/tokens.ts`.

## Smart links & release hub (Phase 6)

- **Release hub** (promotion landing): `/en/releases/[slug]`, `/sv/releases/[slug]`
- Artwork, artist, localized description, streaming buttons (only when URLs are configured), share + copy link
- **Open Graph / Twitter** metadata points at the hub URL for social previews
- **Upcoming** page: UTC timestamp, browser-local time, countdown, pre-save only for valid `https` URLs
- Catalog vs upcoming still driven by `status`, `release_at`, and existing content helpers

## Music discovery (Phase 4)

- **Artist profiles** (`/en|sv/artists/[slug]`): cinematic hero, official profile JPEGs (from Spotify oEmbed for the configured artist URLs — refresh with `node scripts/sync-artist-images.mjs`), localized bios, Spotify link + embed, featured + full discography, label-mate picks
- **Catalog** (`/music`): search by **release title**, filter artist/year/type, sort by date, skeleton loading + empty states
- **Release pages**: artwork, tracklist, localized copy, official Spotify embed when URL supports it, streaming buttons, related releases, Open Graph / Twitter cards
- Catalog data remains **seed/admin managed** (no Spotify API scraping)

## Internationalization (Phase 3)

- **[next-intl](https://next-intl-docs.vercel.app/)** with locale routes **`/en`** and **`/sv`**
- First visit: browser language detection (unsupported locales → **English**)
- Manual language choice: **`NEXT_LOCALE` cookie** + switcher (preserves current path)
- UI strings: `messages/en.json`, `messages/sv.json`
- Editorial content: `{ en, sv? }` fields in seed/Supabase (`LocalizedString`), resolved in `lib/content/localize.ts` with **English fallback** when Swedish is missing
- Official **artist / release / track names** are not translated
- SEO: `alternates.languages`, canonical URLs, localized sitemap
- Admin: run `supabase/migrations/002_localized_content.sql` for optional `*_i18n` JSON columns

## Admin CMS (Phase 5)

- Mobile-friendly nav, dashboard counts, list + edit flows
- **EN/SV editorial fields** with missing-locale indicators
- Draft / published on artists, releases, news
- Secure image upload, delete confirmations (type slug to confirm)
- Upcoming releases = releases with `release_at` in the future

## Phase 8 — QA & production readiness

Documentation in `docs/`:

- `RESPONSIVE_AUDIT.md` — Playwright viewport matrix
- `TEST_RESULTS.md` — E2E, a11y smoke, Lighthouse lab metrics (honest CWV gaps)
- `SECURITY_AUDIT.md` — RLS, headers, contact/upload review
- `DEPLOYMENT_GUIDE.md` — hosting, env, domain, HTTPS, manual go-live steps

## Project structure

```
app/
  [locale]/(site)/ Public localized pages
  admin/           Authenticated CMS
  api/admin/       Admin auth probe
  api/contact/     Contact submission API
components/        UI, layout, music, home
lib/
  data/seed.ts     Fallback content
  content/         Data access layer
  supabase/        Clients + config
supabase/migrations/
```

## Spotify

Artist embeds use official Spotify URLs configured for Frostmark and Wolfyslayer. Album/track embeds appear only when valid Spotify album or track URLs are set on releases.
