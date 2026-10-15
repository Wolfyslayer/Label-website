import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  label,
  error,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm text-text-secondary">
        {label}
      </label>
      <textarea
        id={inputId}
        className={cn(
          "min-h-[140px] w-full resize-y rounded-sm border border-border bg-charcoal px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-muted focus:outline-none focus:ring-1 focus:ring-accent-muted/50",
          error && "border-danger",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
