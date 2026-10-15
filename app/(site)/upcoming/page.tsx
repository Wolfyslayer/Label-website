import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { ReleaseCountdown } from "@/components/music/countdown";
import { getPublishedArtists, getUpcomingReleases } from "@/lib/content";
import { formatReleaseDate } from "@/lib/utils/date";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Upcoming Releases",
  description: `Scheduled releases from ${siteConfig.fullName}.`,
};

export default async function UpcomingPage() {
  const [upcoming, artists] = await Promise.all([
    getUpcomingReleases(),
    getPublishedArtists(),
  ]);
  const artistById = new Map(artists.map((a) => [a.id, a]));

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow="Schedule"
          title="Upcoming releases"
          description="Countdowns reflect stored release timestamps in UTC."
        />
        {upcoming.length ? (
          <ul className="space-y-10">
            {upcoming.map((release) => {
              const artist = artistById.get(release.artistId);
              return (
                <li
                  key={release.id}
                  className="grid gap-8 rounded-sm border border-border-subtle bg-surface/40 p-6 md:grid-cols-[200px_1fr] md:p-10 lg:grid-cols-[240px_1fr_auto]"
                >
                  <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-sm ring-1 ring-border">
                    {release.cover.placeholder ? <PlaceholderBanner /> : null}
                    <Image
                      src={release.cover.src}
                      alt={release.cover.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted">
                      {artist?.name} · {release.type}
                    </p>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">{release.title}</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      {formatReleaseDate(release.releaseDate)}
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
                      {release.description}
                    </p>
                    {release.preSaveUrl ? (
                      <div className="mt-6">
                        <Button href={release.preSaveUrl} external size="sm">
                          Pre-save
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-start lg:items-center">
                    <ReleaseCountdown releaseAt={release.releaseAt} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-text-secondary">
            No upcoming releases scheduled. Check back soon or browse the{" "}
            <Link href="/music" className="text-accent underline-offset-4 hover:underline">
              catalog
            </Link>
            .
          </p>
        )}
      </Container>
    </div>
  );
}
