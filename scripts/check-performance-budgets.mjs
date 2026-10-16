#!/usr/bin/env node
/**
 * Deterministic static-export asset budget report.
 * Run after npm run build:pages. Exceeding calibrated JS/CSS budgets fails CI.
 * Set PERF_BUDGET_STRICT=0 to run in warning-only mode.
 */
import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, relative, extname } from "node:path";

const out = resolve("out");
if (!existsSync(out)) throw new Error("Missing out/; run npm run build:pages first.");

const budgets = {
  totalJavaScriptKiB: 1400,
  totalCssKiB: 100,
  largestJavaScriptKiB: 260,
  largestCssKiB: 90,
  largestImageKiB: 3200,
};
const assets = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (![".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(ext)) continue;
      assets.push({ path: relative(out, path).replaceAll("\\", "/"), bytes: statSync(path).size, ext });
    }
  }
}
walk(out);
const sum = (extensions) => assets.filter((a) => extensions.includes(a.ext)).reduce((n, a) => n + a.bytes, 0);
const largest = (extensions) => assets.filter((a) => extensions.includes(a.ext)).sort((a,b) => b.bytes-a.bytes)[0] ?? null;
const kib = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const js = largest([".js"]), css = largest([".css"]), image = largest([".png",".jpg",".jpeg",".webp",".avif",".gif",".svg"]);
const metrics = {
  totalJavaScriptKiB: kib(sum([".js"])),
  totalCssKiB: kib(sum([".css"])),
  largestJavaScriptKiB: kib(js?.bytes ?? 0),
  largestCssKiB: kib(css?.bytes ?? 0),
  largestImageKiB: kib(image?.bytes ?? 0),
};
const exceeded = Object.entries(budgets).filter(([name, limit]) => metrics[name] > limit)
  .map(([name, limit]) => ({ metric: name, actualKiB: metrics[name], budgetKiB: limit }));
const report = {
  note: "Uncompressed static export totals, NOT page download sizes or Lighthouse scores. Image threshold is informational for archived originals.",
  budgetsKiB: budgets,
  metricsKiB: metrics,
  largestAssets: { javascript: js, css, image },
  exceeded,
  baselineSource: "GitHub Actions run 38853909963, 2026-10-16",
  assetCount: assets.length,
};
const dir = resolve("test-results/performance");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "budget-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (exceeded.length) {
  console.warn(`Performance budget warning: ${exceeded.length} threshold(s) exceeded.`);
  if (process.env.PERF_BUDGET_STRICT !== "0") process.exitCode = 1;
} else console.log("Performance size budgets passed.");
