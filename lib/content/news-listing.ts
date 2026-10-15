import type { AppLocale } from "@/i18n/routing";
import { getPublishedNews } from "@/lib/content/index";
import { seedContent } from "@/lib/data/seed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { NewsArticle } from "@/lib/types/content";

async function featuredNewsIds(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      if (supabase) {
        const { data } = await supabase.from("site_settings").select("homepage_featured_news_ids").eq("id", 1).maybeSingle();
        if (data?.homepage_featured_news_ids?.length) {
          return data.homepage_featured_news_ids as string[];
        }
      }
    } catch {
      // fall through
    }
  }
  return seedContent.homepageFeaturedNewsIds;
}

export async function getNewsListing(locale: AppLocale): Promise<{
  featured: NewsArticle[];
  articles: NewsArticle[];
}> {
  const all = await getPublishedNews(locale);
  const ids = await featuredNewsIds();
  const featured = ids.map((id) => all.find((n) => n.id === id)).filter(Boolean) as NewsArticle[];
  const featuredSet = new Set(featured.map((n) => n.id));
  const articles = all.filter((n) => !featuredSet.has(n.id));
  return { featured, articles };
}
