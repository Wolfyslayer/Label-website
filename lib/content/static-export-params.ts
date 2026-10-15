import { routing } from "@/i18n/routing";

/** Placeholder slug for `output: export` when a catalog has zero published entries. */
export const STATIC_EXPORT_PLACEHOLDER_SLUG = "__static_export_placeholder__";

export function localeSlugParams(slugs: string[]) {
  if (!slugs.length) {
    return routing.locales.map((locale) => ({
      locale,
      slug: STATIC_EXPORT_PLACEHOLDER_SLUG,
    }));
  }
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export function isStaticExportPlaceholderSlug(slug: string) {
  return slug === STATIC_EXPORT_PLACEHOLDER_SLUG;
}
