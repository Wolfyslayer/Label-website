# YouTube Music import

After the Spotify catalog import, GitHub Actions runs `npm run import:youtube-music` when the repository secret `YOUTUBE_API_KEY` is present.

It resolves the public handles `@frostmarkofficial` and `@wolfyslayermusic` using YouTube Data API v3, checks the channels' upload playlists (up to 250 uploads each), and adds a YouTube Music watch link **only** when the upload is from that channel, the channel display name exactly matches the artist, exactly one video's title matches the track title (or `Artist - Title`), and the duration differs by no more than three seconds. Existing confirmed links are never overwritten.

This is conservative channel-upload matching, **not** full YouTube Music catalog coverage. Topic channels, auto-generated music releases, altered titles, or songs missing from the uploads playlist may not match. Unmatched tracks remain without direct links; use the existing YouTube Music search fallback on release pages. The script fails on API errors rather than writing guesses.

GitHub setup: Settings → Secrets and variables → Actions → New repository secret → `YOUTUBE_API_KEY`. Keep the key private; artist handles are public. Restrict API key to YouTube Data API v3 where possible.

Manual dry run: `YOUTUBE_API_KEY=... npm run import:youtube-music -- --dry-run`.

Review generated track links before enabling unrestricted automatic merges; channel uploads can include lyric videos, alternate mixes, or different editions that happen to share a title and duration.
