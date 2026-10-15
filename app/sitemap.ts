import { getPublishedArtists, getPublishedNews, getPublishedReleases } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const [artists, releases, news] = await Promise.all([
    getPublishedArtists(),
    getPublishedReleases(),
    getPublishedNews(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/artists",
    "/music",
    "/upcoming",
    "/news",
    "/about",
    "/contact",
    "/press",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...artists.map((a) => ({
      url: `${base}/artists/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...releases.map((r) => ({
      url: `${base}/music/${r.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...news.map((n) => ({
      url: `${base}/news/${n.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
