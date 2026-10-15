import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import { getLabelInfo, getPublishedArtists } from "@/lib/content";
import { JsonLd } from "@/components/seo/json-ld";
import { absolutePublicPath, buildAlternates } from "@/lib/metadata/alternates";
import { labelOrganizationJsonLd } from "@/lib/metadata/json-ld";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import { resolvePageLocale, type LocalePageParams } from "@/lib/i18n/page-locale";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageParams): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/about", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/about" }),
  };
}

export default async function AboutPage({ params }: LocalePageParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations("aboutPage");
  const [label, artists] = await Promise.all([getLabelInfo(locale), getPublishedArtists(locale)]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} headingLevel={1} />
        <div className="mt-10 space-y-10 text-[length:var(--text-body)] leading-relaxed text-text-secondary">
          <section aria-labelledby="about-story">
            <h2 id="about-story" className="sr-only">
              {t("title")}
            </h2>
            <p>{label.story}</p>
          </section>
          <section aria-labelledby="about-relationship">
            <h2 id="about-relationship" className="font-display text-2xl text-text-primary">
              {t("relationshipHeading")}
            </h2>
            <p className="mt-4">{t("relationshipBody")}</p>
          </section>
          <section aria-labelledby="about-mission">
            <h2 id="about-mission" className="font-display text-2xl text-text-primary">
              {t("mission")}
            </h2>
            <p className="mt-4">{label.mission}</p>
          </section>
          <section aria-labelledby="about-artists">
            <h2 id="about-artists" className="font-display text-2xl text-text-primary">
              {t("artistsHeading")}
            </h2>
            <ul className="mt-4 space-y-3">
              {artists.map((artist) => (
                <li key={artist.id}>
                  <Link href={`/artists/${artist.slug}`} className="text-accent hover:text-text-primary">
                    {artist.name}
                  </Link>
                  <span className="text-text-muted"> — {artist.tagline}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
      <JsonLd
        data={{
          ...labelOrganizationJsonLd(locale),
          description: label.story,
          member: artists.map((artist) => ({
            "@type": "MusicGroup",
            name: artist.name,
            url: absolutePublicPath(locale, `/artists/${artist.slug}`),
          })),
        }}
      />
    </div>
  );
}
