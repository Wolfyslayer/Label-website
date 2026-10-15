import { uniqueId } from "@/lib/manager/slugs";
import type { NewsForm } from "@/lib/manager/types";

export function createEmptyNews(): NewsForm {
  const stamp = Date.now().toString(36);
  return {
    id: uniqueId("news"),
    slug: `news-${stamp}`,
    status: "draft",
    publishedAt: new Date().toISOString(),
    title: { en: "", sv: "" },
    excerpt: { en: "", sv: "" },
    body: { en: "", sv: "" },
    cover: {
      src: "/assets/social/frostmark-square-1080.webp",
      alt: {
        en: "News cover image",
        sv: "Nyhetsbild",
      },
      placeholder: false,
    },
  };
}
