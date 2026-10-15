import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingLinks } from "@/components/music/streaming-links";
import { Link } from "@/i18n/navigation";
import { getPressAssets, getPublishedArtists } from "@/lib/content";
import { pressAssetDownloadHref } from "@/lib/press/downloads";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "pressPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/press", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/press" }),
  };
}

export default async function PressPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("pressPage");
  const [assets, artists] = await Promise.all([getPressAssets(locale), getPublishedArtists(locale)]);
  const logos = assets.filter((a) => a.type === "logo");
  const otherAssets = assets.filter((a) => a.type !== "logo");

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <section className="mb-16" aria-labelledby="press-contact-heading">
          <h2 id="press-contact-heading" className="font-display text-2xl">
            {t("labelContact")}
          </h2>
          <p className="mt-4 text-sm text-text-secondary">
            {t("pressInquiries")}:{" "}
            {siteConfig.pressEmail || siteConfig.contactEmail ? (
              <a
                href={`mailto:${siteConfig.pressEmail || siteConfig.contactEmail}`}
                className="text-accent"
              >
                {siteConfig.pressEmail || siteConfig.contactEmail}
              </a>
            ) : (
              <span className="text-text-muted">{t("configureEmail")}</span>
            )}
          </p>
        </section>

        <section className="mb-16" aria-labelledby="press-portraits-heading">
          <h2 id="press-portraits-heading" className="mb-8 font-display text-2xl">
            {t("portraits")}
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2">
            {artists.map((artist) => (
              <li
                key={artist.id}
                className="overflow-hidden rounded-sm border border-border-subtle bg-charcoal/40"
              >
                <div className="relative aspect-[4/5] bg-surface">
                  {artist.image.placeholder ? <PlaceholderBanner /> : null}
                  <Image
                    src={artist.image.src}
                    alt={artist.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl text-text-primary">{artist.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{artist.shortBio}</p>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="mt-4 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-accent hover:text-text-primary"
                  >
                    {t("viewArtist")} →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {logos.length ? (
          <section className="mb-16" aria-labelledby="press-logos-heading">
            <h2 id="press-logos-heading" className="mb-8 font-display text-2xl">
              {t("logos")}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {logos.map((asset) => {
                const downloadHref = pressAssetDownloadHref(asset);
                return (
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
                      {downloadHref ? (
                        <Button href={downloadHref} external variant="ghost" size="sm" className="mt-3">
                          {t("download")}
                        </Button>
                      ) : (
                        <p className="mt-2 text-xs text-text-muted">{t("downloadMissing")}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {otherAssets.length ? (
          <section className="mb-16" aria-labelledby="press-assets-heading">
            <h2 id="press-assets-heading" className="mb-8 font-display text-2xl">
              {t("assets")}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherAssets.map((asset) => {
                const downloadHref = pressAssetDownloadHref(asset);
                return (
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
                      {downloadHref ? (
                        <Button href={downloadHref} external variant="ghost" size="sm" className="mt-3">
                          {t("download")}
                        </Button>
                      ) : (
                        <p className="mt-2 text-xs text-text-muted">{t("downloadMissing")}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="space-y-12" aria-labelledby="press-bios-heading">
          <h2 id="press-bios-heading" className="font-display text-2xl">
            {t("bios")}
          </h2>
          {artists.map((artist) => (
            <article key={artist.id} className="border-t border-border-subtle pt-10">
              <h3 className="font-display text-3xl">{artist.name}</h3>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-text-muted">{t("short")}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{artist.shortBio}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-text-muted">{t("long")}</h4>
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
