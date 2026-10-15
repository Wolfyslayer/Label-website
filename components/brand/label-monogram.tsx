import { cn } from "@/lib/utils/cn";

/** Rune-inspired W monogram — inline SVG, no frame or background. */
export function LabelMonogram({
  className,
  decorative = true,
}: {
  className?: string;
  /** When true, parent should provide accessible name (e.g. link aria-label). */
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      className={cn("shrink-0 text-silver", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 25V7l11 14L27 7v18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M16 21v4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        opacity="0.45"
      />
    </svg>
  );
}
