# Secure Control Room (initial version)

URL: `/control-room/`. The route is deliberately not included in site navigation; **the URL is not a security boundary**. Authentication uses Supabase Auth (email/password), not a password embedded in static HTML or JavaScript. Supabase row-level security restricts both reading and writing proposals to allowlisted admins.

## Setup
1. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the static site's build environment. These are public client credentials, **never** the service role key.
2. Run `supabase/migrations/20261022_admin_youtube_links.sql` in the Supabase SQL editor.
3. Create your administrator account in Supabase Authentication; use the SQL editor to insert its user UUID into `public.admin_users`. Never expose a self-service admin grant.
4. Open `/control-room/`, sign in, and submit a direct YouTube Music watch link for a track.
5. To publish proposals to the static catalog, use the GitHub Actions workflow added in this PR. Set repository secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Do not place the service role key in `NEXT_PUBLIC_*` variables.

This first phase manages YouTube Music track link proposals. The GitHub workflow performs a second server-side admin-membership check, validates against the checked-out catalog, updates only permitted track JSON files and creates a PR for human review. Nothing is auto-merged. The public site remains static.

**Security**: Enable MFA in Supabase if supported for the admin account. Use a strong unique password. Never use GitHub Actions secrets as browser login credentials. Revoke admin access by removing its row in `admin_users`.
