# Phase 19 — Merch automation plan

## Scope
- Static /en/merch and /sv/merch landing page on GitHub Pages.
- Three collections: Wolfyslayer Records, Frostmark, Wolfyslayer.
- No fake products, prices, buy buttons, or published inventory.
- Keep checkout and payments outside GitHub Pages.

## Printify automation — gated rollout
1. Create and verify a Printify merchant account and Pop-Up Store; complete required Stripe verification and EU GPSR settings.
2. Verify with Printify support or a nonpublic test product whether the Public API can create **and publish** products into the Pop-Up Store. The general Products API does not guarantee channel publication.
3. Keep PRINTIFY_API_TOKEN in a secure server-side environment (never NEXT_PUBLIC_*, frontend, GitHub commit, or static export). Use minimal permissions.
4. Prepare approved original artwork as print-ready transparent PNG; verify print size, resolution, margins, and rights. Avoid using web previews as print masters.
5. Discover actual blueprint, print provider, variant IDs and EU shipping costs through the catalog API. Never hardcode unverified products or prices.
6. Draft products in batches by brand and category (tee, hoodie, poster). Include pricing and shipping review, explicit manual approval, idempotency to avoid duplicates, and dry-run by default.
7. Publish only after successful sample orders and manual review of quality, returns, tax, and consumer information. No automatic order placement.
8. Sync approved product titles, images, availability and URLs into a validated static merch catalog at build time. Keep external checkout links.

## API references
- https://developers.printify.com/
- https://help.printify.com/hc/en-us/articles/12051515136529-How-can-I-create-a-Pop-Up-Store

## Safety
No public token or client-side API calls. No automatic publication without explicit approval. Pop-Up Store API compatibility is unverified.
