import { routing } from "@/i18n/routing";
import { getPublishedArtists, getPublishedNews, getPublishedReleases } from "@/lib/content";
import { localePath } from "@/lib/metadata/alternates";
import { siteConfig } from "@/lib/config/site";
import type { MetadataRoute } from "next";
import type { AppLocale } from "@/i18n/routing";

const staticPaths = [
  "",
  "/artists",
  "/music",
  "/upcoming",
  "/news",
  "/about",
  "/contact",
  "/press",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const [artists, releases, news] = await Promise.all([
    getPublishedArtists("en"),
    getPublishedReleases("en"),
    getPublishedNews("en"),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of [...routing.locales] as AppLocale[]) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${base}${localePath(l as AppLocale, path)}`]),
          ),
        },
      });
    }

    for (const artist of artists) {
      entries.push({
        url: `${base}${localePath(locale, `/artists/${artist.slug}`)}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const release of releases) {
      entries.push({
        url: `${base}${localePath(locale, `/music/${release.slug}`)}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
      entries.push({
        url: `${base}${localePath(locale, `/releases/${release.slug}`)}`,
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${base}${localePath(l as AppLocale, `/releases/${release.slug}`)}`,
            ]),
          ),
        },
      });
    }
    for (const article of news) {
      entries.push({
        url: `${base}${localePath(locale, `/news/${article.slug}`)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
