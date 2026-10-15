"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import type { NewsArticle } from "@/lib/types/content";
import { formatNewsDate } from "@/lib/utils/date";
import Image from "next/image";
import Link from "next/link";

export function NewsPreviewSection({ articles }: { articles: NewsArticle[] }) {
  const { messages, locale } = useLocale();
  if (!articles.length) return null;

  return (
    <section className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader eyebrow={messages.home.newsEyebrow} title={messages.home.newsTitle} className="mb-0" />
          <Link
            href="/news"
            className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver hover:text-text-primary"
          >
            {messages.home.newsCta} →
          </Link>
        </div>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/news/${article.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-surface ring-1 ring-border-subtle">
                  {article.cover.placeholder ? <PlaceholderBanner /> : null}
                  <Image
                    src={article.cover.src}
                    alt={article.cover.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <time
                  className="mt-4 block text-xs uppercase tracking-widest text-text-muted"
                  dateTime={article.publishedAt}
                >
                  {formatNewsDate(article.publishedAt, locale === "sv" ? "sv-SE" : "en-US")}
                </time>
                <h3 className="mt-2 line-clamp-2 font-display text-xl text-text-primary group-hover:text-silver">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{article.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
