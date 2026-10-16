import { expect, test } from "@playwright/test";

for (const locale of ["en", "sv"] as const) {
  test(`${locale} key pages expose landmarks and accessible links`, async ({ page }) => {
    for (const route of [`/${locale}/`, `/${locale}/music/`, `/${locale}/artists/`]) {
      await page.goto(route);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const issues = await page.evaluate(() => {
        const errors: string[] = [];
        for (const link of document.querySelectorAll("a[href]")) {
          if (link.closest('[aria-hidden="true"]')) continue;
          const text = (link.textContent ?? "").trim();
          const label = link.getAttribute("aria-label")?.trim();
          const imgAlt = [...link.querySelectorAll("img")].map((img) => img.getAttribute("alt") ?? "").join(" ").trim();
          if (!text && !label && !imgAlt) errors.push(`unnamed link: ${link.getAttribute("href")}`);
        }
        for (const button of document.querySelectorAll("button")) {
          if (button.closest('[aria-hidden="true"]')) continue;
          const text = (button.textContent ?? "").trim();
          const label = button.getAttribute("aria-label")?.trim();
          if (!text && !label && !button.getAttribute("title")) errors.push("unnamed button");
        }
        return errors;
      });
      expect(issues, `basic accessible names on ${route}`).toEqual([]);
    }
  });
}
