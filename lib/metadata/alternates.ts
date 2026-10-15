import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config/site";
import type { AppLocale } from "@/i18n/routing";

export function localePath(locale: AppLocale, pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Absolute public URL for a localized path (includes GitHub Pages basePath when set). */
export function absolutePublicPath(locale: AppLocale, pathname: string) {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${localePath(locale, pathname)}`;
}

export function buildAlternates(pathname: string, locale: AppLocale) {
  const base = siteConfig.url.replace(/\/$/, "");
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absolutePublicPath(l as AppLocale, pathname)]),
  );
  return {
    canonical: absolutePublicPath(locale, pathname),
    languages: {
      ...languages,
      "x-default": `${base}${localePath(routing.defaultLocale, pathname)}`,
    },
  };
}
