import { cn } from "@/lib/utils/cn";
import { spotifyArtistEmbedUrl, spotifyEmbedUrl } from "@/lib/utils/streaming";

export function SpotifyEmbed({
  url,
  title,
  className,
  height = 352,
}: {
  url: string;
  title: string;
  className?: string;
  height?: number;
}) {
  const embed = spotifyEmbedUrl(url) ?? spotifyArtistEmbedUrl(url);

  if (!embed) return null;

  const isArtist = embed.includes("/artist/");

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-hidden rounded-sm ring-1 ring-border-subtle",
        isArtist ? "min-h-[min(380px,70dvh)]" : "min-h-[min(352px,55dvh)]",
        className,
      )}
    >
      <iframe
        style={{ borderRadius: 8, maxWidth: "100%" }}
        src={embed}
        width="100%"
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title}
        className="h-[min(380px,70dvh)] w-full sm:h-[352px]"
      />
      <p className="mt-2 px-0.5 text-xs leading-relaxed text-text-muted">
        Listening via Spotify embed. Opens in Spotify for full playback where required.
      </p>
    </div>
  );
}
