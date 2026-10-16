# Automatic release cover optimization

`npm run build:pages` runs `prepare:release-covers` before Next.js static export.

## Source priority

1. **Local originals:** Put your own source files in `assets/cover-sources/<release-slug>.jpg|jpeg|png|webp`. These always win.
2. **Spotify fallback:** If no local file exists, the build reads `cover.src` from `content/releases/*.json`. Only HTTPS images hosted on `i.scdn.co`, `image-cdn-ak.spotifycdn.com`, or `image-cdn-fa.spotifycdn.com` are eligible. Use this only for cover art you own or have permission to reproduce.
3. **Existing remote image:** When a download fails, the page still uses the original URL (unless older committed optimized assets already exist).

The build generates 240/480/640px WebP images under `public/assets/releases/`, updates `lib/assets/release-cover-manifest.json`, and uses responsive `srcSet` in release cards. Downloads occur during builds, not in visitors' browsers. No Spotify credentials or scraping of Spotify pages are required.

Set `SKIP_REMOTE_COVERS=1` to disable remote downloads. Network failures for individual covers are logged and skipped. Redirects are disabled; downloads are limited to 8MB with a 10-second timeout.

## Checks before merge/deploy

- Run `npm run check:quality` and `npm run build:pages`.
- Confirm each manifest entry has 240, 480 and 640 WebP variants under `out/assets/releases/`.
- Compare image transfer bytes and Lighthouse mobile LCP/CLS after deployment; inspect responsive image requests on high-DPI mobile.
- Ensure your album cover licensing allows republishing from the Spotify-hosted copy.

**Operational note:** Build-generated images are part of that build's deployment artifact, not automatically committed to Git. Every deployment needs access to the original source or Spotify CDN. If the source is unavailable in a later build and the generated files were not committed, do not publish a manifest pointing to missing assets. A clean build should be used for final verification.

GitHub Pages cache headers cannot be controlled through Next.js `headers()` in static export.
