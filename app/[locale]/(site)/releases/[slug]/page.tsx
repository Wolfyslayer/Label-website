import { ReleaseHubActions } from "@/components/releases/release-hub-actions";
import { ReleaseLocalTime } from "@/components/releases/release-local-time";
import { StreamingPlatformGrid } from "@/components/releases/streaming-platform-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { ReleaseCountdown } from "@/components/music/countdown";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getPublishedArtists, getPublishedReleases, getReleaseBySlug } from "@/lib/content";
import { isReleaseUpcoming } from "@/lib/content/releases";
import { buildAlternates } from "@/lib/metadata/alternates";
import { releaseShareMetadata } from "@/lib/metadata/release-share";
import { getReleaseHubPreSaveUrl, getReleaseHubStreaming } from "@/lib/releases/hub-streaming";
import { siteConfig } from "@/lib/config/site";
import { formatReleaseDate, formatReleaseTimestampUtc } from "@/lib/utils/date";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = (await getPublishedReleases("en")).map((r) => r.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const release = await getReleaseBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: "releaseHub" });
  if (!release) return { title: t("notFound") };

  const artists = await getPublishedArtists(locale);
  const artist = artists.find((a) => a.id === release.artistId);
  const ogTitle = artist ? `${release.title} · ${artist.name}` : release.title;
  const share = releaseShareMetadata(release, locale, `/releases/${slug}`);

  return {
    title: ogTitle,
    description: release.description,
    alternates: buildAlternates(`/releases/${slug}`, locale),
    openGraph: { ...share.openGraph, title: ogTitle },
    twitter: { ...share.twitter, title: ogTitle },
  };
}

export default async function ReleaseHubPage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("releaseHub");
  const tMusic = await getTranslations("musicPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  const release = await getReleaseBySlug(slug, locale);
  if (!release) notFound();

  const artists = await getPublishedArtists(locale);
  const artist = artists.find((a) => a.id === release.artistId);
  const upcoming = isReleaseUpcoming(release);
  const streaming = getReleaseHubStreaming(release);
  const preSave = getReleaseHubPreSaveUrl(release);

  const base = siteConfig.url.replace(/\/$/, "");
  const shareUrl = `${base}/${locale}/releases/${release.slug}`;

  return (
    <div className="min-h-dvh pt-[calc(var(--header-height)+env(safe-area-inset-top))]">
      <div className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-b from-charcoal/80 to-void pb-[var(--space-section)] pt-8 md:pt-12">
        <div className="hero-light-frost pointer-events-none absolute inset-0 opacity-40" />
        <Container className="relative">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-text-muted">
            {siteConfig.fullName}
          </p>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-16">
            <div className="relative mx-auto aspect-square w-full max-w-[380px] shadow-2xl lg:mx-0">
              {release.cover.placeholder ? <PlaceholderBanner /> : null}
              <Image
                src={release.cover.src}
                alt={release.cover.alt}
                fill
                priority
                className="rounded-sm object-cover ring-1 ring-border-subtle"
                sizes="(max-width: 1024px) 85vw, 380px"
              />
            </div>
            <div className="min-w-0 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <Badge variant={upcoming ? "outline" : "default"}>
                  {upcoming ? t("statusUpcoming") : t("statusOutNow")}
                </Badge>
                <Badge variant="outline">{tMusic(`releaseTypes.${release.type}`)}</Badge>
              </div>
              {artist ? (
                <Link
                  href={`/artists/${artist.slug}`}
                  className="mt-4 inline-block font-display text-sm uppercase tracking-[0.25em] text-silver hover:text-text-primary"
                >
                  {artist.name}
                </Link>
              ) : null}
              <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.5rem)] leading-tight text-text-primary">
                {release.title}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-widest text-text-muted">
                {formatReleaseDate(release.releaseDate, dateLocale)}
              </p>
              <p className="mt-2 text-xs text-text-muted">{formatReleaseTimestampUtc(release.releaseAt, dateLocale)}</p>
              <ReleaseLocalTime releaseAt={release.releaseAt} locale={locale} label={t("yourLocalTime")} />
              {upcoming ? (
                <div className="mt-8 flex justify-center lg:justify-start">
                  <ReleaseCountdown releaseAt={release.releaseAt} />
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-[var(--space-section)]">
        <div className="mx-auto max-w-2xl space-y-10">
          {release.description ? (
            <section>
              <h2 className="sr-only">{t("aboutRelease")}</h2>
              <p className="text-base leading-relaxed text-text-secondary md:text-lg">{release.description}</p>
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-xl text-text-primary md:text-2xl">{t("listenNow")}</h2>
            <div className="mt-6">
              <StreamingPlatformGrid links={streaming} />
            </div>
          </section>

          {upcoming && preSave ? (
            <section>
              <h2 className="font-display text-xl text-text-primary">{t("preSave")}</h2>
              <p className="mt-2 text-sm text-text-muted">{t("preSaveHint")}</p>
              <Button href={preSave} external className="mt-4 min-h-12 w-full sm:w-auto">
                {t("preSaveCta")}
              </Button>
            </section>
          ) : null}

          <section className="rounded-sm border border-border-subtle bg-surface/30 p-6">
            <h2 className="font-display text-lg text-text-primary">{t("shareRelease")}</h2>
            <p className="mt-2 text-sm text-text-muted">{t("shareHint")}</p>
            <div className="mt-6">
              <ReleaseHubActions shareUrl={shareUrl} shareTitle={`${release.title}${artist ? ` — ${artist.name}` : ""}`} />
            </div>
          </section>

          <p className="text-center text-sm text-text-muted">
            <Link href={`/music/${release.slug}`} className="text-accent hover:text-text-primary">
              {t("fullReleasePage")} →
            </Link>
          </p>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicAlbum",
            name: release.title,
            datePublished: release.releaseDate,
            url: shareUrl,
            image: release.cover.src.startsWith("http") ? release.cover.src : `${base}${release.cover.src}`,
            byArtist: artist ? { "@type": "MusicGroup", name: artist.name } : undefined,
          }),
        }}
      />
    </div>
  );
}
