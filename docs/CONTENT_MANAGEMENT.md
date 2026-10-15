# Content management (GitHub & mobile)

Wolfyslayer Records is a **static site**. All music, artists, and news live in the **`content/`** folder. When you push to **`main`**, GitHub Actions validates the content, builds the site, and deploys to **https://wolfyslayer.online**.

No admin panel, database, or paid CMS is required.

## Folder layout

```
content/
  site.json                 ← Label text, featured release, press kit
  artists/
    frostmark.json
    wolfyslayer.json
  releases/
    your-release-slug.json  ← One file per single / EP / album
  tracks/
    your-track-id.json      ← One file per track
  news/
    your-article-slug.md    ← Markdown + YAML frontmatter
```

Copy `_template.json` or `_template.md` when creating something new.

## Naming rules

| Item | Convention | Example |
|------|------------|---------|
| Release file | `{slug}.json` matching `"slug"` inside | `frostmark-placeholder-release.json` |
| Track file | `{id}.json` or descriptive name | `frostmark-placeholder-track.json` |
| News file | `{slug}.md` | `welcome-to-wolfyslayer-records.md` |
| Artwork | Put file under `public/assets/releases/` then reference `/assets/releases/...` |

**IDs** must be unique. **Slugs** must be lowercase with hyphens only (`a-z`, `0-9`, `-`).

## Draft vs published

Set `"status": "draft"` on releases or `"status": draft` in news frontmatter until you are ready to go live.

**Draft content never appears** on the public website. Only `"published"` is shown.

## Required fields (both languages)

Every localized field needs **`en`** and **`sv`**:

- Artist bios, taglines
- Release descriptions
- News title, excerpt, body

The build fails if translations are missing or if links/paths are invalid.

## Add a single

1. On GitHub (phone or desktop), open **Label-website → content/releases/**.
2. Tap **Add file → Create new file**.
3. Name it `my-single-slug.json` (copy from `content/releases/_template.json`).
4. Set `"type": "single"`, `"artistId": "artist-frostmark"` or `"artist-wolfyslayer"`.
5. Set `"releaseDate": "YYYY-MM-DD"` and `"releaseAt": "YYYY-MM-DDTHH:mm:ss.000Z"` (same calendar date).
6. Add **only real** `streamingLinks` URLs (`https://…`). Leave platforms out if you do not have a link yet.
7. Set `"status": "draft"` while editing; change to `"published"` when ready.
8. Add tracks under `content/tracks/` and list their `"id"` values in `"trackIds"`.
9. Commit to **`main`**. Wait for the green GitHub Actions deploy.

## Add an album or EP

Same as a single, but set `"type": "album"` or `"type": "ep"`. Add one track file per song with `"trackNumber": 1`, `2`, …

## Upload artwork

1. Upload image to **`public/assets/releases/`** (e.g. `my-cover.webp`) via GitHub’s file upload.
2. In the release JSON:

```json
"cover": {
  "src": "/assets/releases/my-cover.webp",
  "alt": { "en": "…", "sv": "…" },
  "placeholder": false
}
```

Use **`placeholder": true`** only with the neutral fallback `/assets/fallback/release-cover-neutral.svg` when no official art exists yet.

## Spotify & streaming links

On the **release** JSON:

```json
"streamingLinks": {
  "spotify": "https://open.spotify.com/album/…",
  "appleMusic": "https://music.apple.com/…",
  "youtubeMusic": "https://music.youtube.com/…"
}
```

Optional: `"spotifyAlbumUrl"` for embeds (must be a valid Spotify album URL).

On **artists**, set `"spotifyArtistUrl"` and matching `"streamingLinks.spotify"`.

Empty or missing platforms are **hidden** on the site — nothing is shown as a broken button.

## Publish news

1. Copy `content/news/_template.md` to `content/news/my-post-slug.md`.
2. Edit YAML at the top (title, excerpt, body in **en** and **sv**).
3. Set `status: published` and `publishedAt` in ISO UTC form.
4. Optional: `artistId: artist-frostmark` to link the article.
5. Commit to **`main`**.

## Edit artist biographies

Open **`content/artists/frostmark.json`** or **`content/artists/wolfyslayer.json`**.

Edit `shortBio`, `longBio`, and `tagline` (both languages). Official photos use paths under `/assets/artists/` and `/assets/banners/` — do not change unless you upload new files to `public/assets/`.

## Update from an Android phone

1. Install **GitHub** app and sign in.
2. Open **Wolfyslayer / Label-website**.
3. Browse to `content/` (e.g. `content/news/`).
4. Tap a file → pencil icon → edit.
5. Commit directly to **`main`** (or use a branch + pull request if you prefer review).
6. **Actions** tab → wait for **Deploy GitHub Pages** to finish.
7. Open https://wolfyslayer.online (refresh or clear cache if needed).

## Validate before push (optional, on a computer)

```bash
npm run validate:content
npm run build
```

CI runs the same checks automatically.

## Featured release & homepage news

In **`content/site.json`**:

- `"featuredReleaseId"`: id of the release to highlight on the home page.
- `"homepageFeaturedNewsIds"`: array of news `"id"` values to pin at the top of the news section.

## Do not

- Invent fake streaming URLs or album art.
- Set `"placeholder": false` without uploading the file under `public/`.
- Use `http://` links (HTTPS only).

For brand assets (logos, favicons), see **`docs/ASSET_INVENTORY.md`**.
