#!/usr/bin/env node
/**
 * Runs Lighthouse against a running production server.
 * Usage: PLAYWRIGHT_PORT=3456 node scripts/lighthouse-audit.mjs
 * Requires: npm run build && npm run start -- -p 3456 (or set PLAYWRIGHT_BASE_URL)
 */
import { execFileSync } from "node:child_process";
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

for (const path of routes) {
  const url = `${base}${path}`;
  const slug = path.replace(/\//g, "_") || "root";
  const reportPath = join(outDir, `${slug}.json`);
  try {
    execFileSync(
      "npx",
      [
        "lighthouse",
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
    const audits = report.audits ?? {};
    summary.push({
      url,
      performanceScore: perf != null ? Math.round(perf * 100) : null,
      accessibilityScore: a11y != null ? Math.round(a11y * 100) : null,
      lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
    });
  } catch (err) {
    summary.push({ url, error: String(err.message ?? err) });
  }
}

writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
