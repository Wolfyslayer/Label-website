import { test, expect } from "@playwright/test";

test.describe("functional smoke (seed / no Supabase)", () => {
  test("English and Swedish home render", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("main")).toBeVisible();
    await page.goto("/sv");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("language switch preserves path", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en/music");
    const lang = page.locator("#site-language").first();
    await lang.selectOption("sv");
    await expect(page).toHaveURL(/\/sv\/music/, { timeout: 10_000 });
    await lang.selectOption("en");
    await expect(page).toHaveURL(/\/en\/music/, { timeout: 10_000 });
  });

  test("music catalog search and artist filter", async ({ page }) => {
    await page.goto("/en/music");
    await page.getByLabel(/^search$/i).fill("Placeholder");
    await expect(page.getByText(/1 release|release/i).first()).toBeVisible();
    await page.locator("#artist-filter").selectOption({ label: "Frostmark" });
    await expect(page.locator("article, li").filter({ hasText: /Frostmark/i }).first()).toBeVisible();
  });

  test("artist page and Spotify embed iframe", async ({ page }) => {
    await page.goto("/en/artists/frostmark");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Frostmark");
    const iframe = page.locator('iframe[title*="Spotify"], iframe[src*="spotify"]');
    await expect(iframe.first()).toBeVisible();
    await expect(iframe.first()).toHaveAttribute("loading", "lazy");
  });

  test("release hub smart link page", async ({ page }) => {
    await page.goto("/en/releases/frostmark-placeholder-release");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /copy link/i })).toBeVisible();
  });

  test("upcoming releases page", async ({ page }) => {
    await page.goto("/en/upcoming");
    await expect(page.getByRole("heading", { level: 1, name: /upcoming releases/i })).toBeVisible();
  });

  test("news article", async ({ page }) => {
    await page.goto("/en/news/welcome-to-wolfyslayer-records");
    await expect(page.getByRole("article")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/welcome/i);
  });

  test("contact form rejects without backend (503)", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        name: "QA Bot",
        email: "qa@example.com",
        subject: "Phase 8 smoke test",
        message: "Automated test message for contact API validation path.",
        website: "",
      },
    });
    expect([503, 429]).toContain(res.status());
    if (res.status() === 503) {
      const body = await res.json();
      expect(body.errorCode).toBe("notConfigured");
    }
  });

  test("admin status requires auth", async ({ request }) => {
    const res = await request.get("/api/admin/status");
    expect(res.status()).toBe(401);
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
    expect(xml).toContain("/en/news/");
    expect(xml).toContain("/sv/releases/");
  });
});
