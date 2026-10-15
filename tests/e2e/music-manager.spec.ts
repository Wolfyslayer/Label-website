import { test, expect } from "@playwright/test";

test.describe("Music Manager", () => {
  test.beforeEach(async ({ page }) => {
    let githubRequested = false;
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.includes("api.github.com") || url.includes("github.com/login/oauth")) {
        githubRequested = true;
      }
      return route.continue();
    });
    await page.goto("/manager/");
    await page.waitForTimeout(100);
    expect(githubRequested).toBe(false);
  });

  test("shows public-tool disclaimer", async ({ page }) => {
    await expect(page.getByText(/not a private admin/i)).toBeVisible();
    await expect(page.getByText(/does not log in to GitHub/i)).toBeVisible();
  });

  test("release editor validates and saves to workspace", async ({ page }) => {
    await page.getByRole("button", { name: /new single/i }).click();
    await page.locator("#release-title").fill("Manager Test Single");
    await page.locator("textarea").first().fill("English description.");
    await page.locator("textarea").nth(1).fill("Svensk beskrivning.");
    await page.getByRole("button", { name: /save to workspace/i }).click();
    await expect(page.getByText(/releases: 1/i)).toBeVisible();
  });

  test("mobile layout without horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/manager/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(page.getByRole("button", { name: /new single/i })).toBeVisible();
  });
});
