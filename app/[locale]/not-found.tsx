import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildAlternates } from "@/lib/metadata/alternates";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("notFoundTitle"),
    alternates: buildAlternates("/404", locale),
  };
}

export default async function NotFound() {
  const t = await getTranslations("common");
  const tNav = await getTranslations("nav");

  return (
    <>
      <SiteHeader />
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">404</p>
        <h1 className="mt-4 font-display text-4xl">{t("notFoundTitle")}</h1>
        <p className="mt-4 max-w-md text-sm text-text-secondary">{t("notFoundDesc")}</p>
        <div className="mt-8 flex gap-4">
          <Button href="/">{t("home")}</Button>
          <Button href="/music" variant="outline">
            {tNav("music")}
          </Button>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
