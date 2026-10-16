#!/usr/bin/env node
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync("test-results/lighthouse/summary.json", "utf8"));
const display = (n, digits = 0) => typeof n === "number" ? n.toFixed(digits) : "—";
console.log("## Mobile Lighthouse monitoring");
console.log("");
console.log("| Route | Performance | Accessibility | Best practices | SEO | LCP (ms) | CLS | TBT (ms) |");
console.log("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const row of rows) {
  const path = new URL(row.url).pathname;
  console.log(`| ${path} | ${display(row.performanceScore)} | ${display(row.accessibilityScore)} | ${display(row.bestPracticesScore)} | ${display(row.seoScore)} | ${display(row.lcpMs)} | ${display(row.cls, 3)} | ${display(row.tbtMs)} |`);
  if (row.error) console.log(`\nAudit error for ${path}: ${row.error.replaceAll("|", "/").replaceAll("\n", " ")}\n`);
}
console.log("");
console.log("Scores vary across runs. These measurements use a locally served static export, not the live production CDN.");
