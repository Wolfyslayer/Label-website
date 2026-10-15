import { ArtistCard } from "@/components/artists/artist-card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedArtists } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import { resolvePageLocale, type LocalePageParams } from "@/lib/i18n/page-locale";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageParams): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "artistsPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/artists", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/artists" }),
  };
}

export default async function ArtistsPage({ params }: LocalePageParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations("artistsPage");
  const artists = await getPublishedArtists(locale);

  return (
    <div className="page-offset">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          headingLevel={1}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </Container>
    </div>
  );
}
