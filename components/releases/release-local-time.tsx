"use client";

import { useEffect, useState } from "react";

export function ReleaseLocalTime({
  releaseAt,
  locale,
  label,
}: {
  releaseAt: string;
  locale: string;
  label: string;
}) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const text = new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: tz,
      }).format(new Date(releaseAt));
      setFormatted(`${text} (${tz})`);
    } catch {
      setFormatted(null);
    }
  }, [releaseAt, locale]);

  if (!formatted) return null;

  return (
    <p className="text-xs text-text-muted">
      <span className="text-text-secondary">{label}:</span> {formatted}
    </p>
  );
}
