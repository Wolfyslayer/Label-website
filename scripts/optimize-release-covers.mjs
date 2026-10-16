/**
 * Opt-in, build-time release cover optimizer.
 * Usage: node scripts/optimize-release-covers.mjs covers-source.json
 * Input: [{"slug":"release-slug","source":"path/to/owned-cover.jpg"}]
 * Only process cover art that you own or have permission to reproduce.
 * Commit the generated public/assets/releases/ files and lib/assets/release-cover-manifest.json.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import sharp from "sharp";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/optimize-release-covers.mjs covers-source.json");
  process.exit(1);
}
const entries = JSON.parse(await readFile(resolve(input), "utf8"));
if (!Array.isArray(entries)) throw new Error("Expected an array of {slug, source} entries");
const out = resolve("public/assets/releases");
await mkdir(out, { recursive: true });
const manifest = {};
for (const entry of entries) {
  const { slug, source } = entry;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || typeof source !== "string" || !source.trim()) {
    throw new Error("Invalid slug or source path");
  }
  const inputPath = resolve(source);
  const widths = [240, 480, 640];
  for (const width of widths) {
    await sharp(inputPath).rotate().resize(width, width, { fit: "cover", withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(join(out, `${slug}-${width}.webp`));
  }
  manifest[slug] = true;
  console.log(`Optimized ${slug}`);
}
await writeFile(resolve("lib/assets/release-cover-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Commit the generated files before deployment.");
