# Phase 14.9 — Artist discovery

- Added keyboard-accessible anchor navigation on artist profiles (introduction, latest release, albums/EPs, singles, Spotify where present).
- Show the number of releases for each artist using localized plural rules.
- Added a Spotify availability toggle and one-click filter reset to the catalog, with Swedish and English copy.
- Related releases prioritize the same artist before other label artists; dates are newest-first within each group.
- No new backend, credentials, third-party trackers, or fabricated streaming links.

## Manual checks

1. Open `/en/artists/frostmark/` and `/sv/artists/wolfyslayer/` on mobile and desktop; test anchor links with keyboard.
2. Open `/en/music/` and `/sv/music/`; combine search, artist, year, format, and Spotify filter; reset all filters.
3. Confirm artist Spotify links open externally and releases without Spotify are not falsely marked as available.
4. Run `npm run validate:content`, `npm run lint`, `npm run typecheck`, and `npm run build` before merging.
