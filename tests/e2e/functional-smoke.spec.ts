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

  test("music catalog empty state without placeholder releases", async ({ page }) => {
    await page.goto("/en/music");
    await expect(page.getByText(/no released music in the catalog/i)).toBeVisible();
  });

  test("artist page and Spotify embed iframe", async ({ page }) => {
    await page.goto("/en/artists/frostmark");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Frostmark");
    await expect(page.getByText(/\[Placeholder/i)).toHaveCount(0);
    const iframe = page.locator('iframe[title*="Spotify"], iframe[src*="spotify"]');
    await expect(iframe.first()).toBeVisible();
    await expect(iframe.first()).toHaveAttribute("loading", "lazy");
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

  test("contact page shows static notice without submit when no endpoint", async ({ page }) => {
    await page.goto("/en/contact/");
    await expect(page.getByText(/not connected|inte kopplat/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toHaveCount(0);
  });

  test("admin static notice", async ({ page }) => {
    await page.goto("/admin/");
    await expect(page.getByRole("heading", { name: /CMS not available/i })).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading")).toBeVisible();
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
