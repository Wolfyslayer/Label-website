export function formatReleaseDate(
  isoDate: string,
  locale = "en-US",
  precision?: "year" | "month" | "day",
): string {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (precision === "year") {
    return d.toLocaleDateString(locale, { year: "numeric" });
  }
  if (precision === "month") {
    return d.toLocaleDateString(locale, { year: "numeric", month: "long" });
  }
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNewsDate(iso: string, locale = "en-US"): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Full date + time in UTC (for stored release timestamps). */
export function formatReleaseTimestampUtc(iso: string, locale = "en-US"): string {
  return `${new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso))} UTC`;
}

export function getCountdownParts(targetIso: string, now = new Date()) {
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now.getTime());
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs, totalMs: diff };
}
