import { test, expect } from "@playwright/test";

test.describe("launch readiness regressions", () => {
  test("contact page does not offer submit without endpoint", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("status")).toContainText(/not connected|inte kopplat/i);
    await expect(page.getByRole("button", { name: /send message/i })).toHaveCount(0);
  });

  test("static export 404.html is branded for unknown URLs", async ({ page }) => {
    await page.goto("/en/does-not-exist-route");
    await expect(page.getByRole("heading", { level: 1, name: /page not found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /english home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /svenska/i })).toBeVisible();
  });

  test("canonical and hreflang on built home (export)", async ({ page, baseURL }) => {
    await page.goto("/en");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    const href = await canonical.getAttribute("href");
    expect(href).toMatch(/\/en\/?$/);
    await expect(page.locator('link[hreflang="sv"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    void baseURL;
  });
});
