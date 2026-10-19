# YouTube Music artist profiles

Official artist handles supplied by the owner:

- Frostmark: https://music.youtube.com/@frostmarkofficial
- Wolfyslayer: https://music.youtube.com/@wolfyslayermusic

The website stores these public links in `content/artists/*.json` as `streamingLinks.youtubeMusic`. These handles are **not** YouTube channel IDs (`UC...`) and do not need GitHub secrets.

For future automated discovery, configure the GitHub Actions secret `YOUTUBE_API_KEY` (Google Cloud YouTube Data API v3 key). Resolve each handle to a channel ID with the documented `channels.list?part=id&forHandle=...` API and verify the resolved channel's identity before linking any videos. The YouTube Data API does **not** provide a complete official YouTube Music album/track catalog. Do not assume the first video or search result matches a Spotify release. Store only verified release URLs; otherwise use clearly labeled search fallback links.

No YouTube API key or secret has been created by this change, and automatic track matching is not yet implemented.
