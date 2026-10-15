import { ArticleProse } from "@/components/news/article-prose";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  getArtistById,
  getNewsBySlug,
  getPublishedNews,
  getReleaseById,
} from "@/lib/content";
import { isStaticExportPlaceholderSlug, localeSlugParams } from "@/lib/content/static-export-params";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import { absoluteAssetUrl, pageOpenGraph } from "@/lib/metadata/open-graph";
import { formatNewsDate } from "@/lib/utils/date";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = (await getPublishedNews("en")).map((n) => n.slug);
  return localeSlugParams(slugs);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const article = await getNewsBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: "newsPage" });
  if (!article) return { title: t("notFound") };
  const title = article.title;
  const description = article.excerpt;
  return {
    title,
    description,
    alternates: buildAlternates(`/news/${slug}`, locale),
    ...pageOpenGraph({
      title,
      description,
      locale,
      pathname: `/news/${slug}`,
      image: article.cover.placeholder ? undefined : article.cover.src,
      imageAlt: article.cover.alt,
      type: "article",
    }),
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("newsPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  if (isStaticExportPlaceholderSlug(slug)) notFound();
  const article = await getNewsBySlug(slug, locale);
  if (!article) notFound();

  const [relatedArtist, relatedRelease] = await Promise.all([
    article.artistId ? getArtistById(article.artistId, locale) : Promise.resolve(null),
    article.releaseId ? getReleaseById(article.releaseId, locale) : Promise.resolve(null),
  ]);

  const pageUrl = `${siteConfig.url.replace(/\/$/, "")}/${locale}/news/${article.slug}`;
  const imageUrl = article.cover.placeholder ? undefined : absoluteAssetUrl(article.cover.src);

  return (
    <article className="page-offset">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <Link
          href="/news"
          className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-accent hover:text-text-primary"
        >
          ← {t("back")}
        </Link>
        <header className="mt-6">
          <time className="block text-xs uppercase tracking-widest text-text-muted" dateTime={article.publishedAt}>
            {formatNewsDate(article.publishedAt, dateLocale)}
          </time>
          <h1 className="mt-4 text-balance font-display text-4xl leading-tight md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">{article.excerpt}</p>
        </header>
        <figure className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm ring-1 ring-border">
          {article.cover.placeholder ? <PlaceholderBanner /> : null}
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 48rem"
          />
        </figure>
        <ArticleProse>{article.body}</ArticleProse>
        {relatedArtist || relatedRelease ? (
          <aside className="mt-12 border-t border-border-subtle pt-8">
            <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("relatedHeading")}</h2>
            <ul className="mt-4 space-y-2 text-base">
              {relatedArtist ? (
                <li>
                  <span className="text-text-muted">{t("relatedArtist")}: </span>
                  <Link href={`/artists/${relatedArtist.slug}`} className="text-accent hover:text-text-primary">
                    {relatedArtist.name}
                  </Link>
                </li>
              ) : null}
              {relatedRelease ? (
                <li>
                  <span className="text-text-muted">{t("relatedRelease")}: </span>
                  <Link href={`/releases/${relatedRelease.slug}`} className="text-accent hover:text-text-primary">
                    {relatedRelease.title}
                  </Link>
                </li>
              ) : null}
            </ul>
          </aside>
        ) : null}
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            url: pageUrl,
            inLanguage: locale === "sv" ? "sv-SE" : "en-US",
            ...(imageUrl
              ? {
                  image: [imageUrl],
                }
              : {}),
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
          }),
        }}
      />
    </article>
  );
}
