# Phase 17.4 — Static performance size budgets

After `npm run build:pages`, run `npm run check:performance`. This scans files in `out/` and writes `test-results/performance/budget-report.json`. GitHub Actions uploads the report as a downloadable artifact on every run.

Current **initial warning-only thresholds** (uncompressed KiB across the entire export, not page transfer sizes):

| Metric | Threshold |
| --- | ---: |
| Total JavaScript | 1500 KiB |
| Total CSS | 350 KiB |
| Largest JavaScript file | 350 KiB |
| Largest CSS file | 180 KiB |
| Largest image file | 900 KiB |

These are provisional guardrails, **not measured baselines**. Check the first report and tune budgets against actual results. The script logs warnings without failing CI by default. After calibrating the thresholds, set `PERF_BUDGET_STRICT=1` for enforcement.

These metrics are deterministic build artifact sizes. They do not indicate actual user network traffic, LCP, Lighthouse performance, caching, or route-specific JS. The existing `npm run audit:lighthouse` is available separately and is not executed in this PR.
