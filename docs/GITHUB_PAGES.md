# GitHub Pages deployment

The default **`npm run build`** produces a static site in **`out/`** suitable for free GitHub Pages (no Node server at runtime).

## Production domain (Wolfyslayer Records)

- **Site URL:** `https://wolfyslayer.online`
- **`public/CNAME`** contains `wolfyslayer.online` (included in `out/` on deploy).
- CI sets `NEXT_PUBLIC_SITE_URL=https://wolfyslayer.online` and empty `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy-github-pages.yml`.

### Manual GitHub settings

1. **Settings → Pages → Build and deployment:** Source = **GitHub Actions** (not “Deploy from branch”).
2. **Settings → Pages → Custom domain:** `wolfyslayer.online` (or `www.wolfyslayer.online` if you prefer — then update `public/CNAME` and DNS to match).
3. Enable **Enforce HTTPS** once DNS is verified (see **`docs/PRODUCTION_SEO.md`** for verification steps — do not assume SSL is live without checking).
4. **Optional repository variables** (Settings → Secrets and variables → Actions → Variables):
   - `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` — public Formspree (or similar) URL for the contact form.
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — optional build-time CMS read (anon key only).
5. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to Actions; it must never appear in the static bundle.

## Custom domain at root (general)

1. Set **Settings → Pages → Custom domain**.
2. Keep `public/CNAME` in sync with that hostname.
3. `NEXT_PUBLIC_BASE_PATH` must stay **empty** for apex/custom root domains.

## Project site (`username.github.io/repo-name`)

- `NEXT_PUBLIC_SITE_URL=https://YOUR_USER.github.io`
- `NEXT_PUBLIC_BASE_PATH=repo-name` (no slashes)

## Content updates

- Edit `lib/data/seed.ts` and push (triggers rebuild), **or**
- Optionally set repository **variables** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` so content is pulled at **build time** (site remains static after deploy). The workflow builds successfully without them (seed data).

## CMS / API (not on Pages)

The full Supabase admin and `/api/contact` live under **`server-routes/`**. See **`server-routes/README.md`**. Static `/admin` shows an explanation page only.

## Contact form

Configure a free **[Formspree](https://formspree.io)** form (or similar CORS-enabled endpoint):

```bash
NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx
```

Do **not** put service role keys or private webhooks in `NEXT_PUBLIC_*` variables.

## Local preview of static output

```bash
npm run build
npx serve out
```

## Node deployment (optional)

```bash
npm run build:node
```

Restore `server-routes/cms-admin` → `app/admin`, `server-routes/api` → `app/api`, and `middleware.example.ts` → `middleware.ts` for full CMS locally.
