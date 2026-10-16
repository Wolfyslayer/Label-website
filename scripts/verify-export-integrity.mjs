#!/usr/bin/env node
/**
 * Validate same-site links and static resources in the exported HTML.
 * No network calls: external URLs are intentionally outside this check.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, extname, dirname } from "node:path";

const root = resolve("out");
if (!existsSync(root)) throw new Error("Missing out/ — run npm run build:pages first");
const failures = [];
const htmlFiles = [];
const skipSchemes = /^(?:https?:|mailto:|tel:|data:|blob:|javascript:|#|\/\/)/i;

function visit(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) visit(path);
    else if (item.isFile() && item.name.endsWith(".html")) htmlFiles.push(path);
  }
}
visit(root);

function existsExportPath(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return false; }
  if (decoded.includes("\\") || decoded.split("/").includes("..")) return false;
  const relative = decoded.replace(/^\/+/, "");
  const file = join(root, relative);
  return [file, join(file, "index.html"), `${file}.html`].some((p) => existsSync(p));
}

const attrs = /\b(href|src|poster)\s*=\s*(["'])(.*?)\2/gi;
let checked = 0;
for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(attrs)) {
    const [, attribute, , raw] = match;
    if (!raw || skipSchemes.test(raw) || raw.startsWith("#")) continue;
    // Relative URL resolution follows the browser's document URL semantics.
    let url;
    try {
      const htmlPath = htmlFile.slice(root.length).replaceAll("\\", "/");
      url = new URL(raw.replaceAll("&amp;", "&"), `https://wolfyslayer.online${htmlPath}`);
    } catch { failures.push(`${htmlFile}: malformed ${attribute}=${raw}`); continue; }
    if (url.origin !== "https://wolfyslayer.online") continue;
    checked++;
    if (!existsExportPath(url.pathname)) {
      failures.push(`${htmlFile.slice(root.length)}: ${attribute}="${raw}" → missing ${url.pathname}`);
    }
  }
}
const report = { htmlPages: htmlFiles.length, checkedReferences: checked, failures };
mkdirSync(resolve("test-results"), { recursive: true });
writeFileSync(resolve("test-results/export-integrity.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Checked ${checked} local href/src/poster references across ${htmlFiles.length} HTML pages.`);
if (failures.length) {
  console.error(`Found ${failures.length} missing local targets:\n${failures.slice(0, 40).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Export integrity passed.");
}
