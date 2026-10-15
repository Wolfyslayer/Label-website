import type { AppLocale } from "@/i18n/routing";

export type LocalePageParams = { params: Promise<{ locale: string }> };

export async function resolvePageLocale(params: Promise<{ locale: string }>): Promise<AppLocale> {
  const { locale } = await params;
  return locale as AppLocale;
}
