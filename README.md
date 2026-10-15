# WOLFYSLAYER RECORDS — Official Label Website

Premium independent record label site for **Frostmark** and **Wolfyslayer**, built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and optional Supabase for auth, CMS, storage, and contact submissions.

## Quick start (no backend required)

Public pages run from typed seed data in `lib/data/seed.ts` until Supabase is connected.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Production server        |
| `npm run lint` | ESLint                   |
| `npm run typecheck` | TypeScript check    |

## Environment variables

See `.env.example`. Minimum for local preview:

- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO

Optional:

- **Contact:** `NEXT_PUBLIC_CONTACT_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` + Supabase table *or* `CONTACT_WEBHOOK_URL`
- **Social links:** `NEXT_PUBLIC_SOCIAL_*`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase setup

1. Create a free [Supabase](https://supabase.com) project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
3. Create a **Storage** bucket named `media` (public read). Restrict uploads to authenticated admins via policies.
4. Copy project URL and anon key into `.env.local`. Add **service role** key server-side only (never expose to the client).
5. In Authentication, create a user (email/password). **Do not** use public sign-up for admin access.
6. Insert the user's UUID into `admin_users`:

   ```sql
   insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
   ```

7. Seed artists/releases from `lib/data/seed.ts` manually or via admin at `/admin`.

Public registration does **not** grant admin rights. Row Level Security enforces published-only reads; writes require `admin_users` membership.

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

Until then, labeled SVG stand-ins are served from `public/artists/*.svg`. Update `lib/assets/artist-media.ts` if your filenames differ.

## Design system

Tokens live in `app/globals.css` (`@theme`) and `lib/design/tokens.ts`. UI chrome supports **English** and **Svenska** via the header language selector (cookie `NEXT_LOCALE`).

## Project structure

```
app/
  (site)/          Public pages
  admin/           Authenticated CMS
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
