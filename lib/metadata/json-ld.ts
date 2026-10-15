import { absolutePublicPath } from "@/lib/metadata/alternates";
import { absoluteAssetUrl } from "@/lib/metadata/open-graph";
import { siteConfig } from "@/lib/config/site";
import type { AppLocale } from "@/i18n/routing";
import type { Artist, Release, Track } from "@/lib/types/content";

/** Independent music label — not a registered company claim. */
export function labelOrganizationJsonLd(locale: AppLocale) {
  const sameAs = [
    siteConfig.social.instagram,
    siteConfig.social.youtube,
    siteConfig.social.spotify,
    siteConfig.social.facebook,
    siteConfig.social.x,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    url: absolutePublicPath(locale, "/"),
    logo: absoluteAssetUrl("/favicon.svg"),
    description: siteConfig.description,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function musicGroupJsonLd(artist: Artist, locale: AppLocale) {
  const sameAs = [
    artist.spotifyArtistUrl,
    ...Object.values(artist.socialLinks).filter(Boolean),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    description: artist.shortBio,
    url: absolutePublicPath(locale, `/artists/${artist.slug}`),
    image: absoluteAssetUrl(artist.image.src),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function musicAlbumJsonLd(
  release: Release,
  locale: AppLocale,
  artist: Artist | undefined,
  tracks: Track[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: release.title,
    datePublished: release.releaseDate,
    url: absolutePublicPath(locale, `/music/${release.slug}`),
    image: absoluteAssetUrl(release.cover.src),
    ...(artist ? { byArtist: { "@type": "MusicGroup", name: artist.name } } : {}),
    track: tracks.map((tr) => ({
      "@type": "MusicRecording",
      name: tr.title,
      trackNumber: tr.trackNumber,
      ...(tr.durationSeconds
        ? { duration: `PT${Math.floor(tr.durationSeconds / 60)}M${tr.durationSeconds % 60}S` }
        : {}),
    })),
  };
}
