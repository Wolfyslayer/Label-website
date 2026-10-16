/**
 * Build-time cover generation for artwork owned by the label.
 * Place source files at assets/cover-sources/<release-slug>.jpg|jpeg|png|webp.
 * This script intentionally never fetches images from Spotify or the internet.
 * With no source files, it preserves existing committed generated assets.
 */
import { existsSync } from "node:fs";
import { readdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { join, resolve, extname, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const dir = resolve("assets/cover-sources");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
if (!existsSync(dir)) {
  console.log("No owned cover source directory; skipping image generation.");
  process.exit(0);
}
const names = (await readdir(dir)).filter((name) => extensions.has(extname(name).toLowerCase())).sort();
if (!names.length) {
  console.log("No owned cover source files; keeping existing manifest.");
  process.exit(0);
}
const entries = names.map((name) => ({
  slug: basename(name, extname(name)),
  source: join(dir, name),
}));
const slugs = new Set();
for (const { slug } of entries) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug)) {
    throw new Error(`Invalid or duplicate release slug: ${slug}`);
  }
  slugs.add(slug);
}
const temp = await mkdtemp(join(tmpdir(), "release-covers-"));
const input = join(temp, "covers.json");
try {
  await writeFile(input, JSON.stringify(entries));
  execFileSync(process.execPath, ["scripts/optimize-release-covers.mjs", input], { stdio: "inherit" });
} finally {
  await rm(temp, { recursive: true, force: true });
}
