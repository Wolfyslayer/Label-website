import { ArtistHero } from "@/components/artists/artist-hero";
import { ArtistSocialLinks } from "@/components/artists/artist-social-links";
import { LatestReleaseSpotlight } from "@/components/music/latest-release-spotlight";
import { RelatedReleasesSection } from "@/components/music/related-releases";
import { ReleaseCard } from "@/components/music/release-card";
import { StreamingLinks } from "@/components/music/streaming-links";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  getLabelMateReleases,
  getLatestReleaseForArtist,
  getReleasesForArtist,
  partitionDiscography,
} from "@/lib/content/discovery";
import {
  getArtistBySlug,
  getPublishedArtists,
  getPublishedReleases,
  isReleaseUpcoming,
} from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import { musicGroupJsonLd } from "@/lib/metadata/json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = (await getPublishedArtists("en")).map((a) => a.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const artist = await getArtistBySlug(slug, locale);
  if (!artist) {
    const t = await getTranslations({ locale });
    return { title: t("notFoundArtist") };
  }
  return {
    title: artist.name,
    description: artist.shortBio,
    alternates: buildAlternates(`/artists/${slug}`, locale),
    ...pageOpenGraph({
      title: artist.name,
      description: artist.shortBio,
      locale,
      pathname: `/artists/${slug}`,
      image: artist.image.src,
      imageAlt: artist.image.alt,
    }),
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("artist");
  const tDisc = await getTranslations("musicDiscovery");

  const artist = await getArtistBySlug(slug, locale);
  if (!artist) notFound();

  const [allReleases, artists] = await Promise.all([
    getPublishedReleases(locale),
    getPublishedArtists(locale),
  ]);

  const discography = getReleasesForArtist(allReleases, artist.id);
  const { albumsAndEps, singles } = partitionDiscography(discography);
  const latest = getLatestReleaseForArtist(allReleases, artist.id);
  const labelMates = getLabelMateReleases(allReleases, artist, 3);

  return (
    <>
      <ArtistHero artist={artist} />

      <Container className="py-[var(--space-section)]">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
          <div className="space-y-16">
            <section aria-labelledby="artist-intro">
              <SectionHeader
                eyebrow={tDisc("profileEyebrow")}
                title={t("introduction")}
                align="left"
              />
              <div className="editorial-prose mt-6 whitespace-pre-line text-text-secondary">
                {artist.longBio}
              </div>
            </section>

            {latest ? (
              <div className="@container">
                <LatestReleaseSpotlight release={latest} artist={artist} />
              </div>
            ) : null}

            {albumsAndEps.length ? (
              <section aria-labelledby="artist-albums">
                <SectionHeader
                  eyebrow={tDisc("discoverEyebrow")}
                  title={t("albumsAndEps")}
                  align="left"
                />
                <div className="@container mt-8">
                  <div className="album-grid">
                    {albumsAndEps.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        artist={artist}
                        isUpcoming={isReleaseUpcoming(release)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {singles.length ? (
              <section aria-labelledby="artist-singles">
                <SectionHeader eyebrow={tDisc("discoverEyebrow")} title={t("singles")} align="left" />
                <div className="@container mt-8">
                  <div className="album-grid">
                    {singles.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        artist={artist}
                        isUpcoming={isReleaseUpcoming(release)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {!discography.length ? (
              <p className="text-text-muted">{t("noReleases")}</p>
            ) : null}

            {artist.spotifyArtistUrl ? (
              <section aria-labelledby="artist-spotify">
                <SectionHeader
                  eyebrow={tDisc("discoverEyebrow")}
                  title={t("spotifyProfile")}
                  align="left"
                />
                <p className="mt-4 max-w-xl text-sm text-text-secondary">{t("spotifyProfileDesc")}</p>
                <div className="mt-6">
                  <Button href={artist.spotifyArtistUrl} external size="lg" className="min-h-12">
                    {t("listenSpotify")}
                    <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
                  </Button>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <div className="surface-panel p-5 sm:p-6">
              <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("stream")}</h2>
              <div className="mt-4">
                <StreamingLinks links={artist.streamingLinks} />
              </div>
            </div>
            <div className="surface-panel p-5 sm:p-6">
              <ArtistSocialLinks artist={artist} />
            </div>
          </aside>
        </div>
      </Container>

      <RelatedReleasesSection releases={labelMates} artists={artists} titleKey="fromLabel" />

      <JsonLd data={musicGroupJsonLd(artist, locale)} />
    </>
  );
}
