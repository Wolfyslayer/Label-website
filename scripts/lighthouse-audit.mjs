#!/usr/bin/env node
/**
 * Runs Lighthouse against a running production server.
 * Usage: PLAYWRIGHT_PORT=3456 node scripts/lighthouse-audit.mjs
 * Requires: npm run build && npm run start -- -p 3456 (or set PLAYWRIGHT_BASE_URL)
 */
import { execFileSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ??
  `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? "3456"}`;

const routes = ["/en", "/en/music", "/en/artists/frostmark", "/en/contact"];
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "test-results", "lighthouse");
mkdirSync(outDir, { recursive: true });

const summary = [];
let failures = 0;

// Allow CI to invoke Lighthouse without downloading packages or prompting interactively.
const lighthouseBin = process.platform === "win32" ? "lighthouse.cmd" : "lighthouse";
const lighthousePath = join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", ".bin", lighthouseBin);
try {
  accessSync(lighthousePath, constants.X_OK);
} catch {
  console.error("Lighthouse executable not found. Run npm ci before auditing.");
  process.exit(1);
}

for (const path of routes) {
  const url = `${base}${path}`;
  const slug = path.replace(/\//g, "_") || "root";
  const reportPath = join(outDir, `${slug}.json`);
  try {
    execFileSync(
      lighthousePath,
      [
        url,
        "--quiet",
        "--chrome-flags=--headless --no-sandbox",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json",
        `--output-path=${reportPath}`,
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
      ],
      { stdio: "pipe", env: process.env },
    );
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    const perf = report.categories?.performance?.score;
    const a11y = report.categories?.accessibility?.score;
    const seo = report.categories?.seo?.score;
    const bestPractices = report.categories?.["best-practices"]?.score;
    const audits = report.audits ?? {};
    summary.push({
      url,
      performanceScore: perf != null ? Math.round(perf * 100) : null,
      accessibilityScore: a11y != null ? Math.round(a11y * 100) : null,
      seoScore: seo != null ? Math.round(seo * 100) : null,
      bestPracticesScore: bestPractices != null ? Math.round(bestPractices * 100) : null,
      lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
    });
  } catch (err) {
    failures += 1;
    summary.push({ url, error: String(err.message ?? err) });
  }
}

writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

if (failures > 0) {
  console.error(`Lighthouse failed on ${failures} of ${routes.length} routes.`);
  process.exitCode = 1;
}
