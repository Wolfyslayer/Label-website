"use client";

import { missingLocaleLabels } from "@/lib/admin/i18n-form";
import type { LocalizedFormValue } from "@/lib/admin/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  value: LocalizedFormValue;
  multiline?: boolean;
  requiredEn?: boolean;
};

export function LocalizedFieldGroup({ label, name, value, multiline, requiredEn }: Props) {
  const missing = missingLocaleLabels(value);
  const Field = multiline ? Textarea : Input;

  return (
    <fieldset className="space-y-3 rounded-sm border border-border-subtle p-4">
      <legend className="px-1 text-sm font-medium text-text-primary">{label}</legend>
      <div className="flex flex-wrap gap-2 text-xs">
        {(["en", "sv"] as const).map((locale) => (
          <span
            key={locale}
            className={cn(
              "rounded-sm px-2 py-0.5 uppercase tracking-widest",
              missing.includes(locale)
                ? "bg-danger/15 text-danger"
                : "bg-success/10 text-success",
            )}
          >
            {locale}: {missing.includes(locale) ? "missing" : "ok"}
          </span>
        ))}
      </div>
      <Field
        label="English"
        name={`${name}_en`}
        defaultValue={value.en}
        required={requiredEn}
      />
      <Field label="Svenska" name={`${name}_sv`} defaultValue={value.sv} />
    </fieldset>
  );
}
