import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import { getLabelInfo, getPublishedArtists } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("metaTitle"),
    description: meta("defaultDescription"),
    alternates: buildAlternates("/about", locale),
  };
}

export default async function AboutPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("aboutPage");
  const [label, artists] = await Promise.all([getLabelInfo(locale), getPublishedArtists(locale)]);

  return (
    <div className="pt-24 md:pt-28">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="space-y-8 text-base leading-relaxed text-text-secondary">
          <p>{label.story}</p>
          <div>
            <h2 className="font-display text-2xl text-text-primary">{t("mission")}</h2>
            <p className="mt-4">{label.mission}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-text-primary">{t("artistsHeading")}</h2>
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
