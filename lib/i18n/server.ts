import { cookies } from "next/headers";
import { getMessages } from "./index";
import { defaultLocale, localeCookieName, locales, type Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }
  return defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  return getMessages(locale);
}
