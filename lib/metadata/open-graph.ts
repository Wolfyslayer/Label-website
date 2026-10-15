import { absolutePublicPath } from "@/lib/metadata/alternates";
import { defaultOgImagePath, siteConfig } from "@/lib/config/site";
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
  const imageUrl = absoluteAssetUrl(image ?? defaultOgImagePath);
  const imageAltText = imageAlt ?? `${siteConfig.fullName} — ${title}`;

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.fullName,
      type,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      images: [{ url: imageUrl, alt: imageAltText, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function siteDefaultOpenGraph(): Pick<Metadata, "openGraph" | "twitter"> {
  const imageUrl = absoluteAssetUrl(defaultOgImagePath);
  return {
    openGraph: {
      type: "website",
      siteName: siteConfig.fullName,
      title: siteConfig.fullName,
      description: siteConfig.description,
      locale: "en_US",
      alternateLocale: ["sv_SE"],
      images: [{ url: imageUrl, alt: siteConfig.fullName, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.fullName,
      description: siteConfig.description,
      images: [imageUrl],
    },
  };
}
