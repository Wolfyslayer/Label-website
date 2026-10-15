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
    frost: "bg-frost/10 text-frost border-frost/20",
    wolf: "bg-wolf/10 text-wolf border-wolf/20",
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
