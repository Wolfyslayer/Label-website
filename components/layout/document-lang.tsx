"use client";

import { useEffect } from "react";

/** Updates `<html lang>` for static export (no request locale in root layout). */
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
