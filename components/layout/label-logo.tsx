import { LabelMonogram } from "@/components/brand/label-monogram";
import { siteConfig } from "@/lib/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function LabelLogo({
  className,
  compact,
  variant = "header",
}: {
  className?: string;
  compact?: boolean;
  /** header: default nav; footer: slightly larger wordmark */
  variant?: "header" | "footer";
}) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-w-0 items-center gap-2.5 focus-visible:outline-offset-4 sm:gap-3",
        className,
      )}
      aria-label={`${siteConfig.fullName} home`}
    >
      <LabelMonogram
        className={cn(
          "h-9 w-9 transition-colors group-hover:text-text-primary sm:h-10 sm:w-10",
          compact && "h-8 w-8 sm:h-9 sm:w-9",
          isFooter && "h-10 w-10 sm:h-11 sm:w-11",
        )}
      />
      <span className="flex min-w-0 flex-col justify-center leading-none">
        <span
          className={cn(
            "font-display text-text-primary transition-colors group-hover:text-silver",
            isFooter
              ? "text-xs tracking-[0.2em] sm:text-sm"
              : compact
                ? "text-[10px] tracking-[0.18em] sm:text-xs"
                : "text-[11px] tracking-[0.18em] sm:text-xs md:text-sm",
          )}
        >
          {siteConfig.name}
        </span>
        <span
          className={cn(
            "mt-0.5 font-display uppercase text-text-muted transition-colors group-hover:text-accent-muted",
            isFooter
              ? "text-[10px] tracking-[0.34em] sm:text-[11px]"
              : compact
                ? "text-[8px] tracking-[0.3em] sm:text-[9px]"
                : "text-[9px] tracking-[0.32em] sm:text-[10px]",
          )}
        >
          RECORDS
        </span>
      </span>
    </Link>
  );
}
