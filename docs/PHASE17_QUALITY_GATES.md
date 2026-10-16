# Phase 17.1 — Pull request quality gates

The GitHub Actions workflow `.github/workflows/quality-gates.yml` runs on pull requests targeting `main`, pushes to `main`, and manual dispatch.

It installs dependencies using `npm ci` and Node 20, then runs:

1. `npm run check:quality` (ESLint and TypeScript)
2. `npm run verify:assets` (required official asset files)
3. `npm run build:pages` (content validation, cover and hero image generation, and Next.js static export)
4. `npm run validate:seo` (sitemap, robots, canonical metadata, assets, and CNAME)

The workflow does **not** publish the site or require write permissions. A failed step fails the workflow, and failed build output is uploaded briefly for diagnosis.

## Repository configuration

After the workflow is proven green, set a branch protection/ruleset on `main` to require the **Lint, types, assets and static export** check before merge. This is a repository administrator setting; merely adding a workflow does not block merging.

## Follow-up phases

- Browser-level mobile/keyboard/accessibility smoke tests using existing Playwright tests.
- Broken internal-link/image checks on the generated static HTML.
- Performance budgets and Lighthouse regression monitoring.

## Important

GitHub Actions execution and real deployment are not verified by this PR alone. The workflow must complete successfully at least once before it should be made a required check. Remote Spotify cover downloads may occasionally fail; the current build retains fallback behavior.
