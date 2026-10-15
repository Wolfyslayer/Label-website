"use client";

import { Badge } from "@/components/ui/badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import type { Artist, Release } from "@/lib/types/content";
import { formatReleaseDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <motion.article
      className={cn("group relative", className)}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/music/${release.slug}`} className="block focus-visible:outline-offset-4">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-surface shadow-lg shadow-void/50 ring-1 ring-border-subtle transition-shadow duration-500 group-hover:shadow-xl group-hover:ring-border">
          {release.cover.placeholder ? <PlaceholderBanner /> : null}
          <Image
            src={release.cover.src}
            alt={release.cover.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{release.type}</Badge>
            {artist ? (
              <span className="text-xs uppercase tracking-widest text-text-muted">
                {artist.name}
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-lg text-text-primary transition-colors group-hover:text-accent">
            {release.title}
          </h3>
          <p className="text-sm text-text-muted">{formatReleaseDate(release.releaseDate)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
