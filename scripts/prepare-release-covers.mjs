/**
 * Build-time responsive cover preparation.
 * Local, owned files take priority. Published Spotify CDN artwork referenced by
 * content/releases/*.json is a fallback for the label's own releases.
 * Failed downloads retain the original remote image in the UI.
 */
import { existsSync } from "node:fs";
import { readdir, mkdtemp, writeFile, rm, readFile, stat } from "node:fs/promises";
import { join, resolve, extname, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const dir = resolve("assets/cover-sources");
const releasesDir = resolve("content/releases");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const validSlug = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const entries = new Map();
if (existsSync(dir)) {
  for (const name of (await readdir(dir)).sort()) {
    if (!extensions.has(extname(name).toLowerCase())) continue;
    const slug = basename(name, extname(name));
    if (!validSlug(slug) || entries.has(slug)) throw new Error(`Invalid or duplicate local cover slug: ${slug}`);
    entries.set(slug, { slug, source: join(dir, name) });
  }
}
const temp = await mkdtemp(join(tmpdir(), "release-covers-"));
let downloaded = 0;
try {
  if (existsSync(releasesDir) && process.env.SKIP_REMOTE_COVERS !== "1") {
    for (const name of (await readdir(releasesDir)).filter((n) => n.endsWith(".json") && !n.startsWith("_")).sort()) {
      let release;
      try {
        release = JSON.parse(await readFile(join(releasesDir, name), "utf8"));
      } catch (error) {
        console.warn(`Skipping invalid release JSON ${name}: ${error.message}`);
        continue;
      }
      const slug = release.slug;
      const rawUrl = release.cover?.src;
      if (!validSlug(slug ?? "") || entries.has(slug) || typeof rawUrl !== "string") continue;
      let url;
      try { url = new URL(rawUrl); } catch { continue; }
      if (url.protocol !== "https:" || !["i.scdn.co", "image-cdn-ak.spotifycdn.com", "image-cdn-fa.spotifycdn.com"].includes(url.hostname)) continue;
      // Restrict fetches to known Spotify CDN hosts; do not follow redirects to arbitrary hosts.
      try {
        const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const type = response.headers.get("content-type") ?? "";
        if (!type.startsWith("image/")) throw new Error("Non-image response");
        const length = Number(response.headers.get("content-length") || 0);
        if (length > 8_000_000) throw new Error("Image exceeds 8 MB");
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > 8_000_000) throw new Error("Image exceeds 8 MB");
        const source = join(temp, `${slug}.source`);
        await writeFile(source, bytes);
        entries.set(slug, { slug, source });
        downloaded++;
      } catch (error) {
        console.warn(`Could not fetch Spotify cover for ${slug}; retaining remote fallback: ${error.message}`);
      }
    }
  }
  if (entries.size === 0) {
    console.log("No covers to optimize; retaining existing assets.");
  } else {
    const input = join(temp, "covers.json");
    await writeFile(input, JSON.stringify([...entries.values()]));
    execFileSync(process.execPath, ["scripts/optimize-release-covers.mjs", input], { stdio: "inherit" });
  }
  console.log(`Prepared ${entries.size} release covers (${downloaded} from Spotify CDN).`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
