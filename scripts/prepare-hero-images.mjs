/**
 * Generate smaller, cacheable hero derivatives during static export.
 * Uses only local official image assets already in the repository.
 */
import { access, mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const bannerDir = resolve("public/assets/banners");
const originals = ["label-hero-1280x512.webp", "frostmark-hero-1280x512.webp", "wolfyslayer-hero-1280x512.webp"];
const variants = [480, 768];
await mkdir(bannerDir, { recursive: true });
for (const filename of originals) {
  const input = join(bannerDir, filename);
  try { await access(input); } catch { throw new Error(`Missing official hero source: ${input}`); }
  const basename = filename.replace("-1280x512.webp", "");
  for (const width of variants) {
    const target = join(bannerDir, `${basename}-${width}.webp`);
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 70, effort: 6 }).toFile(target);
    const bytes = (await stat(target)).size;
    console.log(`${basename}: ${width}px WebP = ${(bytes / 1024).toFixed(1)} KiB`);
  }
}
