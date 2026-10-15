"use client";

import { routing, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

export function LanguageSelector({ className }: { className?: string }) {
  const t = useTranslations("lang");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function onChange(next: AppLocale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="site-language" className="sr-only">
        {t("label")}
      </label>
      <select
        id="site-language"
        value={locale}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as AppLocale)}
        className="min-h-11 min-w-[7.5rem] cursor-pointer rounded-sm border border-border bg-charcoal/80 px-3 py-2 text-xs uppercase tracking-wider text-text-secondary transition-colors hover:border-frost/40 hover:text-text-primary focus:border-silver disabled:opacity-60"
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </div>
  );
}
