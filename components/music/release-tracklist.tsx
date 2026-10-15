import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Track } from "@/lib/types/content";

function formatDuration(seconds?: number) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function ReleaseTracklist({ tracks }: { tracks: Track[] }) {
  const t = await getTranslations("releasePage");

  return (
    <ol className="surface-panel divide-y divide-border-subtle">
      {tracks.map((track) => {
        const duration = formatDuration(track.durationSeconds);
        const spotify = track.spotifyTrackUrl?.trim();
        return (
          <li
            key={track.id}
            className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm sm:gap-4 sm:px-5 sm:py-3.5 md:min-h-14 md:px-6"
          >
            <span className="w-7 shrink-0 tabular-nums text-text-muted sm:w-8">{track.trackNumber}</span>
            <span className="min-w-0 flex-1 font-medium text-text-primary">{track.title}</span>
            {duration ? (
              <span className="hidden shrink-0 tabular-nums text-xs text-text-muted sm:inline sm:text-sm">
                {duration}
              </span>
            ) : null}
            {spotify ? (
              <a
                href={spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm text-silver transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-muted"
                aria-label={t("openTrackSpotify", { title: track.title })}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {duration ? (
              <span className="shrink-0 tabular-nums text-xs text-text-muted sm:hidden">{duration}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
