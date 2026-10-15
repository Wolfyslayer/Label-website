# Phase 14.6 — Press kit & contact cleanup

**Date:** 2026-10-15

## Public copy removed

| Location | Removed |
|----------|---------|
| Contact page | Supabase, `CONTACT_WEBHOOK_URL`, `NEXT_PUBLIC_*`, static-hosting implementation notes |
| Contact form (disabled) | Developer “not connected” panel with env var names |
| Press page | `configureEmail`, `downloadMissing`, placeholder-asset instructions |
| Footer | “Email configured via environment” |
| Social links | “Configure in environment variables” when empty |

## Behavior

- **Press email:** Shown only when `NEXT_PUBLIC_PRESS_EMAIL` or `NEXT_PUBLIC_CONTACT_EMAIL` is set; section hidden otherwise.
- **Contact form:** Rendered only when `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` is set.
- **Contact email:** Prominent mailto when `NEXT_PUBLIC_CONTACT_EMAIL` is set.
- **No form + no email:** Short professional `unavailable` message (en/sv).
- **Privacy:** Form-specific notice only when the form is enabled.
- **Social:** Icons only when URLs exist; empty state is silent (footer + contact).

## Owner configuration (optional)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public mailto on Contact + footer |
| `NEXT_PUBLIC_PRESS_EMAIL` | Press mailto (falls back to contact email) |
| `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | Enables contact form (e.g. Formspree) |
| `NEXT_PUBLIC_SOCIAL_*` | Footer / contact social icons |

Internal validation and docs (e.g. `docs/LAUNCH_AUDIT.md`) unchanged.

## Tests

- `npm run validate:content` — pass  
- `npm run lint` / `typecheck` / `build` — pass  
- `npm run test:e2e` — 56/56 pass  
