"use client";

import { getConfiguredStreamingLinks } from "@/lib/utils/streaming";
import type { StreamingLinks as StreamingLinksType, StreamingPlatform } from "@/lib/types/content";
import { Music2 } from "lucide-react";
import { useTranslations } from "next-intl";

const logos: Partial<Record<StreamingPlatform, string>> = {
  spotify: "spotify",
  appleMusic: "applemusic",
  youtubeMusic: "youtubemusic",
  deezer: "deezer",
  tidal: "tidal",
  soundcloud: "soundcloud",
  bandcamp: "bandcamp",
  amazonMusic: "amazonmusic",
};

export function StreamingLinks({
  links,
  hideIfEmpty = false,
}: {
  links: StreamingLinksType;
  hideIfEmpty?: boolean;
}) {
  const t = useTranslations("streaming");
  const configured = getConfiguredStreamingLinks(links);

  if (!configured.length) {
    return hideIfEmpty ? null : <p className="text-sm text-text-muted">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-3" aria-label="Streaming platforms">
      {configured.map(({ platform, label, url }) => (
        <li key={platform}>
          <a href={url} target="_blank" rel="noopener noreferrer"
            aria-label={label} title={label}
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-elevated transition-colors hover:border-silver focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted">
            {logos[platform] ? (
              // Brand assets are decorative; the accessible name is on the link.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://cdn.simpleicons.org/${logos[platform]}/white`} alt="" aria-hidden="true" width={25} height={25} loading="lazy" />
            ) : <Music2 className="h-6 w-6" aria-hidden />}
          </a>
        </li>
      ))}
    </ul>
  );
}
