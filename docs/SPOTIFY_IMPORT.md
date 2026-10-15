# Spotify catalog import

Wolfyslayer Records loads release and track metadata from **Spotify’s Web API** during a **local or CI import**. Credentials never ship to GitHub Pages or the browser.

## How it works

1. **Authenticate** with Spotify [Client Credentials](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow) using `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
2. **Fetch albums** for the fixed artist IDs:
   - Frostmark — `0edDVF0bL7PFu2Sc3ijDrP`
   - Wolfyslayer — `4B4kHkS5D9gK6Q3lNbDPml`
3. **Paginate** `GET /v1/artists/{id}/albums` (`include_groups=album,single`, market `SE`).
4. **Load each album** via `GET /v1/albums/{id}` and track pages via `GET /v1/albums/{id}/tracks` when needed.
5. **Filter** releases where the label artist is credited; skip `appears_on` / `compilation` groups.
6. **Dedupe** by Spotify album ID.
7. **Write** `content/releases/*.json`, `content/tracks/*.json`, update `content/site.json` (`featuredReleaseId` = most recent eligible release).
8. **Remove** known placeholder files (`frostmark-placeholder-release.json`, etc.) on successful write.

Cover art uses **HTTPS URLs from Spotify** (`i.scdn.co`, …) — not copied into `public/` unless you choose to manually download per [Spotify’s terms](https://developer.spotify.com/documentation/web-api).

## Commands

```bash
export SPOTIFY_CLIENT_ID=…
export SPOTIFY_CLIENT_SECRET=…
npm run import:spotify          # write content/
npm run import:spotify -- --dry-run   # report only
npm run test:spotify            # unit tests (mocked API)
```

After import:

```bash
npm run validate:content && npm run build
```

## GitHub Secrets

In the repository **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app secret (never commit) |

## Trigger import from a phone (GitHub Actions)

1. Open the repo on GitHub (app or browser).
2. **Actions** → **Import Spotify catalog** → **Run workflow** → **Run workflow**.
3. Wait for the job to finish (green check).
4. Open the **pull request** created by the workflow (`automation/spotify-catalog-import`).
5. Review files under `content/releases/` and `content/tracks/`, then merge when satisfied.

The workflow runs `validate:content`, lint, typecheck, and `build` before opening the PR. It does **not** push to `main` directly.

## Review checklist

- [ ] Titles and dates match Spotify (note **year/month** precision on older releases).
- [ ] Each release links to the correct Spotify album URL.
- [ ] Track order and durations look correct.
- [ ] No placeholder slugs remain.
- [ ] Homepage featured release is acceptable.

## Refreshing the catalog

Re-run the workflow or `npm run import:spotify`. Stable IDs (`release-spotify-{albumId}`, `track-spotify-{trackId}`) keep URLs idempotent; existing slugs are preserved when the Spotify album ID matches.

## API limitations (2026)

- Client Credentials access **catalog** endpoints only (no listener-specific data).
- Spotify **Development Mode** may require Premium and limits authorized users; endpoint restrictions for **new** apps tightened in 2026 — existing integrations may have postponed endpoint cuts (see [Spotify developer blog](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security)).
- Batch endpoints such as `GET /albums` (multiple IDs) were removed in the Feb 2026 changelog; this importer uses **single-album** calls.
- If the API returns **401/403**, the import **fails** with an explicit error — no fabricated catalog.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Missing secrets | Add `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` in Actions secrets |
| 401/403 from API | Confirm the app is active, credentials match, and the app can access catalog endpoints |
| Empty catalog | Verify artist IDs; check market availability (`SE`) |
| Validation fails on cover | Ensure cover URLs are `https://` from Spotify CDN |
| Workflow did not open PR | No file changes (catalog already up to date) or `create-pull-request` permissions |

## Manual fallback

If API access is blocked:

1. Create release JSON under `content/releases/` using `content/releases/_template.json`.
2. Add tracks under `content/tracks/`.
3. Set `spotifyAlbumUrl`, `streamingLinks.spotify`, and optional `spotifyAlbumId`.
4. Run `npm run validate:content`.

Use the **Music Manager** at `/manager/` to draft files and export a ZIP for review (Phase 15).
