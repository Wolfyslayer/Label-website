#!/usr/bin/env node
/** Verifies official asset files under public/assets exist. */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const required = [
  "assets/favicons/favicon.svg",
  "assets/favicons/icon-32.png",
  "assets/favicons/icon-48.png",
  "assets/favicons/icon-180.png",
  "assets/favicons/icon-192.png",
  "assets/favicons/icon-512.png",
  "assets/logos/wolfyslayer-records-symbol.svg",
  "assets/logos/wolfyslayer-records-light.png",
  "assets/banners/label-hero-1280x512.webp",
  "assets/artists/frostmark/profile-1024.webp",
  "assets/artists/wolfyslayer/profile-1024.webp",
  "assets/backgrounds/frostmark-dark-1920x1080.webp",
  "assets/backgrounds/wolfyslayer-dark-1920x1080.webp",
  "assets/fallback/release-cover-neutral.svg",
];

const missing = required.filter((rel) => !existsSync(join(publicDir, rel)));
if (missing.length) {
  console.error("Missing required assets:\n", missing.map((m) => `  public/${m}`).join("\n"));
  process.exit(1);
}

console.log(`Asset verification passed (${required.length} official files).`);
