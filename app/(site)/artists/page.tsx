import { ArtistCard } from "@/components/artists/artist-card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedArtists } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artists",
  description: `Artists on ${siteConfig.fullName}: Frostmark and Wolfyslayer.`,
};

export default async function ArtistsPage() {
  const artists = await getPublishedArtists();
  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow="Roster"
          title="Artists"
          description="Distinct identities, unified by independent curation."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </Container>
    </div>
  );
}
