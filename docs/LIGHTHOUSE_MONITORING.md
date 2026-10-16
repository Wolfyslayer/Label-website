# Phase 17.6 — Mobile Lighthouse monitoring

The `Mobile Lighthouse monitoring` GitHub Actions workflow runs every Monday at **06:17 UTC** and supports manual `workflow_dispatch` runs.

It builds the static GitHub Pages export, serves it on localhost, and runs the existing Lighthouse script against four English routes: homepage, music, Frostmark artist page, and contact. The GitHub Actions run summary includes category scores, LCP, CLS and Total Blocking Time. Detailed JSON reports are downloadable as a workflow artifact (30-day retention).

**This is a separate monitoring workflow, not a required pull-request status check.** Lighthouse fluctuations or audit errors do not block a release. The audit step is explicitly non-blocking; build/server failures still surface as workflow failures.

Measurements reflect the CI runner and locally served static export, **not the public production CDN** or real-user Core Web Vitals. Compare multiple runs before acting on small changes. The existing static asset budgets remain strict in `quality-gates.yml`.

To inspect results: GitHub → Actions → Mobile Lighthouse monitoring → latest run → Summary or Artifacts. Use `Run workflow` to trigger an on-demand measurement.
