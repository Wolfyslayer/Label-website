"use client";

import { ReleaseCard } from "@/components/music/release-card";
import type { Artist, Release } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function ReleaseCarousel({
  releases,
  artists,
  className,
}: {
  releases: Release[];
  artists: Artist[];
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const artistById = new Map(artists.map((a) => [a.id, a]));

  function scrollBy(delta: number) {
    scroller.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (!releases.length) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-12 bg-gradient-to-r from-charcoal/50 to-transparent md:block" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-12 bg-gradient-to-l from-charcoal/50 to-transparent md:block" />
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Featured releases carousel"
      >
        {releases.map((release) => (
          <div key={release.id} className="w-[72vw] shrink-0 snap-start sm:w-[280px] md:w-[300px]">
            <ReleaseCard release={release} artist={artistById.get(release.artistId)} />
          </div>
        ))}
      </div>
      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => scrollBy(-320)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border text-text-secondary hover:text-text-primary focus-visible:outline-offset-2"
          aria-label="Scroll releases left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(320)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border text-text-secondary hover:text-text-primary focus-visible:outline-offset-2"
          aria-label="Scroll releases right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
