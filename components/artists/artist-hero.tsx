import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { artistMediaPaths } from "@/lib/assets/artist-media";
import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function ArtistHero({ artist }: { artist: Artist }) {
  const t = await getTranslations("artist");
  const isFrost = artist.theme === "frost";
  const assetSet =
    artist.slug === "frostmark"
      ? artistMediaPaths.frostmark
      : artist.slug === "wolfyslayer"
        ? artistMediaPaths.wolfyslayer
        : null;
  const heroSrc =
    assetSet?.background ?? artist.heroImage?.src ?? artist.image.src;
  const portraitSrc = assetSet?.portrait ?? artist.image.src;
  const mobileHeroSrc = assetSet?.hero ?? heroSrc;

  return (
    <section className="relative min-h-[min(92dvh,920px)] overflow-hidden pt-[calc(var(--header-height)+env(safe-area-inset-top))]">
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileHeroSrc} />
          {/* Use the smaller existing banner on mobile; preserve the full desktop background. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
            className={cn(
              "absolute inset-0 h-full w-full object-cover scale-105",
              isFrost ? "object-[center_25%]" : "object-[center_20%]",
            )}
          />
        </picture>
        <div
          className={cn(
            "absolute inset-0",
            isFrost
              ? "bg-gradient-to-t from-void via-void/88 to-frost/20"
              : "bg-gradient-to-t from-void via-void/88 to-wolf/15",
          )}
        />
        <div className="hero-vignette absolute inset-0 opacity-80" />
        <div className="noise-overlay absolute inset-0 opacity-30" />
      </div>

      <Container className="relative z-10 flex min-h-[min(78dvh,780px)] flex-col justify-end pb-[max(2.5rem,env(safe-area-inset-bottom))] md:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_min(320px,28vw)] lg:gap-16">
          <div className="max-w-3xl">
            <Badge variant={isFrost ? "frost" : "wolf"}>{t("badge")}</Badge>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] text-text-primary">
              {artist.name}
            </h1>
            <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-text-secondary md:text-xl">
              {artist.tagline}
            </p>
            {artist.spotifyArtistUrl ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href={artist.spotifyArtistUrl} external size="lg" className="min-h-12">
                  {t("listenSpotify")}
                  <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-[min(100%,320px)] lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl ring-1 ring-border-subtle">
              <Image
                src={portraitSrc}
                alt={artist.image.alt}
                fill
                className="object-cover object-[center_12%]"
                sizes="(max-width: 1024px) 320px, 360px"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
