#!/usr/bin/env node
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync("test-results/lighthouse/summary.json", "utf8"));
const display = (n, digits = 0) => typeof n === "number" ? n.toFixed(digits) : "—";
const clean = (s) => String(s).replaceAll("|", "/").replaceAll("\n", " ").slice(0, 180);
console.log("## Mobile Lighthouse monitoring — median of repeated runs\n");
console.log("| Route | Runs | Performance | Accessibility | Best practices | SEO | LCP (ms) | CLS | TBT (ms) |");
console.log("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const row of rows) {
  const path = new URL(row.url).pathname;
  console.log(`| ${path} | ${row.successfulRuns}/${row.requestedRuns} | ${display(row.performanceScore)} | ${display(row.accessibilityScore)} | ${display(row.bestPracticesScore)} | ${display(row.seoScore)} | ${display(row.lcpMs)} | ${display(row.cls, 3)} | ${display(row.tbtMs)} |`);
  if (row.lcpElements?.length) console.log(`\n**${path} LCP candidates:** ${row.lcpElements.map(clean).join("; ")}\n`);
  if (row.layoutShiftElements?.length) console.log(`\n**${path} layout shift candidates:** ${[...new Set(row.layoutShiftElements.map((x) => clean(x.selector)))].join("; ")}\n`);
  const errors = row.samples?.filter((s) => s.error) ?? [];
  if (errors.length) console.log(`\n**${path} failed runs:** ${errors.map((s) => s.run).join(", ")}\n`);
}
console.log("\nThese are medians from a locally served static export, not the live production CDN. Individual run JSON files are included in the artifact.");
