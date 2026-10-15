import { test, expect } from "@playwright/test";

test.describe("accessibility smoke", () => {
  test("skip link focuses main content", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("mobile menu escape closes and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const menuBtn = page.getByRole("button", { name: /open menu/i });
    await menuBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuBtn).toBeFocused();
  });

  test("contact page accessibility when form disabled", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("status")).toContainText(/not connected|inte kopplat/i);
    await expect(page.locator("#contact-privacy")).toBeVisible();
  });

  test("reduced motion preference respected in CSS", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    const duration = await page.evaluate(() => {
      const el = document.documentElement;
      return getComputedStyle(el).scrollBehavior;
    });
    expect(duration).toBe("auto");
  });
});
