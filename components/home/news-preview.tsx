"use client";

import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";
import type { NewsArticle } from "@/lib/types/content";
import { formatNewsDate } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export function NewsPreviewSection({ articles }: { articles: NewsArticle[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  if (!articles.length) return null;

  return (
    <section className="py-[var(--space-section)]">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader eyebrow={t("newsEyebrow")} title={t("newsTitle")} className="mb-0" />
          <Link
            href="/news"
            className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver hover:text-text-primary"
          >
            {t("newsCta")} →
          </Link>
        </div>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/news/${article.slug}`} className="group block">
                <div className="relative aspect-[16/10] max-h-[min(56vw,240px)] w-full overflow-hidden rounded-sm bg-surface ring-1 ring-border-subtle">
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
                  {formatNewsDate(article.publishedAt, dateLocale)}
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
