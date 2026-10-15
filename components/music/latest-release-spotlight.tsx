import { ReleaseCard } from "@/components/music/release-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { Artist, Release } from "@/lib/types/content";
import { getReleaseSpotifyUrl } from "@/lib/utils/streaming";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export async function LatestReleaseSpotlight({
  release,
  artist,
}: {
  release: Release;
  artist: Artist;
}) {
  const t = await getTranslations("artist");
  const spotifyUrl = getReleaseSpotifyUrl(release);

  return (
    <section aria-labelledby="artist-latest-release">
      <SectionHeader eyebrow={t("discographyEyebrow")} title={t("latestRelease")} align="left" />
      <div className="mt-8 grid max-w-5xl gap-8 @[36rem]:grid-cols-[minmax(0,280px)_1fr] @[36rem]:items-start">
        <ReleaseCard release={release} artist={artist} priority />
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <p className="text-sm leading-relaxed text-text-secondary">{release.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button href={`/music/${release.slug}`} variant="secondary" size="sm" className="min-h-11">
              {t("viewLatestRelease")}
            </Button>
            {spotifyUrl ? (
              <Button href={spotifyUrl} external variant="outline" size="sm" className="min-h-11">
                Spotify
                <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
