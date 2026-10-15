"use client";

import { getCountdownParts } from "@/lib/utils/date";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ReleaseCountdown({ releaseAt }: { releaseAt: string }) {
  const t = useTranslations("countdown");
  const tUp = useTranslations("upcomingPage");
  const [parts, setParts] = useState(() => getCountdownParts(releaseAt));

  useEffect(() => {
    const id = setInterval(() => {
      setParts(getCountdownParts(releaseAt));
    }, 1000);
    return () => clearInterval(id);
  }, [releaseAt]);

  if (parts.totalMs <= 0) {
    return <p className="text-sm uppercase tracking-widest text-success">{tUp("outNow")}</p>;
  }

  const cells = [
    { label: t("days"), value: parts.days },
    { label: t("hours"), value: parts.hours },
    { label: t("minutes"), value: parts.minutes },
    { label: t("seconds"), value: parts.seconds },
  ];

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4" role="timer" aria-live="polite" aria-label={t("aria")}>
      {cells.map(({ label, value }) => (
        <div
          key={label}
          className="min-w-[4.5rem] rounded-sm border border-border bg-charcoal/80 px-3 py-2 text-center backdrop-blur-sm"
        >
          <div className="font-display text-2xl tabular-nums text-text-primary sm:text-3xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
        </div>
      ))}
    </div>
  );
}
