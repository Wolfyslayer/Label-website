import { test, expect } from "@playwright/test";

test.describe("launch readiness regressions", () => {
  test("contact form does not fake success on static hosting", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel(/^name$/i).fill("Launch Audit");
    await page.getByLabel(/^email$/i).fill("audit@example.com");
    await page.getByLabel(/^subject$/i).fill("Static hosting check");
    await page.getByLabel(/^message$/i).fill("This message should not report success without an endpoint.");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.locator('p[role="alert"].text-danger')).toContainText(
      /static hosting|Formspree|endpoint/i,
    );
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("static export 404.html is branded for unknown URLs", async ({ page }) => {
    await page.goto("/en/does-not-exist-route");
    await expect(page.getByRole("heading", { level: 1, name: /page not found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /english home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /svenska/i })).toBeVisible();
  });

  test("placeholder artwork label is localized on Swedish release page", async ({ page }) => {
    await page.goto("/sv/music/frostmark-placeholder-release");
    await expect(page.getByText(/platshållare/i).first()).toBeVisible();
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
