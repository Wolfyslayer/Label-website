"use client";

import { Badge } from "@/components/ui/badge";
import { getOptimizedReleaseCover } from "@/lib/assets/release-cover";
import { Button } from "@/components/ui/button";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import type { Artist, Release } from "@/lib/types/content";
import { getReleaseSpotifyUrl } from "@/lib/utils/streaming";
import { formatReleaseDate } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function ReleaseCard({
  release,
  artist,
  className,
  priority,
  isUpcoming,
}: {
  release: Release;
  artist?: Artist | null;
  className?: string;
  priority?: boolean;
  isUpcoming?: boolean;
}) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const t = useTranslations("musicDiscovery");
  const tMusic = useTranslations("musicPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";
  const spotifyUrl = getReleaseSpotifyUrl(release);
  const optimizedCover = getOptimizedReleaseCover(release.slug);

  return (
    <motion.article
      className={cn("@container group relative max-w-[420px] w-full justify-self-center sm:max-w-none sm:justify-self-stretch", className)}
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/music/${release.slug}`}
        className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-silver"
      >
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface shadow-[0_18px_45px_-25px_rgba(0,0,0,0.8)] ring-1 ring-border-subtle transition-[box-shadow,ring-color] duration-500 group-hover:shadow-[0_25px_55px_-22px_rgba(0,0,0,0.9)] group-hover:ring-border">
          {release.cover.placeholder ? <PlaceholderBanner /> : null}
          {optimizedCover ? (
            // Generated, committed WebP variants work on GitHub Pages without an image server.
            <img
              src={optimizedCover.src}
              srcSet={optimizedCover.srcSet}
              alt={release.cover.alt}
              sizes="(max-width: 640px) calc((100vw - 3rem - 0.875rem) / 2), (max-width: 1024px) 30vw, 22vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              decoding="async"
              width={480}
              height={480}
            />
          ) : (
            <Image
              src={release.cover.src}
              alt={release.cover.alt}
              fill
              sizes="(max-width: 640px) calc((100vw - 3rem - 0.875rem) / 2), (max-width: 1024px) 30vw, 22vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:opacity-0" />
          {isUpcoming ? (
            <span className="absolute left-2 top-2 rounded-sm bg-void/85 px-2 py-1 text-[10px] uppercase tracking-widest text-silver ring-1 ring-border-subtle">
              {t("upcomingBadge")}
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-1.5 @[12rem]:mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{tMusic(`releaseTypes.${release.type}`)}</Badge>
            {artist ? (
              <span className="truncate text-[10px] uppercase tracking-widest text-text-muted">
                {artist.name}
              </span>
            ) : null}
          </div>
          <h3 className="line-clamp-2 font-display text-lg leading-snug text-text-primary transition-colors group-hover:text-silver @[12rem]:text-xl">
            {release.title}
          </h3>
          <p className="text-xs text-text-muted">
            {formatReleaseDate(release.releaseDate, dateLocale, release.releaseDatePrecision)}
          </p>
        </div>
      </Link>
      {spotifyUrl ? (
        <div className="mt-2">
          <Button
            href={spotifyUrl}
            external
            variant="ghost"
            size="sm"
            className="min-h-11 px-1 text-xs uppercase tracking-widest text-silver hover:text-text-primary"
          >
            Spotify
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </Button>
        </div>
      ) : null}
    </motion.article>
  );
}
