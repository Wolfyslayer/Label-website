"use client";

import { Button } from "@/components/ui/button";
import { getConfiguredStreamingLinks } from "@/lib/utils/streaming";
import type { StreamingLinks as StreamingLinksType } from "@/lib/types/content";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

export function StreamingLinks({ links }: { links: StreamingLinksType }) {
  const t = useTranslations("streaming");
  const configured = getConfiguredStreamingLinks(links);

  if (!configured.length) {
    return <p className="text-sm text-text-muted">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {configured.map(({ platform, label, url }) => (
        <li key={platform}>
          <Button href={url} external variant="outline" size="sm">
            {label}
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
