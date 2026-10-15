import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Artist } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function SpotifyArtistPanel({ artist }: { artist: Artist }) {
  const t = await getTranslations("home");
  const tArtist = await getTranslations("artist");
  const isFrost = artist.theme === "frost";

  return (
    <div
      className={cn(
        "surface-panel flex min-w-0 flex-col gap-5 p-5 sm:p-6",
        isFrost ? "ring-1 ring-frost/20" : "ring-1 ring-wolf/20",
      )}
    >
      <div>
        <h3 className="type-h3 font-display text-text-primary">{artist.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{artist.tagline}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {artist.spotifyArtistUrl ? (
          <Button href={artist.spotifyArtistUrl} external size="sm" className="min-h-11">
            {tArtist("listenSpotify")}
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </Button>
        ) : (
          <p className="text-sm text-text-muted">{t("spotifyMissing")}</p>
        )}
        <Button href={`/artists/${artist.slug}`} variant="outline" size="sm" className="min-h-11">
          {tArtist("view")}
        </Button>
        <Link
          href="/music"
          className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-silver hover:text-text-primary"
        >
          {t("catalogCta")} →
        </Link>
      </div>
    </div>
  );
}
