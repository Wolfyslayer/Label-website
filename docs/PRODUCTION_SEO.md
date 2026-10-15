# Phase 11 — Custom domain, SEO & production readiness

Production site: **https://wolfyslayer.online**  
Hosting: **GitHub Pages** (static export from Next.js)

## Domain & GitHub Pages (manual)

These steps are **not** changed by code in this repo. DNS is managed at your registrar (e.g. Namecheap).

1. **GitHub → Settings → Pages → Build and deployment:** Source = **GitHub Actions**.
2. **Custom domain:** `wolfyslayer.online` (must match `public/CNAME`).
3. **DNS (at registrar):** Point apex `@` to GitHub Pages IPs or use ALIAS/ANAME per [GitHub custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Do not change DNS from this agent.
4. After DNS shows as verified in GitHub, enable **Enforce HTTPS**.

### HTTPS verification (do not assume SSL is live)

After merge and deploy:

1. Open `https://wolfyslayer.online` in a browser — confirm certificate is valid (padlock).
2. Run: `curl -sI https://wolfyslayer.online | head -5` — expect `HTTP/2 200` (or `301` to trailing slash if configured).
3. Open `https://wolfyslayer.online/sitemap.xml` and `https://wolfyslayer.online/robots.txt`.
4. In GitHub **Settings → Pages**, confirm custom domain shows **DNS check successful** and HTTPS is available.

If HTTPS stays unavailable, wait for DNS propagation or fix A/AAAA/CNAME records at the registrar; GitHub cannot issue a certificate until the domain resolves correctly.

## Build-time environment

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://wolfyslayer.online` |
| `NEXT_PUBLIC_BASE_PATH` | *(empty)* |
| `NEXT_PUBLIC_STATIC_HOSTING` | `1` |

Set in `.github/workflows/deploy-github-pages.yml` for CI. Local parity: `npm run build:pages`.

## SEO features in code

- **`app/sitemap.ts`** — localized URLs with `en` / `sv` alternates where applicable.
- **`app/robots.ts`** — allows public site; disallows `/admin/`; points to sitemap on `siteConfig.url`.
- **Per-page metadata** — titles, descriptions, canonical + hreflang via `buildAlternates`.
- **Open Graph / Twitter** — `pageOpenGraph`, `releaseShareMetadata`, default brand image `/og-default.png`.
- **JSON-LD** — Organization (label) on all site pages; MusicGroup / MusicAlbum + MusicRecording on artist and release pages. Wording describes an **independent music label**, not a registered company.

## Validate after build

```bash
npm run build:pages
npm run validate:seo
```

Optional: `npm run test:e2e` (serves `out/`).

## Optional repository variables

- `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` — contact form on static hosting.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — build-time CMS read (anon only).
