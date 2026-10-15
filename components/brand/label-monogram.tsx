import { siteBrandPaths } from "@/lib/assets/site-brand";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

/** Official transparent WR rune monogram from `public/assets/brand/`. */
export function LabelMonogram({
  className,
  decorative = true,
}: {
  className?: string;
  /** When true, parent should provide accessible name (e.g. link aria-label). */
  decorative?: boolean;
}) {
  return (
    <Image
      src={siteBrandPaths.wrRuneMonogram}
      alt={decorative ? "" : "Wolfyslayer Records"}
      aria-hidden={decorative ? true : undefined}
      width={32}
      height={32}
      unoptimized
      className={cn(
        "shrink-0 object-contain transition-[filter,opacity] duration-300 group-hover:brightness-110",
        className,
      )}
    />
  );
}
