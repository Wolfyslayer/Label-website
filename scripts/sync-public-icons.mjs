#!/usr/bin/env node
/** Mirrors official favicons from public/assets/favicons to public/ root for legacy clients. */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "public/assets/favicons");

const copies = [
  ["favicon.svg", "favicon.svg"],
  ["icon-180.png", "apple-touch-icon.png"],
  ["icon-48.png", "favicon-48.png"],
  ["icon-32.png", "favicon-32.png"],
];

for (const [from, to] of copies) {
  const src = join(srcDir, from);
  const dest = join(root, "public", to);
  if (!existsSync(src)) {
    console.error(`Missing ${src}`);
    process.exit(1);
  }
  copyFileSync(src, dest);
  console.log(`Synced public/${to} ← assets/favicons/${from}`);
}
