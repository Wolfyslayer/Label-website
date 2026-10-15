import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getLabelInfo, getPublishedArtists } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

export default async function AboutPage() {
  const [label, artists] = await Promise.all([getLabelInfo(), getPublishedArtists()]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <SectionHeader eyebrow="Label" title="About WOLFYSLAYER" />
        <div className="space-y-8 text-base leading-relaxed text-text-secondary">
          <p>{label.story}</p>
          <div>
            <h2 className="font-display text-2xl text-text-primary">Mission</h2>
            <p className="mt-4">{label.mission}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-text-primary">Artists</h2>
            <ul className="mt-4 space-y-2">
              {artists.map((artist) => (
                <li key={artist.id}>
                  <Link href={`/artists/${artist.slug}`} className="text-accent hover:text-text-primary">
                    {artist.name}
                  </Link>
                  <span className="text-text-muted"> — {artist.tagline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
