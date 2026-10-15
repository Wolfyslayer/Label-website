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

const svgOg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#0a0e14"/>
  <g transform="translate(540 215) scale(6)">
    <path d="M5 25V7l11 14L27 7v18" stroke="#c9d1d9" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>
    <path d="M16 21v4" stroke="#c9d1d9" stroke-width="1.25" stroke-linecap="square" opacity="0.45"/>
  </g>
  <text x="600" y="420" text-anchor="middle" fill="#c9d1d9" font-family="Georgia, serif" font-size="42" letter-spacing="12">WOLFYSLAYER</text>
  <text x="600" y="470" text-anchor="middle" fill="#8b949e" font-family="Georgia, serif" font-size="22" letter-spacing="18">RECORDS</text>
</svg>`;

const ogPng = await sharp(Buffer.from(svgOg)).png().toBuffer();
writeFileSync(join(root, "public/og-default.png"), ogPng);
console.log("Wrote public/og-default.png");
