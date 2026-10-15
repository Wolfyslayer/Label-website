import { ArtistCard } from "@/components/artists/artist-card";
import { FeaturedReleaseSection } from "@/components/home/featured-release";
import { HomeHero } from "@/components/home/hero";
import { NewsPreviewSection } from "@/components/home/news-preview";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ReleaseCarousel } from "@/components/home/release-carousel";
import { ReleaseCard } from "@/components/music/release-card";
import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { ReleaseCountdown } from "@/components/music/countdown";
import { SocialLinks } from "@/components/layout/social-links";
import {
  getFeaturedRelease,
  getHomepageNews,
  getPublishedArtists,
  getPublishedReleases,
  getUpcomingReleases,
} from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import { resolvePageLocale, type LocalePageParams } from "@/lib/i18n/page-locale";
import { formatReleaseDate } from "@/lib/utils/date";
import { Link } from "@/i18n/navigation";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageParams): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("siteName");
  const description = t("defaultDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/" }),
  };
}

export default async function HomePage({ params }: LocalePageParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations("home");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  const [artists, releases, featured, upcoming, news] = await Promise.all([
    getPublishedArtists(locale),
    getPublishedReleases(locale),
    getFeaturedRelease(locale),
    getUpcomingReleases(locale),
    getHomepageNews(locale, 3),
  ]);

  const artistById = new Map(artists.map((a) => [a.id, a]));
  const featuredArtist = featured ? artistById.get(featured.artistId) : null;
  const latestGrid = releases.slice(0, 4);

  return (
    <>
      <HomeHero />
      <FeaturedReleaseSection release={featured} artist={featuredArtist ?? null} locale={locale} />

      <section className="py-[var(--space-section)]">
        <Container>
          <SectionHeader eyebrow={t("rosterEyebrow")} title={t("rosterTitle")} description={t("rosterDesc")} />
          <div className="grid gap-[clamp(1rem,3vw,1.5rem)] md:grid-cols-2">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border-subtle bg-charcoal/40 py-[var(--space-section)]">
        <Container className="@container">
          <div className="mb-[clamp(2rem,5vw,3.5rem)] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow={t("catalogEyebrow")} title={t("catalogTitle")} className="mb-0" />
            <Button href="/music" variant="ghost" size="sm" className="min-h-11 shrink-0 self-start sm:self-auto">
              {t("catalogCta")} →
            </Button>
          </div>
          {latestGrid.length ? (
            <>
              <ReleaseCarousel releases={latestGrid} artists={artists} className="md:hidden" />
              <div className="album-grid hidden md:grid">
                {latestGrid.map((release, i) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    artist={artistById.get(release.artistId)}
                    priority={i < 2}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-text-muted">{t("noReleases")}</p>
          )}
        </Container>
      </section>

      <section className="py-[var(--space-section)]">
        <Container>
          <SectionHeader eyebrow={t("listenEyebrow")} title={t("listenTitle")} description={t("listenDesc")} />
          <div className="grid gap-8 lg:grid-cols-2">
            {artists.map((artist) => (
              <div key={artist.id} className="min-w-0">
                <h3 className="type-h3 font-display text-text-primary">{artist.name}</h3>
                {artist.spotifyArtistUrl ? (
                  <div className="mt-4 min-w-0">
                    <SpotifyEmbed url={artist.spotifyArtistUrl} title={`${artist.name} on Spotify`} height={380} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-text-muted">{t("spotifyMissing")}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {upcoming.length > 0 ? (
        <section className="border-t border-border-subtle bg-surface/25 py-[var(--space-section)]">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader eyebrow={t("scheduleEyebrow")} title={t("scheduleTitle")} className="mb-0" />
              <Link
                href="/upcoming"
                className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver hover:text-text-primary"
              >
                {t("scheduleCta")} →
              </Link>
            </div>
            <ul className="mt-10 space-y-8">
              {upcoming.slice(0, 2).map((release) => {
                const artist = artistById.get(release.artistId);
                return (
                  <li
                    key={release.id}
                    className="grid gap-6 rounded-sm border border-border-subtle bg-charcoal/35 p-[clamp(1rem,3vw,2rem)] sm:gap-8 md:grid-cols-[minmax(100px,140px)_1fr] md:items-center lg:grid-cols-[140px_1fr_auto]"
                  >
                    <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-sm">
                      {release.cover.placeholder ? <PlaceholderBanner /> : null}
                      <Image src={release.cover.src} alt={release.cover.alt} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 text-center md:text-left">
                      <p className="text-xs uppercase tracking-widest text-text-muted">
                        {artist?.name} · {formatReleaseDate(release.releaseDate, dateLocale)}
                      </p>
                      <h3 className="mt-2 font-display text-[clamp(1.25rem,3vw,1.75rem)]">{release.title}</h3>
                    </div>
                    <div className="flex justify-center md:justify-end">
                      <ReleaseCountdown releaseAt={release.releaseAt} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      <NewsPreviewSection articles={news} />

      <section className="border-t border-border-subtle py-[var(--space-section)]">
        <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-md">
            <h2 className="type-h3 font-display text-text-primary">{t("connectTitle")}</h2>
            <p className="mt-2 text-sm text-text-secondary">{t("connectDesc")}</p>
          </div>
          <SocialLinks />
        </Container>
      </section>
    </>
  );
}
