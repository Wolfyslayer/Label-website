import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicSocialLinks } from "@/lib/content/site-settings";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export const dynamic = "force-static";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("a11y");
  const socialLinks = await getPublicSocialLinks();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-text-primary focus:px-4 focus:py-2 focus:text-void"
      >
        {t("skip")}
      </a>
      <SiteHeader />
      <main id="main-content" className="overflow-x-hidden">
        {children}
      </main>
      <SiteFooter socialLinks={socialLinks} />
    </>
  );
}
