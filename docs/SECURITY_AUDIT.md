# Security audit — Wolfyslayer Records

**Date:** 2026-10-15  
**Scope:** Application code, Supabase schema/migrations, API routes, dependencies (high level)

## Summary

| Area | Assessment |
|------|------------|
| Admin authentication | Supabase Auth + `admin_users` allowlist; middleware gate on `/admin` when Supabase configured |
| Authorization | Server actions call `requireAdmin()`; RLS on content tables |
| Secrets | Service role key server-only; documented in `.env.example` |
| Contact abuse | Rate limit, honeypot, server validation |
| Uploads | Admin-only, type/size limits, Sharp re-encode to WebP |
| HTTP headers | Baseline security headers added in `next.config.ts` |
| Dependencies | `npm audit` reports known issues — see below |

## Authentication & authorization

**Implemented**

- `/admin/*` (except login): middleware redirects unauthenticated users to `/admin/login` when Supabase env is set.
- `requireAdmin()` used in server actions and `/api/admin/status`.
- `GET /api/admin/status`: 401 unauthenticated, 403 authenticated non-admin, 200 allowlisted admin (automated test covers 401).

**Manual / environment**

- Confirm public sign-up disabled in Supabase Auth for production.
- Confirm every admin UUID is inserted into `admin_users`.
- Without Supabase env, admin pages render but CMS actions fail closed — acceptable for local seed mode.

## Supabase RLS (review)

**Published content:** Anonymous read limited to `status = 'published'` (or admin) on artists, releases, news; tracks gated via published release join.

**Admin writes:** `is_admin()` policies on mutating tables.

**Contact submissions — fix in migration `005_contact_submissions_insert_rls.sql`**

- **Issue:** Policy `"Service insert contact" … with check (true)` allowed **any** client holding the anon key to insert rows directly, bypassing app rate limits and honeypot.
- **Fix:** Drop public insert policy; inserts only via Next.js API using **service role** (bypasses RLS). Apply migration on existing projects.

**Storage:** Migration `004` — public read on `media`, admin write (review bucket policies in Supabase dashboard after deploy).

## API routes

| Route | Controls |
|-------|----------|
| `POST /api/contact` | Zod schema, honeypot silent success, IP rate limit (5 / 15 min), 503 if no storage/webhook |
| `GET /api/admin/status` | Session + allowlist |

## File uploads (`uploadAdminMedia`)

- Max 5 MB; MIME allowlist (JPEG, PNG, WebP, GIF)
- Sharp pipeline: rotate, max 2000px, WebP output
- Random UUID paths under sanitized folder name
- Requires admin session + Supabase

**Residual risk:** GIF uploads accepted; Sharp converts to WebP — verify animated GIF handling is acceptable or restrict to static images only in a future hardening pass.

## XSS & user content

- Public news body rendered as React text (`whitespace-pre-line`), not raw HTML — admin-supplied text is escaped.
- JSON-LD uses `JSON.stringify` of known fields — do not inject HTML into titles in admin without encoding review.

## Form abuse

- Honeypot field `website`
- Rate limiting in-memory per IP (`lib/rate-limit.ts`) — **resets on serverless cold starts**; for high-traffic production consider Redis/KV-backed limiter.

## HTTP security headers (production build)

Verified on `GET /en`:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo disabled)

**Not configured in app (delegate to host):**

- `Strict-Transport-Security` — enable on hosting platform with HTTPS
- Full `Content-Security-Policy` — not added (would need tuning for Spotify embeds, Supabase storage URLs, and Next.js scripts)

## Dependency vulnerabilities

`npm audit` (2026-10-15): **11 vulnerabilities** (2 moderate, 9 high), mostly in dev toolchain (`eslint-config-next`, `@playwright/test`, transitive `fast-glob` / `braces`).

- **Action:** Track upstream updates; avoid `npm audit fix --force` without regression testing (semver-major ESLint stack).
- Production runtime attack surface is primarily **Next.js**, **React**, **Supabase clients** — review advisories for those packages separately.

## Secrets handling

| Secret | Exposure |
|--------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Expected public; RLS must enforce boundaries |
| `CONTACT_WEBHOOK_URL` | Server only |

**Never commit** `.env.local` or service keys (`.gitignore` covers env files).

## Checklist for go-live

1. Apply migrations **001 → 005** on production Supabase.
2. Disable public Auth sign-up; use allowlisted admins only.
3. Set production env vars on host (no secrets in client bundle).
4. Enable HTTPS and HSTS at CDN/host.
5. Rotate keys if any were ever committed or shared.
6. Optionally add WAF / bot protection in front of `/api/contact`.
