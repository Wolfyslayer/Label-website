import { cn } from "@/lib/utils/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  headingLevel = 2,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Use 1 for the primary page title (one h1 per page). */
  headingLevel?: 1 | 2;
}) {
  const TitleTag = headingLevel === 1 ? "h1" : "h2";
  return (
    <div
      className={cn(
        "mb-[clamp(2rem,5vw,3.5rem)]",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-accent-muted sm:text-xs">
          {eyebrow}
        </p>
      ) : null}
      <TitleTag className="type-h2 font-display text-text-primary">{title}</TitleTag>
      {description ? (
        <p className="mt-4 max-w-2xl text-balance text-text-secondary md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
