import { en } from "./messages/en";
import { sv } from "./messages/sv";
import type { Locale } from "./types";
import { defaultLocale } from "./types";

const catalogs = { en, sv } as const;

export function getMessages(locale: Locale) {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

export type { Messages } from "./messages/en";
export type { Locale } from "./types";
export { locales, defaultLocale, localeCookieName } from "./types";
