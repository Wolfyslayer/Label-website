import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingLinks } from "@/components/music/streaming-links";
import type { Artist, Release } from "@/lib/types/content";
import { formatReleaseDate } from "@/lib/utils/date";
import Image from "next/image";

export function FeaturedReleaseSection({
  release,
  artist,
}: {
  release: Release | null;
  artist: Artist | null;
}) {
  if (!release) return null;

  return (
    <section className="border-y border-border-subtle bg-surface/40 py-20 md:py-28">
      <Container>
        <SectionHeader eyebrow="Featured" title="Latest spotlight" align="left" />
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            {release.cover.placeholder ? <PlaceholderBanner /> : null}
            <Image
              src={release.cover.src}
              alt={release.cover.alt}
              fill
              className="rounded-sm object-cover shadow-2xl ring-1 ring-border"
              sizes="(max-width: 1024px) 80vw, 40vw"
              priority
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{release.type}</Badge>
              {artist ? <Badge variant={artist.theme === "frost" ? "frost" : "wolf"}>{artist.name}</Badge> : null}
            </div>
            <h3 className="mt-6 font-display text-4xl text-text-primary md:text-5xl">{release.title}</h3>
            <p className="mt-2 text-sm uppercase tracking-widest text-text-muted">
              {formatReleaseDate(release.releaseDate)}
            </p>
            <p className="mt-6 text-base leading-relaxed text-text-secondary">{release.description}</p>
            <div className="mt-8 space-y-4">
              <StreamingLinks links={release.streamingLinks} />
              <Button href={`/music/${release.slug}`} variant="secondary">
                View release
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
