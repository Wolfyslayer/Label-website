import { RelatedReleasesSection } from "@/components/music/related-releases";
import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { StreamingLinks } from "@/components/music/streaming-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
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
import { spotifyEmbedUrl } from "@/lib/utils/streaming";
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

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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

  const spotifyUrl =
    release.spotifyAlbumUrl ??
    release.streamingLinks.spotify ??
    tracks.find((tr) => tr.spotifyTrackUrl)?.spotifyTrackUrl;
  const hasEmbed = spotifyUrl ? Boolean(spotifyEmbedUrl(spotifyUrl)) : false;

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
                  <Link href={`/artists/${artist.slug}`}>
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
                    Spotify
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  </Button>
                ) : null}
                <Button href={`/releases/${release.slug}`} variant="secondary" size="sm" className="min-h-11">
                  {t("smartLink")}
                </Button>
              </div>
            </div>
          </div>

          {tracks.length ? (
            <section className="mt-14 max-w-3xl lg:max-w-none lg:pr-8">
              <h2 className="type-h3 font-display text-text-primary">{t("tracklist")}</h2>
              <ol className="surface-panel mt-6 divide-y divide-border-subtle">
                {tracks.map((track) => (
                  <li
                    key={track.id}
                    className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm sm:gap-4 sm:px-5 sm:py-3.5 md:min-h-14 md:px-6"
                  >
                    <span className="w-7 shrink-0 tabular-nums text-text-muted sm:w-8">{track.trackNumber}</span>
                    <span className="min-w-0 flex-1 font-medium text-text-primary">{track.title}</span>
                    {formatDuration(track.durationSeconds) ? (
                      <span className="shrink-0 tabular-nums text-xs text-text-muted sm:text-sm">
                        {formatDuration(track.durationSeconds)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {spotifyUrl && hasEmbed ? (
            <section className="mt-14 max-w-3xl lg:max-w-2xl">
              <h2 className="type-h3 font-display text-text-primary">{t("previewSpotify")}</h2>
              <div className="mt-6 min-w-0">
                <SpotifyEmbed url={spotifyUrl} title={`${release.title} on Spotify`} />
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
