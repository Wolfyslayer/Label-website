"use client";

import { Badge } from "@/components/ui/badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import type { Artist, Release } from "@/lib/types/content";
import { formatReleaseDate } from "@/lib/utils/date";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function ReleaseCard({
  release,
  artist,
  className,
  priority,
}: {
  release: Release;
  artist?: Artist | null;
  className?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  return (
    <motion.article
      className={cn("@container group relative", className)}
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/music/${release.slug}`}
        className="block rounded-sm focus-visible:outline-offset-4"
      >
        <div className="relative aspect-square overflow-hidden rounded-sm bg-surface shadow-lg shadow-void/60 ring-1 ring-border-subtle transition-[box-shadow,ring-color] duration-500 group-hover:shadow-xl group-hover:ring-border">
          {release.cover.placeholder ? <PlaceholderBanner /> : null}
          <Image
            src={release.cover.src}
            alt={release.cover.alt}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        <div className="mt-3 space-y-1.5 @[12rem]:mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{release.type}</Badge>
            {artist ? (
              <span className="truncate text-[10px] uppercase tracking-widest text-text-muted">
                {artist.name}
              </span>
            ) : null}
          </div>
          <h3 className="line-clamp-2 font-display text-base text-text-primary transition-colors group-hover:text-silver @[12rem]:text-lg">
            {release.title}
          </h3>
          <p className="text-xs text-text-muted">
            {formatReleaseDate(release.releaseDate, dateLocale)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
