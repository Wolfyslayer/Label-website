import { absolutePublicPath } from "@/lib/metadata/alternates";
import { siteConfig } from "@/lib/config/site";
import type { AppLocale } from "@/i18n/routing";
import type { Metadata } from "next";

export function absoluteAssetUrl(src: string): string {
  if (src.startsWith("http")) return src;
  return `${siteConfig.url.replace(/\/$/, "")}${src.startsWith("/") ? src : `/${src}`}`;
}

export function pageOpenGraph({
  title,
  description,
  locale,
  pathname,
  image,
  imageAlt,
  type = "website",
}: {
  title: string;
  description: string;
  locale: string;
  pathname: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = absolutePublicPath(locale as AppLocale, pathname);
  const imageUrl = image ? absoluteAssetUrl(image) : undefined;

  return {
    openGraph: {
      title,
      description,
      url,
      type,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      ...(imageUrl
        ? {
            images: [{ url: imageUrl, alt: imageAlt ?? title, width: 1200, height: 630 }],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
