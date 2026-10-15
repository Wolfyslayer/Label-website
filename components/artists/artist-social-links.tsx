"use client";

import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { Facebook, Instagram, Music2, Youtube, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const iconMap: Record<string, LucideIcon | null> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  x: null,
  tiktok: null,
};

export function ArtistSocialLinks({ artist, className }: { artist: Artist; className?: string }) {
  const t = useTranslations("artist");
  const entries = Object.entries(artist.socialLinks).filter(([, url]) => url?.trim());

  if (!entries.length) return null;

  return (
    <div className={className}>
      <h2 className="text-xs uppercase tracking-widest text-text-muted">{t("social")}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map(([key, url]) => {
          const Icon = iconMap[key] ?? Music2;
          return (
            <li key={key}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border",
                  "text-text-secondary transition-colors hover:border-accent-muted hover:text-text-primary",
                )}
                aria-label={key}
              >
                {iconMap[key] === null ? (
                  <span className="text-xs font-semibold uppercase">{key.slice(0, 2)}</span>
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
