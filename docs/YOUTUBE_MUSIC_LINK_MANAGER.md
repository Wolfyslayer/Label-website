# YouTube Music Link Manager

The website is a static GitHub Pages export. It has **no public write API**. To avoid exposing a secret-based editor on the public site, use the repository's GitHub Actions interface. GitHub's repository permissions control who can run it.

## Find missing links

1. Open **Actions → YouTube Music Link Manager → Run workflow**.
2. Choose **report** and run.
3. Download the **youtube-music-coverage** artifact from the finished run. The Markdown report lists missing track and release links, including Spotify IDs.

## Add a verified direct link

1. Find the correct recording in YouTube Music and play it. Copy its direct URL, not the search-results page.
2. Open **Actions → YouTube Music Link Manager → Run workflow**.
3. Choose **set-track**, paste the Spotify **track ID** from the report, and the URL `https://music.youtube.com/watch?v=...`.
4. For albums/EPs, choose **set-release**, use the Spotify **album ID**, and paste a verified YouTube Music playlist URL `https://music.youtube.com/playlist?list=...`.
5. The workflow validates the URL and content, then opens a **pull request for review**. Confirm the link points to the correct recording before merging. The workflow does **not** auto-merge.

A direct track link appears on the tracklist. For a single-track release, it is also used as the release-level YouTube Music button when no release-level URL exists. Release-level links work for albums/EPs.

Manual links survive future Spotify imports because `lib/spotify/map-content.ts` retains the existing track URL and release streaming links. The YouTube channel matcher also skips tracks that already have a URL.

**Limitations:** URL validation checks format, not whether the recording is truly yours; you must verify the artist and recording manually. The report does not automatically discover YouTube Music's full distributed catalog. A separate authenticated web-based manager would require a server-side backend and access-control implementation; it is intentionally not exposed through static GitHub Pages.
