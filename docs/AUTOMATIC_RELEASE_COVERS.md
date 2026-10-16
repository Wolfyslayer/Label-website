# Automatic release cover optimization

The GitHub Pages static build runs `npm run prepare:release-covers` automatically, before `next build`.

## Add an owned album cover

1. Put an original cover you own or have permission to publish in `assets/cover-sources/`.
2. Name it exactly after the release slug, e.g. `ett-folk-ett-hem.png`. Supported extensions: jpg, jpeg, png, webp.
3. Commit the source file (or supply it in the build environment). The next static build creates 240, 480, and 640 px WebP variants in `public/assets/releases/` and updates `lib/assets/release-cover-manifest.json`.
4. Release cards automatically use responsive `srcSet` when a matching manifest entry exists. Other covers continue using their original source.

**No Spotify image scraping:** This process uses only explicitly supplied artwork. Empty or missing `assets/cover-sources/` does not delete existing variants.

## Verification

- Run `npm run check:quality` and `npm run build:pages`.
- Confirm each manifest entry has all three generated WebP files in the static `out/assets/releases/` export.
- Compare PageSpeed mobile image transferred bytes, LCP, CLS, and accessibility before/after deployment.
- Check the image at 320 px and 390 px mobile widths and on high-density screens.
- This does not modify third-party cache headers. Spotify fallback images are still unoptimized.

## Operational caveat

Generated output created in CI exists in that deployment's build artifact, but is not automatically committed to Git. Keep source files available to every build, or commit generated variants and the manifest together. Do not merge a manifest that points at missing files.
