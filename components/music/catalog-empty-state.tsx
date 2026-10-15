"use client";

import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CatalogEmptyState({ variant }: { variant: "filters" | "catalog" }) {
  const t = useTranslations("musicPage");

  return (
    <div
      className="mt-12 flex flex-col items-center rounded-sm border border-dashed border-border-subtle bg-surface/20 px-6 py-16 text-center"
      role="status"
    >
      <Music2 className="h-10 w-10 text-text-muted" aria-hidden />
      <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
        {variant === "filters" ? t("emptyFilters") : t("emptyCatalog")}
      </p>
      {variant === "catalog" ? (
        <Button href="/upcoming" variant="outline" className="mt-6 min-h-11">
          {t("viewUpcoming")}
        </Button>
      ) : null}
    </div>
  );
}
