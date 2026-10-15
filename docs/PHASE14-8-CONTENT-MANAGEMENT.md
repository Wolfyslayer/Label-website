# Phase 14.8 / 14.8.1 — Content management and security

## Public surfaces

The nonfunctional `/admin/`, `/admin/login/`, and public `/manager/` routes are removed from the Next.js App Router. This is removal, not password protection. GitHub Pages cannot securely validate a secret in browser-side JavaScript. Reusable `lib/manager/` utilities and dormant Node-only CMS sources remain in the repository but are not public routes.

## Daily Spotify updates

1. On Android, open GitHub → **Actions** → **Import Spotify catalog** → **Run workflow**, or wait for the daily run (06:23 UTC).
2. The workflow reads `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from GitHub Actions secrets, never browser-exposed variables.
3. If files change, review the **Spotify catalog import** pull request. No PR can mean no changes or a failed run; inspect Actions logs.
4. Check titles, dates, artwork, track order, Spotify links and REVIEW REQUIRED messages about missing items.
5. Merge only after review. The existing Pages workflow publishes the approved catalog.

## Manual content edits

Edit `content/artists/*.json` for artist biographies, `content/news/*.md` for news, `content/releases/*.json` and `content/tracks/*.json` for music metadata. Follow existing templates and use a branch and pull request. The static website cannot save these changes directly.

## Upcoming releases

Spotify cannot reliably provide unreleased DistroKid catalog entries. Add only owner-confirmed upcoming releases using existing content schemas and explicit dates. Do not fabricate releases.

## Recovery and safety

Close an incorrect import PR without merging. For already merged changes, revert the merge or restore content from an earlier commit using a corrective PR. Never put Spotify credentials into content, commits, or logs. The importer preserves missing Spotify releases and tracks; removals are owner-reviewed.

## Limitations

- Checks are daily, not instant DistroKid notifications.
- Existing `validate:content` checks remain the content health gate; automated external-link probing and a private CMS are not added.
- Old static pages may persist in external caches or historical deployments. Verify the new Pages artifact after deployment.
