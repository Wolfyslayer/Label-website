import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublishedNews } from "@/lib/content";
import { formatNewsDate } from "@/lib/utils/date";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News",
  description: `Announcements and updates from ${siteConfig.fullName}.`,
};

export default async function NewsPage() {
  const articles = await getPublishedNews();
  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader eyebrow="Updates" title="News" />
        {articles.length ? (
          <ul className="grid gap-10 md:grid-cols-2">
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
                    />
                  </div>
                  <time className="mt-4 block text-xs uppercase tracking-widest text-text-muted">
                    {formatNewsDate(article.publishedAt)}
                  </time>
                  <h2 className="mt-2 font-display text-2xl group-hover:text-accent">{article.title}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{article.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No news published yet.</p>
        )}
      </Container>
    </div>
  );
}
