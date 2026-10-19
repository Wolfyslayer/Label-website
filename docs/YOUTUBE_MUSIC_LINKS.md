# YouTube Music discovery links

Release cards and release detail pages show YouTube Music alongside Spotify.

- When a verified `streamingLinks.youtubeMusic` URL exists, the UI links directly to that release.
- Otherwise, the UI explicitly labels a YouTube Music **search** for the artist and release title. This is not a verified track/album link and may return unrelated results.
- The current content schema and streaming link components already support direct YouTube Music URLs.
- Spotify importer preserves existing `streamingLinks`, including manually confirmed YouTube Music URLs.
- No unofficial scraping, unverified matching, or YouTube API keys are required.

## Future exact-match automation
Use an approved provider or YouTube Data API to retrieve candidate videos and require explicit verification of artist, title, release type and ownership before persisting a direct YouTube Music URL. Do not automatically select the first search result.
