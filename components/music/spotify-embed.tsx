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
  const embed =
    spotifyEmbedUrl(url) ?? spotifyArtistEmbedUrl(url);

  if (!embed) return null;

  return (
    <div className={cn("overflow-hidden rounded-sm ring-1 ring-border-subtle", className)}>
      <iframe
        style={{ borderRadius: 12 }}
        src={embed}
        width="100%"
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={title}
      />
      <p className="mt-2 text-xs text-text-muted">
        Listening via Spotify embed. Opens in Spotify for full playback where required.
      </p>
    </div>
  );
}
