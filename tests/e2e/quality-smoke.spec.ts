import { expect, test } from "@playwright/test";

for (const locale of ["en", "sv"] as const) {
  test(`${locale} home renders and important links work at mobile width`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(`/${locale}/`);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator('a[href*="/music"]').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "no horizontal overflow at 390px").toBeLessThanOrEqual(2);
  });
}

test("mobile menu supports keyboard Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  const menu = page.getByRole("button", { name: /open menu/i });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(menu).toBeFocused();
});

test("images on home have valid alt attributes and no broken local sources", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  const images = page.locator("img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    expect(await image.getAttribute("alt"), `img #${i} missing alt`).not.toBeNull();
  }
  // Avoid external CDN flakiness; verify that all image URLs referencing our own
  // static export exist. Lazy-loaded images may not have been fetched yet.
  const localSources = await images.evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const img = node as HTMLImageElement;
      const urls = [img.getAttribute("src"), ...Array.from(img.querySelectorAll("source")).map((s) => s.getAttribute("srcset"))];
      return urls.filter((u): u is string => !!u && u.startsWith("/assets/"));
    }),
  );
  for (const src of [...new Set(localSources)]) {
    const response = await page.request.get(src);
    expect(response.ok(), `missing local image ${src}`).toBeTruthy();
    expect(response.headers()["content-type"] ?? "").toMatch(/image\//);
  }
});
