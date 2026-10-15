import { MusicCatalog } from "@/components/music/music-catalog";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedArtists, getReleasedCatalog } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music",
  description: `Explore the ${siteConfig.fullName} catalog.`,
};

export default async function MusicPage() {
  const [releases, artists] = await Promise.all([
    getReleasedCatalog(),
    getPublishedArtists(),
  ]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow="Catalog"
          title="Music"
          description="Search and filter releases from Frostmark and Wolfyslayer."
        />
        <MusicCatalog releases={releases} artists={artists} />
      </Container>
    </div>
  );
}
