# Deployment guide — Wolfyslayer Records

Production-ready configuration for the existing Next.js 15 App Router site. **Do not assume commercial or high-traffic use is allowed on free tiers** — read each provider’s current Terms of Service and fair-use limits.

## Prerequisites

1. Git repository connected to your host.
2. Domain (optional for staging; required for production SEO).
3. Supabase project (optional for seed-only preview; **required** for CMS, auth, contact storage, uploads).

## Environment variables

Copy from `.env.example`. **Production minimum:**

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical URL, sitemap, Open Graph |
| `NEXT_PUBLIC_SUPABASE_URL` | CMS/auth | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | CMS/auth | Browser client + RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Contact + server tasks | **Server only** on host |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Display on contact page |
| `NEXT_PUBLIC_PRESS_EMAIL` | Optional | Press page |
| `CONTACT_WEBHOOK_URL` | Optional* | Alternative to Supabase contact table |
| `NEXT_PUBLIC_SOCIAL_*` | Optional | Footer/social links |

\* At least one of Supabase (`contact_submissions` + service role) **or** `CONTACT_WEBHOOK_URL` must be set or the contact form returns **503** (by design).

## Database migrations

Run in Supabase SQL editor **in order**:

1. `001_initial_schema.sql`
2. `002_localized_content.sql`
3. `003_artist_featured_releases.sql`
4. `004_cms_storage_indexes.sql`
5. `005_contact_submissions_insert_rls.sql` — **Phase 8 security fix**

Allowlist admin user:

```sql
insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
```

Optional seed: `supabase/seed-from-app.sql` (`ON CONFLICT DO NOTHING`).

## Build commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run start
```

CI recommendation: add `npm run test:e2e` after `build` when Playwright browsers are installed.

## Hosting options

### Vercel (common for Next.js)

- **Pros:** Native App Router support, preview deployments, easy env management, HTTPS.
- **Free tier limits:** Bandwidth, build minutes, and commercial use restrictions — verify [Vercel plans and fair use](https://vercel.com/docs/plans) before production launch.
- **Steps:** Import repo → set env vars → set production domain → deploy from `main`.
- **HSTS:** Automatic on `*.vercel.app`; custom domain gets HTTPS certificates via Vercel.

### Netlify

- Next.js via adapter; check current Next 15 compatibility in Netlify docs.
- Free tier: build minutes and bandwidth caps; commercial use may require paid plan.

### Cloudflare Pages

- Good global CDN; configure Next.js according to Cloudflare’s current adapter docs.
- Free tier: suitable for many static/SSR workloads; review limits for media-heavy sites.

### Self-hosted (VPS)

- Run `npm run build && npm run start` behind nginx/Caddy with TLS (Let’s Encrypt).
- You manage Node process, updates, and Supabase connectivity.

## Domain & HTTPS

1. Purchase domain from registrar (or use provider subdomain for staging only).
2. Point DNS **A/AAAA** or **CNAME** to host (Vercel: `cname.vercel-dns.com` etc.).
3. Set `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com` (no trailing slash inconsistency in env).
4. Enable **HTTPS only** redirects at host.
5. Enable **HSTS** at CDN when stable (not bundled in Next config here).

## Post-deploy verification

| Check | How |
|-------|-----|
| Locales | `/en`, `/sv` |
| Admin gate | `/admin` redirects to login |
| Contact | Submit form — expect success only with backend configured |
| SEO | Fetch `/sitemap.xml`, `/robots.txt` |
| Security headers | `curl -I https://yourdomain.com/en` |
| CWV | Host RUM (Vercel Speed Insights, web-vitals, etc.) — lab Lighthouse ≠ field |

## Performance in production

- Serve images via Next Image Optimization on supported hosts.
- Keep Spotify embeds lazy-loaded (already implemented).
- Consider CDN cache for `public/artists/*` photography after you replace placeholders.
- Monitor LCP/CLS in **field data**; Phase 8 lab Lighthouse did **not** meet LCP/CLS targets on home/artist pages (see `docs/TEST_RESULTS.md`).

## Remaining manual configuration (go-live)

1. Replace placeholder seed content and SVG assets with approved art/copy via admin.
2. Run `node scripts/sync-artist-images.mjs` or upload official portraits.
3. Configure streaming URLs, pre-save links, and smart link metadata per release.
4. Set contact delivery (Supabase and/or webhook) and test a real submission.
5. Create Supabase admin user(s) and disable public registration.
6. Apply migration **005** if the project was created before Phase 8.
7. Set social env vars or use admin site settings when DB-backed.
8. Register domain in Search Console; validate sitemap.
9. Test OG tags with platform debuggers (optional but recommended).
10. Confirm legal/commercial use of chosen hosting plan for a public label site.

## What is implemented vs verified

| Item | Implemented | Verified in Phase 8 |
|------|-------------|---------------------|
| Public site + i18n | Yes | Playwright smoke |
| CMS + RLS | Yes | Code review; **not** live DB test |
| Contact form | Yes | 503 path automated; success path manual |
| Release hub / smart links | Yes | Page smoke |
| Security headers | Yes | `curl` on local prod server |
| E2E responsive matrix | Yes | Playwright 48/48 |
