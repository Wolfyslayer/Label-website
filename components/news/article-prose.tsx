import type { ReactNode } from "react";

/** Editorial article body — serif, comfortable measure, mobile-first line height. */
export function ArticleProse({ children }: { children: ReactNode }) {
  return (
    <div className="editorial-prose mt-10 max-w-none whitespace-pre-line text-[length:var(--text-body)] text-text-secondary">
      {children}
    </div>
  );
}
