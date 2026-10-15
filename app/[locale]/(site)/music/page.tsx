import { MusicCatalog } from "@/components/music/music-catalog";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedArtists, getReleasedCatalog } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import { resolvePageLocale, type LocalePageParams } from "@/lib/i18n/page-locale";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageParams): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "musicPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/music", locale),
  };
}

export default async function MusicPage({ params }: LocalePageParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations("musicPage");
  const [releases, artists] = await Promise.all([
    getReleasedCatalog(locale),
    getPublishedArtists(locale),
  ]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          headingLevel={1}
        />
        <MusicCatalog releases={releases} artists={artists} />
      </Container>
    </div>
  );
}
