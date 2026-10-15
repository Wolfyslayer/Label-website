# GitHub Pages deployment

The default **`npm run build`** produces a static site in **`out/`** suitable for free GitHub Pages (no Node server at runtime).

## Custom domain at root

1. Set repository **Settings → Pages → Custom domain** (e.g. `www.wolfyslayerrecords.com`).
2. Add a `CNAME` file in `public/` if your DNS provider requires it (optional when configured in GitHub UI).
3. GitHub Actions env:
   - `NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com`
   - `NEXT_PUBLIC_BASE_PATH=` (empty)

## Project site (`username.github.io/repo-name`)

- `NEXT_PUBLIC_SITE_URL=https://YOUR_USER.github.io`
- `NEXT_PUBLIC_BASE_PATH=repo-name` (no slashes)

## Content updates

- Edit `lib/data/seed.ts` and push (triggers rebuild), **or**
- Provide Supabase anon URL/key in GitHub Actions **secrets** so content is pulled at **build time** (site remains static after deploy).

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
