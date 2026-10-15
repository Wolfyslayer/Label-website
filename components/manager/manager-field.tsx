import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function ManagerField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const managerInputClass =
  "min-h-11 w-full rounded-sm border border-border bg-charcoal/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-silver focus:outline-none";

export const managerTextareaClass =
  "min-h-[6rem] w-full rounded-sm border border-border bg-charcoal/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-silver focus:outline-none";
