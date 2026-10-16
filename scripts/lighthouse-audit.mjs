#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { accessSync, constants, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3456";
const routes = ["/en", "/en/music", "/en/artists/frostmark", "/en/contact"];
const repeats = Number(process.env.LIGHTHOUSE_RUNS ?? "3");
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 5) {
  console.error("LIGHTHOUSE_RUNS must be an integer from 1 to 5.");
  process.exit(1);
}
const outDir = join(root, "test-results", "lighthouse");
mkdirSync(outDir, { recursive: true });
const binary = join(root, "node_modules", ".bin", process.platform === "win32" ? "lighthouse.cmd" : "lighthouse");
try { accessSync(binary, constants.X_OK); } catch { console.error("Run npm ci before auditing."); process.exit(1); }

const median = (values) => {
  const numbers = values.filter((n) => typeof n === "number" && Number.isFinite(n)).sort((a, b) => a - b);
  if (!numbers.length) return null;
  const mid = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
};
const selectorFrom = (item) => item?.node?.selector ?? item?.node?.snippet ?? item?.selector ?? null;
const extractNode = (value) => {
  if (!value || typeof value !== "object") return null;
  if (value.type === "node" || value.selector || value.snippet) return selectorFrom(value);
  if (Array.isArray(value)) return value.map(extractNode).find(Boolean) ?? null;
  return Object.values(value).map(extractNode).find(Boolean) ?? null;
};
const summaries = [];
let failures = 0;
for (const path of routes) {
  const url = base + path;
  const slug = path.replace(/\//g, "_");
  const samples = [];
  for (let i = 1; i <= repeats; i++) {
    const reportPath = join(outDir, `${slug}-run${i}.json`);
    try {
      execFileSync(binary, [
        url, "--quiet", "--chrome-flags=--headless --no-sandbox",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--output=json", `--output-path=${reportPath}`,
        "--form-factor=mobile", "--screenEmulation.mobile=true",
      ], { stdio: "pipe", env: process.env, timeout: 180000 });
      const lhr = JSON.parse(readFileSync(reportPath, "utf8"));
      const audits = lhr.audits ?? {};
      const score = (key) => {
        const n = lhr.categories?.[key]?.score;
        if (typeof n !== "number") throw new Error(`Missing category ${key}`);
        return Math.round(n * 100);
      };
      const lcpItems = audits["largest-contentful-paint-element"]?.details?.items ?? [];
      const shiftItems = audits["layout-shift-elements"]?.details?.items ?? [];
      const lcpInsight = audits["lcp-discovery-insight"] ?? audits["largest-contentful-paint-element"];
      const clsInsight = audits["cls-culprits-insight"] ?? audits["layout-shift-elements"];
      samples.push({
        run: i,
        performanceScore: score("performance"),
        accessibilityScore: score("accessibility"),
        bestPracticesScore: score("best-practices"),
        seoScore: score("seo"),
        lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
        cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
        tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
        lcpElement: lcpItems.map(extractNode).find(Boolean) ?? extractNode(lcpInsight?.details?.items) ?? null,
        layoutShiftElements: (shiftItems.length ? shiftItems : (clsInsight?.details?.items ?? [])).slice(0, 5).map((item) => ({
          selector: extractNode(item),
          score: item.score ?? null,
        })),
      });
    } catch (error) {
      failures++;
      const message = String(error.message ?? error);
      console.error(`Audit failed: ${url}, run ${i}: ${message}`);
      samples.push({ run: i, error: message });
    }
  }
  const valid = samples.filter((sample) => !sample.error);
  const fields = ["performanceScore", "accessibilityScore", "bestPracticesScore", "seoScore", "lcpMs", "cls", "tbtMs"];
  const row = { url, successfulRuns: valid.length, requestedRuns: repeats };
  for (const field of fields) row[field] = median(valid.map((sample) => sample[field]));
  row.lcpElements = [...new Set(valid.map((sample) => sample.lcpElement).filter(Boolean))];
  row.layoutShiftElements = valid.flatMap((sample) => sample.layoutShiftElements ?? []).filter((item) => item.selector).slice(0, 12);
  row.samples = samples;
  summaries.push(row);
}
writeFileSync(join(outDir, "summary.json"), JSON.stringify(summaries, null, 2) + "\n");
console.log(JSON.stringify(summaries, null, 2));
if (failures) process.exitCode = 1;
