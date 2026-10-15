import { ArtistCard } from "@/components/artists/artist-card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedArtists } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "artistsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/artists", locale),
  };
}

export default async function ArtistsPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("artistsPage");
  const artists = await getPublishedArtists(locale);

  return (
    <div className="pt-24 md:pt-28">
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
