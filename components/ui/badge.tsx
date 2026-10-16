import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "frost" | "wolf" | "outline";
  className?: string;
}) {
  const styles = {
    default: "bg-surface-elevated text-text-secondary border-border",
    frost: "bg-frost/20 text-silver border-silver/45",
    wolf: "bg-wolf/20 text-[#e4c99d] border-[#b99b70]/55",
    outline: "bg-transparent text-text-muted border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
