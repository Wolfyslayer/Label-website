import { test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const routes = ["/en/", "/en/artists/frostmark/", "/en/contact/"];
const report: Array<Record<string, unknown>> = [];

test.beforeAll(() => mkdirSync("test-results/vitals", { recursive: true }));

for (const route of routes) {
  test(`collect layout shift and long task diagnostics: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      type Shift = { value: number; sources: string[]; time: number };
      const global = window as Window & { __vitals?: { shifts: Shift[]; longTasks: { duration: number; time: number }[] } };
      global.__vitals = { shifts: [], longTasks: [] };
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[] };
            if (!shift.hadRecentInput) {
              global.__vitals?.shifts.push({
                value: shift.value,
                time: shift.startTime,
                sources: (shift.sources ?? []).map((s) => {
                  const node = s.node;
                  if (!(node instanceof Element)) return "unknown";
                  return node.tagName.toLowerCase() + (node.id ? `#${node.id}` : "") + (typeof node.className === "string" ? "." + node.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
                }),
              });
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch { /* browser may not expose layout shift entries */ }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) global.__vitals?.longTasks.push({ duration: entry.duration, time: entry.startTime });
        }).observe({ type: "longtask", buffered: true });
      } catch { /* unsupported browser */ }
    });
    const response = await page.goto(route, { waitUntil: "load" });
    await page.waitForTimeout(1800);
    const details = await page.evaluate(() => {
      const vitals = (window as Window & { __vitals?: { shifts: { value: number; sources: string[]; time: number }[]; longTasks: { duration: number; time: number }[] } }).__vitals;
      const shifts = vitals?.shifts ?? [];
      const longTasks = vitals?.longTasks ?? [];
      return {
        observedCls: Math.round(shifts.reduce((sum, shift) => sum + shift.value, 0) * 1000) / 1000,
        largestShifts: [...shifts].sort((a, b) => b.value - a.value).slice(0, 8),
        longTaskCount: longTasks.length,
        longTaskTotalMs: Math.round(longTasks.reduce((sum, task) => sum + task.duration, 0)),
        longestTasks: [...longTasks].sort((a, b) => b.duration - a.duration).slice(0, 8),
      };
    });
    report.push({ route, httpStatus: response?.status() ?? null, ...details });
    writeFileSync("test-results/vitals/diagnostics.json", JSON.stringify(report, null, 2) + "\n");
  });
}
