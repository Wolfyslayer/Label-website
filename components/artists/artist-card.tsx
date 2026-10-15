import { Badge } from "@/components/ui/badge";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";

export function ArtistCard({ artist, className }: { artist: Artist; className?: string }) {
  const isFrost = artist.theme === "frost";
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className={cn(
        "group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-sm ring-1 ring-border-subtle transition-all duration-500 hover:ring-border",
        className,
      )}
    >
      <div className="absolute inset-0">
        {artist.heroImage?.placeholder || artist.image.placeholder ? (
          <PlaceholderBanner label="Placeholder photography" />
        ) : null}
        <Image
          src={artist.heroImage?.src ?? artist.image.src}
          alt={artist.heroImage?.alt ?? artist.image.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className={cn(
            "absolute inset-0",
            isFrost
              ? "bg-gradient-to-t from-void via-void/70 to-frost/10"
              : "bg-gradient-to-t from-void via-void/75 to-wolf/10",
          )}
        />
      </div>
      <div className="relative z-10 p-8 md:p-10">
        <Badge variant={isFrost ? "frost" : "wolf"}>Artist</Badge>
        <h2 className="mt-4 font-display text-4xl text-text-primary md:text-5xl">{artist.name}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
          {artist.shortBio}
        </p>
        <span className="mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-accent group-hover:text-text-primary">
          View artist →
        </span>
      </div>
    </Link>
  );
}
