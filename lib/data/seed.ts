import { artistMediaPaths } from "@/lib/assets/artist-media";
import type { SiteContent } from "@/lib/types/content";

/**
 * PLACEHOLDER SEED DATA
 * Replace artwork, bios, releases, and news with official content via the admin dashboard
 * or by editing this file before Supabase is configured.
 */
export const seedContent: SiteContent = {
  label: {
    story:
      "WOLFYSLAYER RECORDS is an independent music label built around two distinct artists: Frostmark and Wolfyslayer. We focus on careful curation, intentional release schedules, and giving each artist room to develop their own visual and sonic identity.",
    mission:
      "To release music we believe in, support our artists with clarity and respect, and present their work with the same care we bring to the studio.",
  },
  featuredReleaseId: "release-frostmark-placeholder-01",
  homepageFeaturedNewsIds: ["news-welcome"],
  artists: [
    {
      id: "artist-frostmark",
      slug: "frostmark",
      name: "Frostmark",
      tagline: "Nordic atmosphere. Folk roots. Songs that linger.",
      shortBio:
        "Frostmark creates Swedish Viking-inspired and Nordic folk music — atmospheric soundscapes and socially reflective songwriting rooted in northern tradition.",
      longBio:
        "Frostmark creates Swedish Viking-inspired and Nordic folk music, weaving atmospheric textures with folk instrumentation and lyrics that reflect on society, heritage, and the inner landscape of the north.\n\n[Placeholder — replace with approved artist biography.]",
      theme: "frost",
      image: {
        src: artistMediaPaths.frostmark.portrait,
        alt: artistMediaPaths.frostmark.portraitAlt,
        placeholder: true,
      },
      heroImage: {
        src: artistMediaPaths.frostmark.hero,
        alt: artistMediaPaths.frostmark.heroAlt,
        placeholder: true,
      },
      spotifyArtistUrl: "https://open.spotify.com/artist/0edDVF0bL7PFu2Sc3ijDrP",
      streamingLinks: {
        spotify: "https://open.spotify.com/artist/0edDVF0bL7PFu2Sc3ijDrP",
      },
      socialLinks: {},
      featuredTrackIds: ["track-frostmark-01"],
      status: "published",
    },
    {
      id: "artist-wolfyslayer",
      slug: "wolfyslayer",
      name: "Wolfyslayer",
      tagline: "Artist on Wolfyslayer Records",
      shortBio:
        "[Placeholder — add approved short biography for Wolfyslayer.]",
      longBio:
        "[Placeholder — add approved long biography for Wolfyslayer. Do not publish invented genre or background details.]",
      theme: "wolf",
      image: {
        src: artistMediaPaths.wolfyslayer.portrait,
        alt: artistMediaPaths.wolfyslayer.portraitAlt,
        placeholder: true,
      },
      heroImage: {
        src: artistMediaPaths.wolfyslayer.hero,
        alt: artistMediaPaths.wolfyslayer.heroAlt,
        placeholder: true,
      },
      spotifyArtistUrl: "https://open.spotify.com/artist/4B4kHkS5D9gK6Q3lNbDPml",
      streamingLinks: {
        spotify: "https://open.spotify.com/artist/4B4kHkS5D9gK6Q3lNbDPml",
      },
      socialLinks: {},
      featuredTrackIds: [],
      status: "published",
    },
  ],
  releases: [
    {
      id: "release-frostmark-placeholder-01",
      slug: "frostmark-placeholder-release",
      title: "[Placeholder Release Title]",
      artistId: "artist-frostmark",
      type: "single",
      releaseDate: "2025-06-01",
      releaseAt: "2025-06-01T12:00:00.000Z",
      description:
        "Placeholder release entry. Replace with official title, artwork, date, and streaming links when confirmed.",
      cover: {
        src: "/placeholders/cover-frost.svg",
        alt: "Placeholder cover artwork — Frostmark",
        placeholder: true,
      },
      streamingLinks: {},
      trackIds: ["track-frostmark-01"],
      featured: true,
      status: "published",
    },
    {
      id: "release-wolfyslayer-upcoming-01",
      slug: "wolfyslayer-upcoming-placeholder",
      title: "[Upcoming — Placeholder Title]",
      artistId: "artist-wolfyslayer",
      type: "single",
      releaseDate: "2026-11-20",
      releaseAt: "2026-11-20T00:00:00.000Z",
      description:
        "Scheduled placeholder for an upcoming Wolfyslayer release. Configure pre-save URL in admin when available.",
      cover: {
        src: "/placeholders/cover-wolf.svg",
        alt: "Placeholder cover artwork — Wolfyslayer",
        placeholder: true,
      },
      streamingLinks: {},
      trackIds: [],
      featured: false,
      status: "published",
    },
  ],
  tracks: [
    {
      id: "track-frostmark-01",
      slug: "placeholder-track",
      title: "[Placeholder Track Title]",
      artistId: "artist-frostmark",
      releaseId: "release-frostmark-placeholder-01",
      trackNumber: 1,
    },
  ],
  news: [
    {
      id: "news-welcome",
      slug: "welcome-to-wolfyslayer-records",
      title: "Welcome to WOLFYSLAYER RECORDS",
      excerpt:
        "Our new official home for Frostmark, Wolfyslayer, and label news.",
      body:
        "This site is the official digital home of WOLFYSLAYER RECORDS. Here you will find music, news, and updates for Frostmark and Wolfyslayer.\n\n[Placeholder announcement — replace with your first official post.]",
      publishedAt: "2026-10-01T10:00:00.000Z",
      cover: {
        src: "/placeholders/news-default.svg",
        alt: "WOLFYSLAYER RECORDS — placeholder news image",
        placeholder: true,
      },
      status: "published",
    },
  ],
  pressAssets: [
    {
      id: "press-logo-label",
      title: "WOLFYSLAYER RECORDS — Logo (PNG)",
      type: "logo",
      src: "/placeholders/logo-wolfyslayer.svg",
      alt: "WOLFYSLAYER RECORDS logo placeholder",
      placeholder: true,
    },
    {
      id: "press-photo-frostmark",
      title: "Frostmark — Press Photo",
      type: "photo",
      artistId: "artist-frostmark",
      src: artistMediaPaths.frostmark.portrait,
      alt: "Frostmark press photo placeholder",
      placeholder: true,
    },
    {
      id: "press-photo-wolfyslayer",
      title: "Wolfyslayer — Press Photo",
      type: "photo",
      artistId: "artist-wolfyslayer",
      src: artistMediaPaths.wolfyslayer.portrait,
      alt: "Wolfyslayer press photo placeholder",
      placeholder: true,
    },
  ],
};
