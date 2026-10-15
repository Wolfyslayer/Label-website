"use client";

import { useTranslations } from "next-intl";

export function PlaceholderBanner({ label }: { label?: string }) {
  const t = useTranslations("common");
  return (
    <div className="absolute left-3 top-3 z-10 rounded-sm bg-void/80 px-2 py-1 text-[10px] uppercase tracking-widest text-text-muted backdrop-blur-sm">
      {label ?? t("placeholderAsset")}
    </div>
  );
}
