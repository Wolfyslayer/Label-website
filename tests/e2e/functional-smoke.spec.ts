import { test, expect } from "@playwright/test";

test.describe("functional smoke (seed / no Supabase)", () => {
  test("English and Swedish home render", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/\[Placeholder/i)).toHaveCount(0);
    await page.goto("/sv");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/\[Platshållare|\[Placeholder/i)).toHaveCount(0);
  });

  test("bilingual music catalog routes", async ({ page }) => {
    await page.goto("/en/music/");
    await expect(page.getByRole("heading", { level: 1, name: /music/i })).toBeVisible();
    await page.goto("/sv/music/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("music catalog has no placeholder releases", async ({ page }) => {
    await page.goto("/en/music");
    await expect(page.getByText(/\[Placeholder/i)).toHaveCount(0);
    await expect(page.getByText(/frostmark-placeholder-release/i)).toHaveCount(0);
  });

  test("artist page and Spotify profile link", async ({ page }) => {
    await page.goto("/en/artists/frostmark");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Frostmark");
    await expect(page.getByText(/\[Placeholder/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /listen on spotify/i }).first()).toHaveAttribute(
      "href",
      /open\.spotify\.com\/artist\//,
    );
    await expect(page.locator('iframe[src*="spotify"]')).toHaveCount(0);
  });

  test("upcoming releases page empty state", async ({ page }) => {
    await page.goto("/en/upcoming");
    await expect(page.getByRole("heading", { level: 1, name: /upcoming releases/i })).toBeVisible();
    await expect(page.getByText(/no upcoming|inga kommande/i)).toBeVisible();
  });

  test("news index empty state", async ({ page }) => {
    await page.goto("/en/news");
    await expect(page.getByText(/no news published|inga nyheter publicerade/i)).toBeVisible();
  });

  test("contact page shows official mailto", async ({ page }) => {
    await page.goto("/en/contact/");
    await expect(page.getByRole("link", { name: /contact@wolfyslayer\.online/i }).first()).toBeVisible();
    await expect(page.locator('a[href="mailto:contact@wolfyslayer.online"]').first()).toBeVisible();
    await page.goto("/sv/contact/");
    await expect(page.getByRole("link", { name: /contact@wolfyslayer\.online/i }).first()).toBeVisible();
  });

  test("robots and sitemap", async ({ request, baseURL }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsText = await robots.text();
    expect(robotsText).toMatch(/Disallow: \/admin\//);
    expect(robotsText).toMatch(/Sitemap:/);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const xml = await sitemap.text();
    expect(xml).toContain("/en/artists/");
    expect(xml).not.toContain("frostmark-placeholder-release");
  });
});
