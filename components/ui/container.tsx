import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[var(--container-max)]",
        "px-[max(clamp(1rem,3vw,2rem),env(safe-area-inset-left))]",
        className,
      )}
      style={{
        paddingRight: "max(clamp(1rem, 3vw, 2rem), env(safe-area-inset-right))",
      }}
    >
      {children}
    </Tag>
  );
}
