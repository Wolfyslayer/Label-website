import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicSocialLinks } from "@/lib/content/site-settings";
import type { AppLocale } from "@/i18n/routing";
import { labelOrganizationJsonLd } from "@/lib/metadata/json-ld";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export const dynamic = "force-static";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("a11y");
  const socialLinks = await getPublicSocialLinks();

  return (
    <>
      <JsonLd data={labelOrganizationJsonLd(locale)} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-text-primary focus:px-4 focus:py-2 focus:text-void"
      >
        {t("skip")}
      </a>
      <SiteHeader />
      <main id="main-content" className="relative z-0 overflow-x-hidden">
        {children}
      </main>
      <SiteFooter socialLinks={socialLinks} />
    </>
  );
}
