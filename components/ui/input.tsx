import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  label,
  error,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-muted focus:outline-none focus:ring-1 focus:ring-accent-muted/50",
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
