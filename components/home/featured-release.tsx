import { Badge } from "@/components/ui/badge";
import { getOptimizedReleaseCover } from "@/lib/assets/release-cover";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingLinks } from "@/components/music/streaming-links";
import type { Artist, Release } from "@/lib/types/content";
import { formatReleaseDate } from "@/lib/utils/date";
import type { AppLocale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function FeaturedReleaseSection({
  release,
  artist,
  locale,
}: {
  release: Release | null;
  artist: Artist | null;
  locale: AppLocale;
}) {
  if (!release) return null;

  const t = await getTranslations("home");
  const tMusic = await getTranslations("musicPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";
  const optimizedCover = getOptimizedReleaseCover(release.slug);

  return (
    <section className="border-y border-border-subtle bg-surface/35 py-[var(--space-section)]">
      <Container>
        <SectionHeader eyebrow={t("featuredEyebrow")} title={t("featuredTitle")} align="left" />
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="group relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-md border border-border-subtle shadow-[0_32px_90px_-36px_rgba(0,0,0,0.85)] lg:max-w-none">
            {release.cover.placeholder ? <PlaceholderBanner /> : null}
            {optimizedCover ? (
              // The static export serves the build-generated responsive WebP files directly.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={optimizedCover.src}
                srcSet={optimizedCover.srcSet}
                alt={release.cover.alt}
                width={640}
                height={640}
                sizes="(max-width: 1024px) 80vw, 40vw"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
              />
            ) : (
              <Image
                src={release.cover.src}
                alt={release.cover.alt}
                fill
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
                sizes="(max-width: 1024px) 80vw, 40vw"
                loading="lazy"
              />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{tMusic(`releaseTypes.${release.type}`)}</Badge>
              {artist ? (
                <Badge variant={artist.theme === "frost" ? "frost" : "wolf"}>{artist.name}</Badge>
              ) : null}
            </div>
            <h3 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.1] tracking-tight text-text-primary">
              {release.title}
            </h3>
            <p className="mt-2 text-sm uppercase tracking-widest text-text-muted">
              {formatReleaseDate(release.releaseDate, dateLocale, release.releaseDatePrecision)}
            </p>
            <p className="mt-6 max-w-prose text-base leading-relaxed text-text-secondary md:text-lg">{release.description}</p>
            <div className="mt-8 space-y-4">
              <StreamingLinks links={release.streamingLinks} />
              <Button href={`/music/${release.slug}`} variant="secondary">
                {t("viewRelease")}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
