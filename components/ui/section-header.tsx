import { cn } from "@/lib/utils/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
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
      <h2 className="type-h2 font-display text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-balance text-text-secondary md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
