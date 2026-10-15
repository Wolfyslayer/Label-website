"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { setLocale } from "@/lib/i18n/actions";
import { locales, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="site-language" className="sr-only">
        {messages.lang.label}
      </label>
      <select
        id="site-language"
        value={locale}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="min-h-11 min-w-[7.5rem] cursor-pointer rounded-sm border border-border bg-charcoal/80 px-3 py-2 text-xs uppercase tracking-wider text-text-secondary transition-colors hover:border-frost/40 hover:text-text-primary focus:border-silver disabled:opacity-60"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {messages.lang[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
