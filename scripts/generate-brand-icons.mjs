#!/usr/bin/env node
/** Generates apple-touch-icon.png from the label monogram (run after SVG changes). */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg180 = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" rx="20" fill="#0a0e14"/>
  <g transform="translate(74 74) scale(2.05)">
    <path d="M5 25V7l11 14L27 7v18" stroke="#c9d1d9" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>
    <path d="M16 21v4" stroke="#c9d1d9" stroke-width="1.25" stroke-linecap="square" opacity="0.45"/>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg180)).png().toBuffer();
writeFileSync(join(root, "public/apple-touch-icon.png"), png);
console.log("Wrote public/apple-touch-icon.png");
