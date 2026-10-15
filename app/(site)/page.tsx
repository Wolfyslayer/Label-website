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
import { siteConfig } from "@/lib/config/site";
import { formatReleaseDate } from "@/lib/utils/date";
import Link from "next/link";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import Image from "next/image";

export default async function HomePage() {
  const [artists, releases, featured, upcoming, news] = await Promise.all([
    getPublishedArtists(),
    getPublishedReleases(),
    getFeaturedRelease(),
    getUpcomingReleases(),
    getHomepageNews(3),
  ]);

  const artistById = new Map(artists.map((a) => [a.id, a]));
  const featuredArtist = featured ? artistById.get(featured.artistId) : null;
  const latestGrid = releases.slice(0, 4);

  return (
    <>
      <HomeHero />
      <FeaturedReleaseSection release={featured} artist={featuredArtist ?? null} />

      <section className="py-20 md:py-28">
        <Container>
          <SectionHeader
            eyebrow="Roster"
            title="Artist spotlight"
            description="Two distinct voices under one independent label."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border-subtle bg-charcoal/50 py-20 md:py-28">
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-14">
            <SectionHeader eyebrow="Catalog" title="Latest releases" className="mb-0" />
            <Button href="/music" variant="ghost" size="sm">
              Full catalog →
            </Button>
          </div>
          {latestGrid.length ? (
            <>
              <ReleaseCarousel releases={latestGrid} artists={artists} className="md:hidden" />
              <div className="hidden grid-cols-2 gap-6 md:grid md:grid-cols-4 md:gap-8">
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
            <p className="text-text-muted">Releases will appear here once published.</p>
          )}
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <SectionHeader
            eyebrow="Listen"
            title="On Spotify"
            description="Follow Frostmark and Wolfyslayer on Spotify. Embeds play through Spotify's official player."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            {artists.map((artist) => (
              <div key={artist.id}>
                <h3 className="mb-4 font-display text-2xl text-text-primary">{artist.name}</h3>
                {artist.spotifyArtistUrl ? (
                  <SpotifyEmbed
                    url={artist.spotifyArtistUrl}
                    title={`${artist.name} on Spotify`}
                    height={380}
                  />
                ) : (
                  <p className="text-sm text-text-muted">Spotify URL not configured.</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {upcoming.length > 0 ? (
        <section className="border-t border-border-subtle bg-surface/30 py-20 md:py-28">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader eyebrow="Schedule" title="Upcoming releases" className="mb-0" />
              <Link href="/upcoming" className="text-xs uppercase tracking-[0.2em] text-accent">
                View all →
              </Link>
            </div>
            <ul className="mt-10 space-y-8">
              {upcoming.slice(0, 2).map((release) => {
                const artist = artistById.get(release.artistId);
                return (
                  <li
                    key={release.id}
                    className="grid gap-8 rounded-sm border border-border-subtle bg-charcoal/40 p-6 md:grid-cols-[140px_1fr_auto] md:items-center md:p-8"
                  >
                    <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-sm">
                      {release.cover.placeholder ? <PlaceholderBanner /> : null}
                      <Image src={release.cover.src} alt={release.cover.alt} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-text-muted">
                        {artist?.name} · {formatReleaseDate(release.releaseDate)}
                      </p>
                      <h3 className="mt-2 font-display text-2xl">{release.title}</h3>
                    </div>
                    <ReleaseCountdown releaseAt={release.releaseAt} />
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      <NewsPreviewSection articles={news} />

      <section className="border-t border-border-subtle py-16 md:py-20">
        <Container className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl text-text-primary">Stay connected</h2>
            <p className="mt-2 max-w-md text-sm text-text-secondary">
              Follow {siteConfig.fullName} and our artists on your preferred platforms.
            </p>
          </div>
          <SocialLinks />
        </Container>
      </section>
    </>
  );
}
