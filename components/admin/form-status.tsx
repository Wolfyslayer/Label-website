"use client";

import { cn } from "@/lib/utils/cn";

export function FormStatus({
  error,
  success,
  className,
}: {
  error?: string | null;
  success?: string | null;
  className?: string;
}) {
  if (!error && !success) return null;
  return (
    <div className={cn("space-y-2", className)}>
      {success ? (
        <p className="rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-text-primary" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
