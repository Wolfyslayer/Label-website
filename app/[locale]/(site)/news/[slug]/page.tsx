import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getNewsBySlug, getPublishedNews } from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import { formatNewsDate } from "@/lib/utils/date";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateStaticParams() {
  const slugs = (await getPublishedNews("en")).map((n) => n.slug);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const article = await getNewsBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: "newsPage" });
  if (!article) return { title: t("notFound") };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: buildAlternates(`/news/${slug}`, locale),
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations("newsPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  const article = await getNewsBySlug(slug, locale);
  if (!article) notFound();

  return (
    <article className="pt-24 md:pt-28">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <Link href="/news" className="text-xs uppercase tracking-widest text-accent">
          ← {t("back")}
        </Link>
        <time className="mt-6 block text-xs uppercase tracking-widest text-text-muted">
          {formatNewsDate(article.publishedAt, dateLocale)}
        </time>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{article.title}</h1>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm ring-1 ring-border">
          {article.cover.placeholder ? <PlaceholderBanner /> : null}
          <Image src={article.cover.src} alt={article.cover.alt} fill className="object-cover" priority />
        </div>
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-line text-base leading-relaxed text-text-secondary">
          {article.body}
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            datePublished: article.publishedAt,
            url: `${siteConfig.url}/${locale}/news/${article.slug}`,
          }),
        }}
      />
    </article>
  );
}
