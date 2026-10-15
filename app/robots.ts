import { siteConfig } from "@/lib/config/site";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/api/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
