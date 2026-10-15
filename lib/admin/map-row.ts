import { localizedFromDb } from "@/lib/admin/i18n-form";
import type { LocalizedString } from "@/lib/types/content";

export function rowLocalized(
  i18n: LocalizedString | null | undefined,
  legacy: string | null | undefined,
) {
  return localizedFromDb(i18n ?? undefined, legacy ?? undefined);
}

export function parseImageField(raw: unknown) {
  const v = raw as { src?: string; alt?: LocalizedString | string; placeholder?: boolean } | null;
  const alt =
    typeof v?.alt === "string"
      ? { en: v.alt, sv: "" }
      : rowLocalized(v?.alt as LocalizedString, "");
  return {
    src: v?.src ?? "",
    alt,
    placeholder: Boolean(v?.placeholder),
  };
}
