"use client";

import type { PublicSocialLinks } from "@/lib/content/site-settings";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  spotify: Music2,
};

export function SocialLinks({
  className,
  links,
}: {
  className?: string;
  links?: PublicSocialLinks;
}) {
  const t = useTranslations("footer");
  const social = links ?? siteConfig.social;
  const entries = Object.entries(social).filter(
    ([, url]) => url && url.trim().length > 0,
  );

  function socialLabel(key: string) {
    try {
      return t(`socialAria.${key}` as "socialAria.instagram");
    } catch {
      return `${key} (opens in new tab)`;
    }
  }

  if (!entries.length) {
    return null;
  }

  return (
    <ul className={cn("flex flex-wrap gap-3", className)}>
      {entries.map(([key, url]) => {
        const Icon = icons[key as keyof typeof icons] ?? Music2;
        return (
          <li key={key}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-text-secondary transition-colors hover:border-accent-muted hover:text-text-primary"
              aria-label={socialLabel(key)}
            >
              <Icon className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
