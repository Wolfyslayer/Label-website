# Phase 17.5 — Calibrated performance budgets

The initial real GitHub Actions measurement (run **38853909963**, 2026-10-16) reported these **uncompressed whole-export** sizes:

| Metric | Measured | Enforced threshold |
| --- | ---: | ---: |
| Total JavaScript | 1241.8 KiB | 1400 KiB |
| Total CSS | 68.8 KiB | 100 KiB |
| Largest JavaScript file | 213.9 KiB | 260 KiB |
| Largest CSS file | 68.8 KiB | 90 KiB |
| Largest image file | 2717.6 KiB | 3200 KiB |

The largest image is `assets/artists/frostmark/profile-original.png`. It is retained in the export, but this measurement **does not prove that the image is requested by browsers**. The 3200 KiB ceiling accommodates the current original without silently removing its protection. Optimize or relocate the original in a separate change only after verifying all references and requirements.

Run `npm run build:pages && npm run check:performance` locally. GitHub Actions runs this automatically and uploads `test-results/performance/budget-report.json`.

**Budgets now fail CI when exceeded.** To temporarily run in warning-only mode for investigation, set `PERF_BUDGET_STRICT=0`; do not change the workflow permanently without review.

These figures are **not** per-page network transfers, compression-adjusted sizes, Lighthouse scores or mobile LCP. The budgets catch growth in built files; they cannot guarantee PageSpeed scores. Review thresholds when adding major features and compare reports before adjusting them.
