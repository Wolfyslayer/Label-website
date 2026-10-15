import type { LocalizedFormValue } from "@/lib/admin/types";
import type { LocalizedString } from "@/lib/types/content";

export type { LocalizedFormValue };

export function readLocalizedField(formData: FormData, name: string): LocalizedFormValue {
  return {
    en: String(formData.get(`${name}_en`) ?? "").trim(),
    sv: String(formData.get(`${name}_sv`) ?? "").trim(),
  };
}

export function toLocalizedString(value: LocalizedFormValue): LocalizedString {
  return {
    en: value.en,
    sv: value.sv || undefined,
  };
}

export function localizedFromDb(
  i18n: LocalizedString | null | undefined,
  legacy: string | null | undefined,
): LocalizedFormValue {
  if (i18n && (i18n.en || i18n.sv)) {
    return { en: i18n.en ?? "", sv: i18n.sv ?? "" };
  }
  const text = legacy ?? "";
  return { en: text, sv: "" };
}

export function missingLocaleLabels(value: LocalizedFormValue): ("en" | "sv")[] {
  const missing: ("en" | "sv")[] = [];
  if (!value.en.trim()) missing.push("en");
  if (!value.sv.trim()) missing.push("sv");
  return missing;
}

export function imageAltFromForm(formData: FormData, prefix: string): LocalizedString {
  return toLocalizedString(readLocalizedField(formData, `${prefix}_alt`));
}
