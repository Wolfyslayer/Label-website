"use client";

import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";
import { createContext, useContext, useMemo, type ReactNode } from "react";

type Messages = ReturnType<typeof getMessages>;

const LocaleContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, messages: getMessages(locale) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
