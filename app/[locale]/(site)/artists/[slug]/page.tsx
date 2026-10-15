import { ArtistHero } from "@/components/artists/artist-hero";
import { ArtistSocialLinks } from "@/components/artists/artist-social-links";
import { RelatedReleasesSection } from "@/components/music/related-releases";
import { ReleaseCard } from "@/components/music/release-card";
import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { StreamingLinks } from "@/components/music/streaming-links";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  getFeaturedReleasesForArtist,
  getLabelMateReleases,
  getReleasesForArtist,
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
  const featured = getFeaturedReleasesForArtist(allReleases, artist);
  const labelMates = getLabelMateReleases(allReleases, artist, 3);

  return (
    <>
      <ArtistHero artist={artist} />

      <Container className="py-[var(--space-section)]">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
          <div className="space-y-16">
            <section>
              <SectionHeader eyebrow={tDisc("profileEyebrow")} title={t("biography")} align="left" />
              <div className="editorial-prose mt-6 whitespace-pre-line text-text-secondary">
                {artist.longBio}
              </div>
            </section>

            {featured.length ? (
              <section>
                <SectionHeader
                  eyebrow={tDisc("discoverEyebrow")}
                  title={tDisc("featuredReleases")}
                  align="left"
                />
                <div className="@container mt-8">
                  <div className="album-grid max-w-5xl">
                    {featured.map((release) => (
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

            <section>
              <SectionHeader eyebrow={tDisc("discoverEyebrow")} title={t("discography")} align="left" />
              {discography.length ? (
                <div className="@container mt-8">
                  <div className="album-grid">
                    {discography.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        artist={artist}
                        isUpcoming={isReleaseUpcoming(release)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-text-muted">{t("noReleases")}</p>
              )}
            </section>

            {artist.spotifyArtistUrl ? (
              <section>
                <SectionHeader eyebrow={tDisc("discoverEyebrow")} title={t("listenSpotify")} align="left" />
                <div className="mt-6 max-w-3xl">
                  <SpotifyEmbed url={artist.spotifyArtistUrl} title={`${artist.name} on Spotify`} />
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

      <RelatedReleasesSection
        releases={labelMates}
        artists={artists}
        titleKey="fromLabel"
      />

      <JsonLd data={musicGroupJsonLd(artist, locale)} />
    </>
  );
}
