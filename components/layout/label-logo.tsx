import { artistMediaPaths } from "@/lib/assets/artist-media";
import { siteConfig } from "@/lib/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

export function LabelLogo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3 focus-visible:outline-offset-4", className)}
      aria-label={`${siteConfig.fullName} home`}
    >
      <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-sm ring-1 ring-border-subtle sm:h-10 sm:w-10">
        <Image
          src={artistMediaPaths.labelLogo}
          alt=""
          fill
          className="object-contain p-1"
          sizes="40px"
          priority
        />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display tracking-[0.22em] text-text-primary transition-colors group-hover:text-silver",
            compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm",
          )}
        >
          {siteConfig.name}
        </span>
        {!compact ? (
          <span className="mt-1 hidden text-[9px] uppercase tracking-[0.35em] text-text-muted sm:block">
            Records
          </span>
        ) : null}
      </span>
    </Link>
  );
}
