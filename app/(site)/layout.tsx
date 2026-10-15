import { LocaleProvider } from "@/components/providers/locale-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n";
import type { ReactNode } from "react";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <LocaleProvider locale={locale}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-text-primary focus:px-4 focus:py-2 focus:text-void"
      >
        {messages.a11y.skip}
      </a>
      <SiteHeader />
      <main id="main-content" className="overflow-x-hidden">
        {children}
      </main>
      <SiteFooter />
    </LocaleProvider>
  );
}
