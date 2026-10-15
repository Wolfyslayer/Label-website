import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { ReleaseCard } from "@/components/music/release-card";
import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { StreamingLinks } from "@/components/music/streaming-links";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  getArtistBySlug,
  getPublishedArtists,
  getPublishedReleases,
} from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import { cn } from "@/lib/utils/cn";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
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
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("artist");
  const tCommon = await getTranslations("common");

  const artist = await getArtistBySlug(slug, locale);
  if (!artist) notFound();

  const releases = (await getPublishedReleases(locale)).filter((r) => r.artistId === artist.id);
  const isFrost = artist.theme === "frost";

  return (
    <>
      <section className="relative min-h-[55vh] pt-24 md:pt-28">
        <div className="absolute inset-0">
          {artist.heroImage?.placeholder ? (
            <PlaceholderBanner label={tCommon("placeholderHero")} />
          ) : null}
          <Image
            src={artist.heroImage?.src ?? artist.image.src}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div
            className={cn(
              "absolute inset-0",
              isFrost
                ? "bg-gradient-to-t from-void via-void/85 to-frost/5"
                : "bg-gradient-to-t from-void via-void/85 to-wolf/5",
            )}
          />
        </div>
        <Container className="relative z-10 flex min-h-[45vh] flex-col justify-end pb-12">
          <Badge variant={isFrost ? "frost" : "wolf"}>{siteConfig.name}</Badge>
          <h1 className="mt-4 font-display text-5xl text-text-primary md:text-7xl">{artist.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">{artist.tagline}</p>
        </Container>
      </section>

      <Container className="grid gap-16 py-16 md:grid-cols-[280px_1fr] md:py-24">
        <aside>
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm ring-1 ring-border">
            {artist.image.placeholder ? <PlaceholderBanner /> : null}
            <Image src={artist.image.src} alt={artist.image.alt} fill className="object-cover" />
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("stream")}</h2>
              <div className="mt-3">
                <StreamingLinks links={artist.streamingLinks} />
              </div>
            </div>
            {Object.values(artist.socialLinks).some(Boolean) ? (
              <div>
                <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("social")}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {Object.entries(artist.socialLinks)
                    .filter(([, url]) => url)
                    .map(([key, url]) => (
                      <li key={key}>
                        <a
                          href={url}
                          className="text-accent hover:text-text-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {key}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="space-y-16">
          <section>
            <h2 className="font-display text-3xl">{t("biography")}</h2>
            <div className="mt-6 space-y-4 whitespace-pre-line text-base leading-relaxed text-text-secondary">
              {artist.longBio}
            </div>
          </section>

          {artist.spotifyArtistUrl ? (
            <section>
              <h2 className="font-display text-3xl">{t("listenSpotify")}</h2>
              <div className="mt-6">
                <SpotifyEmbed url={artist.spotifyArtistUrl} title={`${artist.name} on Spotify`} />
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-3xl">{t("discography")}</h2>
            {releases.length ? (
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                {releases.map((release) => (
                  <ReleaseCard key={release.id} release={release} artist={artist} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-text-muted">{t("noReleases")}</p>
            )}
          </section>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            name: artist.name,
            url: `${siteConfig.url}/${locale}/artists/${artist.slug}`,
            sameAs: artist.spotifyArtistUrl ? [artist.spotifyArtistUrl] : [],
          }),
        }}
      />
    </>
  );
}
