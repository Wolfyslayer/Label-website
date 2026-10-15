import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { ReleaseHubActions } from "@/components/releases/release-hub-actions";
import { siteConfig } from "@/lib/config/site";
import { RelatedReleasesSection } from "@/components/music/related-releases";
import { ReleaseTracklist } from "@/components/music/release-tracklist";
import { StreamingLinks } from "@/components/music/streaming-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getRelatedReleasesForRelease } from "@/lib/content/discovery";
import {
  getPublishedArtists,
  getPublishedReleases,
  getReleaseBySlug,
  getTracksForRelease,
} from "@/lib/content";
import { isStaticExportPlaceholderSlug, localeSlugParams } from "@/lib/content/static-export-params";
import { buildAlternates } from "@/lib/metadata/alternates";
import { musicAlbumJsonLd } from "@/lib/metadata/json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { releaseShareMetadata } from "@/lib/metadata/release-share";
import { formatReleaseDate } from "@/lib/utils/date";
import { getReleaseSpotifyUrl } from "@/lib/utils/streaming";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = (await getPublishedReleases("en")).map((r) => r.slug);
  return localeSlugParams(slugs);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const release = await getReleaseBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: "releasePage" });
  if (!release) return { title: t("notFound") };
  return {
    title: release.title,
    description: release.description,
    alternates: buildAlternates(`/music/${slug}`, locale),
    ...releaseShareMetadata(release, locale, `/music/${slug}`),
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("releasePage");
  const tMusic = await getTranslations("musicPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  if (isStaticExportPlaceholderSlug(slug)) notFound();
  const release = await getReleaseBySlug(slug, locale);
  if (!release) notFound();

  const [tracks, artists, allReleases] = await Promise.all([
    getTracksForRelease(release.id),
    getPublishedArtists(locale),
    getPublishedReleases(locale),
  ]);
  const artist = artists.find((a) => a.id === release.artistId);
  const related = getRelatedReleasesForRelease(allReleases, release, 4);

  const spotifyUrl = getReleaseSpotifyUrl(release, tracks);
  const shareUrl = `${siteConfig.url.replace(/\/$/, "")}/${locale}/releases/${release.slug}`;

  return (
    <>
      <div className="page-offset">
        <Container className="pb-12 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(min(100%,380px),520px)_1fr] lg:items-start lg:gap-16">
            <div className="relative mx-auto aspect-square w-full max-w-[min(100%,520px)] shadow-2xl shadow-void/50 lg:mx-0 lg:max-w-none">
              {release.cover.placeholder ? <PlaceholderBanner /> : null}
              <Image
                src={release.cover.src}
                alt={release.cover.alt}
                fill
                className="rounded-sm object-cover shadow-2xl ring-1 ring-border"
                priority
                sizes="(max-width: 1024px) 90vw, 480px"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge>{tMusic(`releaseTypes.${release.type}`)}</Badge>
                {artist ? (
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted"
                  >
                    <Badge variant={artist.theme === "frost" ? "frost" : "wolf"}>{artist.name}</Badge>
                  </Link>
                ) : null}
              </div>
              <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] leading-tight text-text-primary">
                {release.title}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-widest text-text-muted">
                {formatReleaseDate(release.releaseDate, dateLocale)}
              </p>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                {release.description}
              </p>
              {release.credits ? (
                <p className="mt-6 text-sm text-text-muted">
                  <span className="font-medium text-text-secondary">{t("credits")}:</span>{" "}
                  {release.credits}
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <StreamingLinks links={release.streamingLinks} />
                {spotifyUrl ? (
                  <Button href={spotifyUrl} external variant="outline" size="sm" className="min-h-11">
                    {t("listenSpotify")}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  </Button>
                ) : null}
                <Button href={`/releases/${release.slug}`} variant="secondary" size="sm" className="min-h-11">
                  {t("smartLink")}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {spotifyUrl ? (
              <section aria-label={t("previewSpotify")} className="min-w-0">
                <h2 className="type-h3 font-display text-text-primary">{t("previewSpotify")}</h2>
                <div className="mt-5"><SpotifyEmbed url={spotifyUrl} title={`${release.title} — Spotify`} /></div>
              </section>
            ) : null}
            <section className="min-w-0 rounded-sm border border-border-subtle bg-surface/30 p-5 sm:p-7">
              <h2 className="type-h3 font-display text-text-primary">{t("shareRelease")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{t("shareReleaseHint")}</p>
              <div className="mt-5"><ReleaseHubActions shareUrl={shareUrl} shareTitle={`${release.title}${artist ? ` — ${artist.name}` : ""}`} /></div>
            </section>
          </div>

          {tracks.length ? (
            <section className="mt-14 max-w-3xl lg:max-w-none lg:pr-8">
              <h2 className="type-h3 font-display text-text-primary">{t("tracklist")}</h2>
              <div className="mt-6">
                <ReleaseTracklist tracks={tracks} />
              </div>
            </section>
          ) : null}
        </Container>
      </div>

      <RelatedReleasesSection releases={related} artists={artists} />

      <JsonLd data={musicAlbumJsonLd(release, locale, artist, tracks)} />
    </>
  );
}
