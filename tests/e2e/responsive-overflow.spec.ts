import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 600, 768, 820, 1024, 1280, 1440, 1920, 2560];

const PUBLIC_ROUTES = [
  "/en",
  "/sv",
  "/en/artists",
  "/en/artists/frostmark",
  "/en/music",
  "/en/music/frostmark-placeholder-release",
  "/en/releases/frostmark-placeholder-release",
  "/en/upcoming",
  "/en/news",
  "/en/news/welcome-to-wolfyslayer-records",
  "/en/about",
  "/en/contact",
  "/en/press",
];

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow, "horizontal overflow (scrollWidth - clientWidth)").toBeLessThanOrEqual(2);
}

test.describe("responsive overflow audit", () => {
  for (const width of WIDTHS) {
    test(`portrait ${width}px — key routes`, async ({ page }) => {
      await page.setViewportSize({ width, height: Math.max(640, Math.round(width * 1.8)) });
      for (const route of PUBLIC_ROUTES) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(300);
        await assertNoHorizontalOverflow(page);
      }
    });

    test(`landscape ${width}px — home and catalog`, async ({ page }) => {
      const height = Math.min(430, Math.round(width * 0.45));
      await page.setViewportSize({ width, height: Math.max(320, height) });
      for (const route of ["/en", "/en/music", "/en/artists/frostmark"]) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await assertNoHorizontalOverflow(page);
      }
    });
  }

  test("mobile menu opens without overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("text zoom simulation (125%) on contact form", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/contact");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "125%";
    });
    await assertNoHorizontalOverflow(page);
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("long search string on music catalog", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/en/music");
    const long = "A".repeat(120);
    await page.getByLabel(/search/i).fill(long);
    await assertNoHorizontalOverflow(page);
  });
});
