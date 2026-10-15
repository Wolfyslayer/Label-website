import { Button } from "@/components/ui/button";
import type { StreamingPlatform } from "@/lib/types/content";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

const accent: Partial<Record<StreamingPlatform, string>> = {
  spotify: "border-[#1DB954]/40 hover:border-[#1DB954]/70",
  appleMusic: "border-[#FA243C]/30 hover:border-[#FA243C]/60",
  youtubeMusic: "border-[#FF0000]/30 hover:border-[#FF0000]/55",
};

export async function StreamingPlatformGrid({
  links,
}: {
  links: { platform: StreamingPlatform; label: string; url: string }[];
}) {
  const t = await getTranslations("releaseHub");

  if (!links.length) {
    return <p className="text-sm text-text-muted">{t("noStreaming")}</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map(({ platform, label, url }) => (
        <li key={platform}>
          <Button
            href={url}
            external
            variant="outline"
            className={`min-h-12 w-full justify-between gap-2 ${accent[platform] ?? ""}`}
          >
            <span>{label}</span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
