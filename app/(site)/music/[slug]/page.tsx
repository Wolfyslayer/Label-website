import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SpotifyEmbed } from "@/components/music/spotify-embed";
import { StreamingLinks } from "@/components/music/streaming-links";
import {
  getPublishedReleases,
  getReleaseBySlug,
  getTracksForRelease,
} from "@/lib/content";
import { siteConfig } from "@/lib/config/site";
import { formatReleaseDate } from "@/lib/utils/date";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const releases = await getPublishedReleases();
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) return { title: "Release not found" };
  return { title: release.title, description: release.description };
}

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) notFound();

  const tracks = await getTracksForRelease(release.id);
  const artists = await import("@/lib/content").then((m) => m.getPublishedArtists());
  const artist = artists.find((a) => a.id === release.artistId);

  const spotifyUrl =
    release.spotifyAlbumUrl ??
    release.streamingLinks.spotify ??
    tracks.find((t) => t.spotifyTrackUrl)?.spotifyTrackUrl;

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-16">
          <div className="relative aspect-square max-w-md lg:max-w-none">
            {release.cover.placeholder ? <PlaceholderBanner /> : null}
            <Image
              src={release.cover.src}
              alt={release.cover.alt}
              fill
              className="rounded-sm object-cover shadow-2xl ring-1 ring-border"
              priority
            />
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{release.type}</Badge>
              {artist ? (
                <Badge variant={artist.theme === "frost" ? "frost" : "wolf"}>{artist.name}</Badge>
              ) : null}
            </div>
            <h1 className="mt-4 font-display text-4xl md:text-6xl">{release.title}</h1>
            <p className="mt-2 text-sm uppercase tracking-widest text-text-muted">
              {formatReleaseDate(release.releaseDate)}
            </p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-text-secondary">
              {release.description}
            </p>
            {release.credits ? (
              <p className="mt-6 text-sm text-text-muted">
                <span className="text-text-secondary">Credits:</span> {release.credits}
              </p>
            ) : null}
            <div className="mt-8">
              <StreamingLinks links={release.streamingLinks} />
            </div>
          </div>
        </div>

        {tracks.length ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl">Tracklist</h2>
            <ol className="mt-6 divide-y divide-border-subtle rounded-sm border border-border-subtle">
              {tracks.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center justify-between gap-4 px-4 py-4 text-sm md:px-6"
                >
                  <span className="tabular-nums text-text-muted">{track.trackNumber}</span>
                  <span className="flex-1 text-text-primary">{track.title}</span>
                  {formatDuration(track.durationSeconds) ? (
                    <span className="tabular-nums text-text-muted">
                      {formatDuration(track.durationSeconds)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {spotifyUrl ? (
          <section className="mt-16 max-w-3xl">
            <h2 className="font-display text-2xl">Preview on Spotify</h2>
            <div className="mt-6">
              <SpotifyEmbed url={spotifyUrl} title={`${release.title} on Spotify`} />
            </div>
          </section>
        ) : null}
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicAlbum",
            name: release.title,
            datePublished: release.releaseDate,
            url: `${siteConfig.url}/music/${release.slug}`,
            byArtist: artist
              ? { "@type": "MusicGroup", name: artist.name }
              : undefined,
            track: tracks.map((t) => ({
              "@type": "MusicRecording",
              name: t.title,
              trackNumber: t.trackNumber,
            })),
          }),
        }}
      />
    </div>
  );
}
