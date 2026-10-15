import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingLinks } from "@/components/music/streaming-links";
import { getPressAssets, getPublishedArtists } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Press Kit",
  description: `Approved assets and bios for ${siteConfig.fullName}.`,
};

export default async function PressPage() {
  const [assets, artists] = await Promise.all([getPressAssets(), getPublishedArtists()]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow="Media"
          title="Press kit"
          description="Download approved logos and photography. Replace placeholder assets before external distribution."
        />

        <section className="mb-16">
          <h2 className="font-display text-2xl">Label contact</h2>
          <p className="mt-4 text-sm text-text-secondary">
            Press inquiries:{" "}
            {siteConfig.pressEmail || siteConfig.contactEmail ? (
              <a
                href={`mailto:${siteConfig.pressEmail || siteConfig.contactEmail}`}
                className="text-accent"
              >
                {siteConfig.pressEmail || siteConfig.contactEmail}
              </a>
            ) : (
              <span className="text-text-muted">Configure NEXT_PUBLIC_PRESS_EMAIL or contact email</span>
            )}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 font-display text-2xl">Assets</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="overflow-hidden rounded-sm border border-border-subtle bg-charcoal/40"
              >
                <div className="relative aspect-[4/3] bg-surface">
                  {asset.placeholder ? <PlaceholderBanner /> : null}
                  <Image src={asset.src} alt={asset.alt} fill className="object-contain p-4" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-text-primary">{asset.title}</p>
                  {asset.downloadUrl ? (
                    <Button href={asset.downloadUrl} external variant="ghost" size="sm" className="mt-3">
                      Download
                    </Button>
                  ) : (
                    <p className="mt-2 text-xs text-text-muted">High-res download URL not configured</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-12">
          <h2 className="font-display text-2xl">Artist bios</h2>
          {artists.map((artist) => (
            <article key={artist.id} className="border-t border-border-subtle pt-10">
              <h3 className="font-display text-3xl">{artist.name}</h3>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-text-muted">Short</h4>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{artist.shortBio}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-text-muted">Long</h4>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                    {artist.longBio}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <StreamingLinks links={artist.streamingLinks} />
              </div>
            </article>
          ))}
        </section>
      </Container>
    </div>
  );
}
