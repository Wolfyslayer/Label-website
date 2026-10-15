import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getPublishedNews, getNewsBySlug } from "@/lib/content";
import { formatNewsDate } from "@/lib/utils/date";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const news = await getPublishedNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <article className="pt-24 md:pt-28">
      <Container className="max-w-3xl pb-20 md:pb-28">
        <Link href="/news" className="text-xs uppercase tracking-widest text-accent">
          ← News
        </Link>
        <time className="mt-6 block text-xs uppercase tracking-widest text-text-muted">
          {formatNewsDate(article.publishedAt)}
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
            url: `${siteConfig.url}/news/${article.slug}`,
          }),
        }}
      />
    </article>
  );
}
