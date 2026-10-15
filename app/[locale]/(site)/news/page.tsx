import { NewsCard } from "@/components/news/news-card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { getNewsListing } from "@/lib/content/news-listing";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "newsPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/news", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/news" }),
  };
}

export default async function NewsPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("newsPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";
  const { featured, articles } = await getNewsListing(locale);
  const hasAny = featured.length + articles.length > 0;

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("listingDescription")}
          headingLevel={1}
        />
        {hasAny ? (
          <div className="mt-12 space-y-16">
            {featured.length ? (
              <section aria-labelledby="news-featured-heading">
                <h2 id="news-featured-heading" className="sr-only">
                  {t("featuredHeading")}
                </h2>
                <ul className="grid gap-12 lg:grid-cols-2">
                  {featured.map((article) => (
                    <li key={article.id}>
                      <NewsCard
                        article={article}
                        dateLocale={dateLocale}
                        featured
                        readLabel={t("readArticle")}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {articles.length ? (
              <section aria-labelledby="news-all-heading">
                <h2
                  id="news-all-heading"
                  className="mb-8 font-display text-2xl text-text-primary md:text-3xl"
                >
                  {featured.length ? t("moreNews") : t("title")}
                </h2>
                <ul className="grid gap-10 md:grid-cols-2">
                  {articles.map((article) => (
                    <li key={article.id}>
                      <NewsCard article={article} dateLocale={dateLocale} readLabel={t("readArticle")} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="mt-10 text-text-muted">{t("empty")}</p>
        )}
      </Container>
    </div>
  );
}
