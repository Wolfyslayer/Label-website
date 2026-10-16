# Phase 17.7 mobile vitals investigation

Initial Lighthouse monitoring run 38854859571 (CI-local static export) measured homepage TBT 1686 ms, Frostmark CLS 0.499, and contact CLS 0.402. These are single-run findings, not confirmed live-site regressions.

The Playwright diagnostics suite observes layout shifts and implicated DOM elements, and browser long tasks at a 390px mobile viewport. GitHub Actions saves its JSON output as the mobile-vitals-diagnostics artifact. It is non-blocking.

Review the first report before changing the design or client JavaScript. Observed CLS sums differ from Lighthouse session-window CLS, and long-task timing alone does not identify the responsible function. After attributing issues, make focused fixes and compare multiple Lighthouse runs.
