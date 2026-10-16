/**
 * Ensure the static export never references missing generated cover variants.
 * Run after prepare:release-covers, before Next.js builds the pages.
 */
import { readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
const manifest = JSON.parse(await readFile(resolve("lib/assets/release-cover-manifest.json"), "utf8"));
let verified = 0;
for (const [slug, enabled] of Object.entries(manifest)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || enabled !== true) {
    throw new Error(`Invalid cover manifest entry: ${slug}`);
  }
  for (const width of [240, 480, 640]) {
    const file = join(resolve("public/assets/releases"), `${slug}-${width}.webp`);
    try {
      await access(file);
    } catch {
      throw new Error(`Missing optimized release cover: ${file}`);
    }
  }
  verified++;
}
console.log(`Verified ${verified} optimized release covers.`);
