"use client";

import { getCountdownParts } from "@/lib/utils/date";
import { useEffect, useState } from "react";

export function ReleaseCountdown({ releaseAt }: { releaseAt: string }) {
  const [parts, setParts] = useState(() => getCountdownParts(releaseAt));

  useEffect(() => {
    const id = setInterval(() => {
      setParts(getCountdownParts(releaseAt));
    }, 1000);
    return () => clearInterval(id);
  }, [releaseAt]);

  if (parts.totalMs <= 0) {
    return (
      <p className="text-sm uppercase tracking-widest text-success">Out now</p>
    );
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div
      className="flex gap-3 sm:gap-4"
      role="timer"
      aria-live="polite"
      aria-label="Release countdown"
    >
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
