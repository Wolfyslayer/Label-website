import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config/site";
import type { AppLocale } from "@/i18n/routing";

export function localePath(locale: AppLocale, pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${path === "/" ? "" : path}`;
}

export function buildAlternates(pathname: string, locale: AppLocale) {
  const base = siteConfig.url.replace(/\/$/, "");
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${base}${localePath(l, pathname)}`]),
  );
  return {
    canonical: `${base}${localePath(locale, pathname)}`,
    languages: {
      ...languages,
      "x-default": `${base}${localePath(routing.defaultLocale, pathname)}`,
    },
  };
}
