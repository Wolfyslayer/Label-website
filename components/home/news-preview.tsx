import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import type { NewsArticle } from "@/lib/types/content";
import { formatNewsDate } from "@/lib/utils/date";
import Image from "next/image";
import Link from "next/link";

export function NewsPreviewSection({ articles }: { articles: NewsArticle[] }) {
  if (!articles.length) return null;
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader eyebrow="News" title="Latest updates" className="mb-0" />
          <Link
            href="/news"
            className="text-xs uppercase tracking-[0.2em] text-accent hover:text-text-primary"
          >
            All news →
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
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <time className="mt-4 block text-xs uppercase tracking-widest text-text-muted">
                  {formatNewsDate(article.publishedAt)}
                </time>
                <h3 className="mt-2 font-display text-xl text-text-primary group-hover:text-accent">
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
