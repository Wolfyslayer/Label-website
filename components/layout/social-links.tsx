import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { Instagram, Music2, Youtube } from "lucide-react";

const icons = {
  instagram: Instagram,
  youtube: Youtube,
  spotify: Music2,
};

export function SocialLinks({ className }: { className?: string }) {
  const entries = Object.entries(siteConfig.social).filter(
    ([, url]) => url && url.trim().length > 0,
  );

  if (!entries.length) {
    return (
      <p className={cn("text-xs text-text-muted", className)}>
        Social links available when configured in environment variables.
      </p>
    );
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-text-secondary transition-colors hover:border-accent-muted hover:text-text-primary"
              aria-label={key}
            >
              <Icon className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
