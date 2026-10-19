# Automated YouTube Music matching

The scheduled Spotify import first imports Spotify, then checks artist channel uploads, then searches up to 70 unlinked tracks per run through YouTube Data API.

A YouTube Music watch URL is saved **only** if exactly one candidate comes from the exact artist's named `Artist - Topic` channel, has an exact normalized title, and differs by at most 3 seconds from the Spotify duration. Existing URLs are preserved. Other results are reported in the `youtube-music-auto-review` artifact; they are **not** automatically linked.

YouTube search costs 100 quota units per track. A run of 70 searches consumes about 7,000 units plus video lookups, which fits within a typical 10,000-unit daily quota **only if no other workflows consume too much**. Reduce `YOUTUBE_SEARCH_LIMIT` in the workflow if needed. Search is incomplete and Topic channel names alone cannot cryptographically prove ownership. Verify any questionable result manually using the existing Link Manager.

The existing catalog validation, tests, lint, typecheck, build and restricted-file auto-merge guard still run. If any fail, the workflow does not publish new links.
