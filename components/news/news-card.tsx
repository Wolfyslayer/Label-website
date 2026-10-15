import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { Link } from "@/i18n/navigation";
import type { NewsArticle } from "@/lib/types/content";
import { formatNewsDate } from "@/lib/utils/date";
import Image from "next/image";

export function NewsCard({
  article,
  dateLocale,
  featured,
  readLabel,
}: {
  article: NewsArticle;
  dateLocale: string;
  featured?: boolean;
  readLabel: string;
}) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/news/${article.slug}`} className="flex h-full flex-col">
        <div
          className={`relative overflow-hidden rounded-sm bg-surface ring-1 ring-border-subtle ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          }`}
        >
          {article.cover.placeholder ? <PlaceholderBanner /> : null}
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 768px) 100vw, 50vw"}
          />
        </div>
        <time
          className="mt-4 block text-xs uppercase tracking-widest text-text-muted"
          dateTime={article.publishedAt}
        >
          {formatNewsDate(article.publishedAt, dateLocale)}
        </time>
        <h2
          className={`mt-2 font-display text-text-primary transition-colors group-hover:text-silver ${
            featured ? "text-3xl md:text-4xl" : "text-2xl"
          }`}
        >
          {article.title}
        </h2>
        <p className={`mt-3 line-clamp-3 flex-1 leading-relaxed text-text-secondary ${featured ? "text-base" : "text-sm"}`}>
          {article.excerpt}
        </p>
        <span className="mt-4 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-accent group-hover:text-text-primary">
          {readLabel} →
        </span>
      </Link>
    </article>
  );
}
