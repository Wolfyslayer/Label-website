import { ReleaseCard } from "@/components/music/release-card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import type { Artist, Release } from "@/lib/types/content";
import { getTranslations } from "next-intl/server";

export async function RelatedReleasesSection({
  releases,
  artists,
  titleKey = "relatedReleases",
}: {
  releases: Release[];
  artists: Artist[];
  titleKey?: "relatedReleases" | "fromLabel";
}) {
  if (!releases.length) return null;

  const t = await getTranslations("musicDiscovery");
  const artistById = new Map(artists.map((a) => [a.id, a]));

  return (
    <section className="border-t border-border-subtle bg-charcoal/30 py-[var(--space-section)]">
      <Container>
        <SectionHeader eyebrow={t("discoverEyebrow")} title={t(titleKey)} align="left" />
        <div className="@container mt-8">
          <div className="album-grid">
            {releases.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                artist={artistById.get(release.artistId)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
