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
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
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
  const imageUrl = artist.image.src.startsWith("http")
    ? artist.image.src
    : `${siteConfig.url.replace(/\/$/, "")}${artist.image.src}`;
  return {
    title: artist.name,
    description: artist.shortBio,
    alternates: buildAlternates(`/artists/${slug}`, locale),
    openGraph: {
      title: artist.name,
      description: artist.shortBio,
      images: [{ url: imageUrl, alt: artist.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: artist.name,
      description: artist.shortBio,
      images: [imageUrl],
    },
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
              <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-text-secondary md:text-lg">
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

          <aside className="space-y-8 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("stream")}</h2>
              <div className="mt-3">
                <StreamingLinks links={artist.streamingLinks} />
              </div>
            </div>
            <ArtistSocialLinks artist={artist} />
          </aside>
        </div>
      </Container>

      <RelatedReleasesSection
        releases={labelMates}
        artists={artists}
        titleKey="fromLabel"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            name: artist.name,
            description: artist.shortBio,
            url: `${siteConfig.url}/${locale}/artists/${artist.slug}`,
            image: `${siteConfig.url.replace(/\/$/, "")}${artist.image.src}`,
            sameAs: [
              artist.spotifyArtistUrl,
              ...Object.values(artist.socialLinks).filter(Boolean),
            ].filter(Boolean),
          }),
        }}
      />
    </>
  );
}
