import { routing } from "@/i18n/routing";
import { getPublishedArtists, getPublishedNews, getPublishedReleases } from "@/lib/content";
import { absolutePublicPath } from "@/lib/metadata/alternates";
import type { MetadataRoute } from "next";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-static";

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
  const [artists, releases, news] = await Promise.all([
    getPublishedArtists("en"),
    getPublishedReleases("en"),
    getPublishedNews("en"),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of [...routing.locales] as AppLocale[]) {
    for (const path of staticPaths) {
      entries.push({
        url: absolutePublicPath(locale, path),
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, absolutePublicPath(l as AppLocale, path)]),
          ),
        },
      });
    }

    for (const artist of artists) {
      entries.push({
        url: absolutePublicPath(locale, `/artists/${artist.slug}`),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const release of releases) {
      entries.push({
        url: absolutePublicPath(locale, `/music/${release.slug}`),
        changeFrequency: "monthly",
        priority: 0.7,
      });
      entries.push({
        url: absolutePublicPath(locale, `/releases/${release.slug}`),
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              absolutePublicPath(l as AppLocale, `/releases/${release.slug}`),
            ]),
          ),
        },
      });
    }
    for (const article of news) {
      entries.push({
        url: absolutePublicPath(locale, `/news/${article.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              absolutePublicPath(l as AppLocale, `/news/${article.slug}`),
            ]),
          ),
        },
      });
    }
  }

  return entries;
}
