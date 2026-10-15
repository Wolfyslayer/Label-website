# Music Manager — Wolfyslayer Records

The **Music Manager** is a browser-based editor at **`/manager/`** on your deployed site (e.g. https://wolfyslayer.online/manager/).

It helps you create and edit **releases**, **tracks**, **artists**, and **news** without hand-writing JSON or Markdown. It is fully compatible with Phase 12 `content/` files and GitHub Pages static export.

---

## Important — security & privacy

- **Not private.** Anyone who knows the URL can open the editor. There is **no password** and **no GitHub login** in this version.
- **No automatic publishing.** Export downloads files to your device. You upload them to GitHub manually.
- **No repository write access.** The app never stores GitHub tokens or calls the GitHub API.
- **Drafts on device only.** Autosave uses **localStorage** on this browser (non-sensitive editor state). Artwork files are **not** persisted in localStorage — re-select images after clearing data or switching devices.
- **Do not put secrets** in release text or URLs.

---

## Access

1. Open **https://wolfyslayer.online/manager/** (or `/manager/` on your preview build).
2. Read the yellow disclaimer banner.
3. Use the section tabs: Dashboard, Release, Tracks, Artist, News, Import, Export.

---

## Create a single (or EP / album)

1. Dashboard → **New single** (or EP / album).
2. Choose **Frostmark** or **Wolfyslayer**.
3. Enter **title** (slug auto-updates; you can edit slug).
4. Set **release date** and **status** (`draft` stays off the public site until published in JSON).
5. Fill **English** and **Swedish** descriptions (both required).
6. Optional: pick **artwork** from your phone — preview appears; export includes `public/assets/releases/{slug}/cover.*`.
7. Add **Spotify / Apple Music / YouTube Music** URLs only when you have real links (must be `https://`).
8. **Save to workspace**.

---

## Add tracks

1. Open **Tracks** tab.
2. Select the release.
3. **Add track**, edit titles, reorder with ↑ ↓.
4. Optional duration: `3:45` or seconds.
5. **Save tracks to workspace** (updates release `trackIds`).

---

## Edit artist (Frostmark / Wolfyslayer)

1. **Artist** tab → choose artist.
2. Edit bilingual bios, image paths, Spotify artist URL, social links (when added in UI).
3. **Save artist to workspace**.

Exported file: `content/artists/{slug}.json` — preserves required schema fields from the official baseline.

---

## Create news

1. **News** tab.
2. Fill slug, status, `publishedAt` (ISO UTC), title/excerpt/body in **en** and **sv**.
3. Optional related artist and cover path.
4. **Save news to workspace**.

Export: `content/news/{slug}.md` with YAML frontmatter (Phase 12 format).

---

## Import existing files

1. **Import** tab → select `.json` / `.md` from your device.
2. Valid files merge into the workspace; duplicates are **skipped** (not silently overwritten).

---

## Export ZIP

1. **Export** tab → **Download ZIP**.
2. Validation runs first (same Zod rules as the site build). Fix errors shown in red.
3. ZIP contains:
   - `content/releases/`, `content/tracks/`, `content/artists/`, `content/news/`
   - `public/assets/releases/…` for artwork you selected
   - `UPLOAD_INSTRUCTIONS.txt`
4. The manifest lists **exact repository paths**.

**Export does not deploy the site.**

---

## Upload to GitHub from Android

1. Export ZIP → unzip in **Files** or upload ZIP to Google Drive and unzip.
2. Install **GitHub** app → open **Wolfyslayer/Label-website**.
3. For each file, use **Add file → Upload files** (or edit in browser):
   - Match paths exactly (e.g. `content/releases/my-single.json`).
4. **Commit to `main`** with a clear message.
5. **Actions** tab → wait for **Deploy GitHub Pages** to finish (validate content, build, deploy).

---

## Trigger a new GitHub Pages deployment

Any push to **`main`** runs `.github/workflows/deploy-github-pages.yml`:

1. Validates `content/`
2. Builds static export
3. Deploys to https://wolfyslayer.online

---

## Local development

```bash
npm run dev
# Open http://localhost:3000/manager/
```

Run export unit checks:

```bash
npx tsx scripts/test-manager-export.ts
```

---

## Related docs

- [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) — manual JSON/Markdown editing
- [LAUNCH_AUDIT.md](./LAUNCH_AUDIT.md) — production checklist
