import { siteConfig } from "@/lib/config/site";
import type { Release } from "@/lib/types/content";
import type { Metadata } from "next";

export function releaseShareMetadata(
  release: Release,
  locale: string,
  pathname = `/releases/${release.slug}`,
): Pick<Metadata, "openGraph" | "twitter"> {
  const base = siteConfig.url.replace(/\/$/, "");
  const pageUrl = `${base}/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const imageUrl = release.cover.src.startsWith("http")
    ? release.cover.src
    : `${base}${release.cover.src}`;

  return {
    openGraph: {
      title: release.title,
      description: release.description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: release.cover.alt,
          width: 1200,
          height: 1200,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: release.title,
      description: release.description,
      images: [imageUrl],
    },
  };
}
