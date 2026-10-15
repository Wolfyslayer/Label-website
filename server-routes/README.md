# Node / server hosting (optional)

These files are **not** included in the GitHub Pages static export. They require a Node.js host (Vercel free tier, Netlify, self-hosted, etc.) with server actions and route handlers.

| Path | Purpose |
|------|---------|
| `cms-admin/` | Full Supabase CMS UI (formerly `app/admin/*`) |
| `api/` | Contact API + admin status probe |
| `middleware.example.ts` | Supabase admin gate + next-intl middleware |

## Restore for local CMS development

From the repo root:

```bash
cp -R server-routes/cms-admin/* app/admin/
cp -R server-routes/api app/
cp server-routes/middleware.example.ts middleware.ts
npm run dev
```

Use `npm run build:node` for a production server build with admin (not static export).

## GitHub Pages limitations

- No server actions, API routes, or middleware.
- Content updates: edit `lib/data/seed.ts` (or set Supabase env vars **at build time** in GitHub Actions) and redeploy.
- Contact form: configure `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` (e.g. Formspree free tier) or use the displayed email.
