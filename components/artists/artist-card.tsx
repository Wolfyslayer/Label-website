"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

export function ArtistCard({ artist, className }: { artist: Artist; className?: string }) {
  const { messages } = useLocale();
  const isFrost = artist.theme === "frost";

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className={cn(
        "@container group relative flex min-h-[min(420px,75dvh)] flex-col justify-end overflow-hidden rounded-sm ring-1 ring-border-subtle transition-[box-shadow,ring-color] duration-500 hover:ring-frost/30",
        !isFrost && "hover:ring-wolf/30",
        className,
      )}
    >
      <div className="absolute inset-0">
        {artist.heroImage?.placeholder || artist.image.placeholder ? (
          <PlaceholderBanner label="Temporary — official portrait pending" />
        ) : null}
        <Image
          src={artist.heroImage?.src ?? artist.image.src}
          alt={artist.heroImage?.alt ?? artist.image.alt}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
            isFrost ? "object-[center_20%]" : "object-[center_15%]",
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className={cn(
            "absolute inset-0",
            isFrost
              ? "bg-gradient-to-t from-void via-void/75 to-frost/15"
              : "bg-gradient-to-t from-void via-void/78 to-wolf/12",
          )}
        />
      </div>
      <div className="relative z-10 p-[clamp(1.5rem,4vw,2.5rem)]">
        <Badge variant={isFrost ? "frost" : "wolf"}>{messages.artist.badge}</Badge>
        <h2 className="mt-4 font-display text-[clamp(1.75rem,4vw,3rem)] text-text-primary">
          {artist.name}
        </h2>
        <p className="mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-text-secondary @[22rem]:text-base">
          {artist.shortBio}
        </p>
        <span className="mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver group-hover:text-text-primary">
          {messages.artist.view} →
        </span>
      </div>
    </Link>
  );
}
