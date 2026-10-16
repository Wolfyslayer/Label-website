"use client";

import { Badge } from "@/components/ui/badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { artistMediaPaths } from "@/lib/assets/artist-media";

export function ArtistCard({ artist, className }: { artist: Artist; className?: string }) {
  const t = useTranslations("artist");
  const tCommon = useTranslations("common");
  const isFrost = artist.theme === "frost";

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className={cn(
        "@container group relative flex min-h-[min(360px,68dvh)] flex-col justify-end overflow-hidden rounded-sm ring-1 ring-border-subtle transition-[box-shadow,ring-color,transform] duration-500 hover:ring-frost/30 motion-safe:hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(0,0,0,0.85)] sm:min-h-[min(420px,75dvh)]",
        !isFrost && "hover:ring-wolf/30",
        className,
      )}
    >
      <div className="absolute inset-0">
        {artist.heroImage?.placeholder || artist.image.placeholder ? (
          <PlaceholderBanner label={tCommon("placeholderPhoto")} />
        ) : null}
        {artist.slug === "frostmark" || artist.slug === "wolfyslayer" ? (
          // Generated variants for the two official artist banners.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artistMediaPaths[artist.slug].hero.replace("-1280x512.webp", "-768.webp")}
            srcSet={`${artistMediaPaths[artist.slug].hero.replace("-1280x512.webp", "-480.webp")} 480w, ${artistMediaPaths[artist.slug].hero.replace("-1280x512.webp", "-768.webp")} 768w, ${artistMediaPaths[artist.slug].hero} 1280w`}
            alt={artist.heroImage?.alt ?? artist.image.alt}
            width={1280}
            height={512}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.045]",
              isFrost ? "object-[center_20%]" : "object-[center_15%]",
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <Image
            src={artist.heroImage?.src ?? artist.image.src}
            alt={artist.heroImage?.alt ?? artist.image.alt}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.045]",
              isFrost ? "object-[center_20%]" : "object-[center_15%]",
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <div
          className={cn(
            "absolute inset-0",
            isFrost
              ? "bg-gradient-to-t from-void via-void/75 to-frost/15"
              : "bg-gradient-to-t from-void via-void/78 to-wolf/12",
          )}
        />
      </div>
      <div className="relative z-10 p-[clamp(1.5rem,4vw,3rem)]">
        <Badge variant={isFrost ? "frost" : "wolf"}>{t("badge")}</Badge>
        <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight text-text-primary">
          {artist.name}
        </h2>
        <p className="mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-text-secondary @[22rem]:text-base">
          {artist.shortBio}
        </p>
        <span className="mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver group-hover:text-text-primary">
          {t("view")} →
        </span>
      </div>
    </Link>
  );
}
