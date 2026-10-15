#!/usr/bin/env node
/** Verifies referenced public asset files exist (run after build or on source tree). */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const required = [
  "assets/brand/wr-rune-monogram.svg",
  "assets/fallback/release-cover-neutral.svg",
  "artists/frostmark-raven-portrait.jpg",
  "artists/frostmark-raven-hero.jpg",
  "artists/wolfyslayer-viking-portrait.jpg",
  "artists/wolfyslayer-viking-hero.jpg",
  "favicon.svg",
  "apple-touch-icon.png",
  "og-default.png",
];

const missing = required.filter((rel) => !existsSync(join(publicDir, rel)));
if (missing.length) {
  console.error("Missing required assets:\n", missing.map((m) => `  public/${m}`).join("\n"));
  process.exit(1);
}

const seed = readFileSync(join(root, "lib/data/seed.ts"), "utf8");
const srcRefs = [...seed.matchAll(/src:\s*"(\/[^"]+)"/g)].map((m) => m[1].slice(1));
const brokenSeed = srcRefs.filter((rel) => !existsSync(join(publicDir, rel)));
if (brokenSeed.length) {
  console.error("Seed references missing files:\n", brokenSeed.map((p) => `  /${p}`).join("\n"));
  process.exit(1);
}

console.log(`Asset verification passed (${required.length} core files + ${srcRefs.length} seed paths).`);
