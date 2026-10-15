import { artistMediaPaths } from "@/lib/assets/artist-media";
import type { LocalizedString, SiteContentSource } from "@/lib/types/content";

const L = (en: string, sv: string): LocalizedString => ({ en, sv });

/**
 * PLACEHOLDER SEED DATA — editorial fields are localized (en/sv).
 * Official artist, release and track names are not translated.
 */
export const seedContent: SiteContentSource = {
  label: {
    story: L(
      "Wolfyslayer Records is an independent music label built around two distinct artists: Frostmark and Wolfyslayer. We focus on careful curation, intentional release schedules, and giving each artist room to develop their own visual and sonic identity.",
      "Wolfyslayer Records är ett independentbolag byggt kring två distinkta artister: Frostmark och Wolfyslayer. Vi fokuserar på noggrann kurering, genomtänkta releaseplaner och att ge varje artist utrymme att utveckla sin visuella och musikaliska identitet.",
    ),
    mission: L(
      "To release music we believe in, support our artists with clarity and respect, and present their work with the same care we bring to the studio.",
      "Att släppa musik vi tror på, stödja våra artister med tydlighet och respekt, och presentera deras arbete med samma omsorg som vi bär med oss från studion.",
    ),
  },
  featuredReleaseId: "release-frostmark-placeholder-01",
  homepageFeaturedNewsIds: ["news-welcome"],
  artists: [
    {
      id: "artist-frostmark",
      slug: "frostmark",
      name: "Frostmark",
      tagline: L(
        "Nordic atmosphere. Folk roots. Songs that linger.",
        "Nordisk atmosfär. Folkliga rötter. Sånger som stannar kvar.",
      ),
      shortBio: L(
        "Frostmark creates Swedish Viking-inspired and Nordic folk music — atmospheric soundscapes and socially reflective songwriting rooted in northern tradition.",
        "Frostmark skapar svensk vikingainspirerad och nordisk folkmusik — atmosfäriska ljudlandskap och samhällsreflekterande sånger med rötter i nordisk tradition.",
      ),
      longBio: L(
        "Frostmark creates Swedish Viking-inspired and Nordic folk music, weaving atmospheric textures with folk instrumentation and lyrics that reflect on society, heritage, and the inner landscape of the north.\n\n[Placeholder — replace with approved artist biography.]",
        "Frostmark skapar svensk vikingainspirerad och nordisk folkmusik, med atmosfäriska texturer, folkinstrument och texter som reflekterar kring samhälle, arv och det inre landskapet i norr.\n\n[Platshållare — ersätt med godkänd artistbiografi.]",
      ),
      theme: "frost",
      image: {
        src: artistMediaPaths.frostmark.portrait,
        alt: L(
          "Frostmark — official artist profile photo",
          "Frostmark — officiellt artistfoto",
        ),
        placeholder: false,
      },
      heroImage: {
        src: artistMediaPaths.frostmark.hero,
        alt: L(
          "Frostmark — artist hero image",
          "Frostmark — hero-bild",
        ),
        placeholder: false,
      },
      featuredReleaseIds: ["release-frostmark-placeholder-01"],
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
      tagline: L(
        "Artist on Wolfyslayer Records",
        "Artist på Wolfyslayer Records",
      ),
      shortBio: L(
        "[Placeholder — add approved short biography for Wolfyslayer.]",
        "[Platshållare — lägg till godkänd kort biografi för Wolfyslayer.]",
      ),
      longBio: L(
        "[Placeholder — add approved long biography for Wolfyslayer. Do not publish invented genre or background details.]",
        "[Platshållare — lägg till godkänd lång biografi för Wolfyslayer. Publicera inte påhittad genre eller bakgrund.]",
      ),
      theme: "wolf",
      image: {
        src: artistMediaPaths.wolfyslayer.portrait,
        alt: L(
          "Wolfyslayer — official artist profile photo",
          "Wolfyslayer — officiellt artistfoto",
        ),
        placeholder: false,
      },
      heroImage: {
        src: artistMediaPaths.wolfyslayer.hero,
        alt: L(
          "Wolfyslayer — artist hero image",
          "Wolfyslayer — hero-bild",
        ),
        placeholder: false,
      },
      featuredReleaseIds: ["release-wolfyslayer-upcoming-01"],
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
      description: L(
        "Placeholder release entry. Replace with official title, artwork, date, and streaming links when confirmed.",
        "Platshållare för release. Ersätt med officiell titel, artwork, datum och streaminglänkar när det är bekräftat.",
      ),
      cover: {
        src: "/placeholders/cover-frost.svg",
        alt: L(
          "Placeholder cover artwork — Frostmark",
          "Platshållare för omslag — Frostmark",
        ),
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
      description: L(
        "Scheduled placeholder for an upcoming Wolfyslayer release. Configure pre-save URL in admin when available.",
        "Schemalagd platshållare för en kommande Wolfyslayer-release. Konfigurera pre-save-länk i admin när den finns.",
      ),
      cover: {
        src: "/placeholders/cover-wolf.svg",
        alt: L(
          "Placeholder cover artwork — Wolfyslayer",
          "Platshållare för omslag — Wolfyslayer",
        ),
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
      title: L(
        "Welcome to Wolfyslayer Records",
        "Välkommen till Wolfyslayer Records",
      ),
      excerpt: L(
        "Our new official home for Frostmark, Wolfyslayer, and label news.",
        "Vårt nya officiella hem för Frostmark, Wolfyslayer och nyheter från bolaget.",
      ),
      body: L(
        "This site is the official digital home of Wolfyslayer Records. Here you will find music, news, and updates for Frostmark and Wolfyslayer.\n\n[Placeholder announcement — replace with your first official post.]",
        "Den här webbplatsen är Wolfyslayer Records officiella digitala hem. Här hittar du musik, nyheter och uppdateringar för Frostmark och Wolfyslayer.\n\n[Platshållare — ersätt med ert första officiella inlägg.]",
      ),
      publishedAt: "2026-10-01T10:00:00.000Z",
      artistId: "artist-frostmark",
      cover: {
        src: "/placeholders/news-default.svg",
        alt: L(
          "Wolfyslayer Records — placeholder news image",
          "Wolfyslayer Records — platshållare för nyhetsbild",
        ),
        placeholder: true,
      },
      status: "published",
    },
  ],
  pressAssets: [
    {
      id: "press-logo-label",
      title: L("Wolfyslayer Records — Logo (PNG)", "Wolfyslayer Records — logotyp (PNG)"),
      type: "logo",
      src: "/placeholders/logo-wolfyslayer.svg",
      alt: L(
        "Wolfyslayer Records logo placeholder",
        "Platshållare för Wolfyslayer Records logotyp",
      ),
      placeholder: true,
    },
    {
      id: "press-photo-frostmark",
      title: L("Frostmark — Press Photo", "Frostmark — pressbild"),
      type: "photo",
      artistId: "artist-frostmark",
      src: artistMediaPaths.frostmark.portrait,
      alt: L("Frostmark press photo placeholder", "Platshållare för Frostmark pressbild"),
      placeholder: true,
    },
    {
      id: "press-photo-wolfyslayer",
      title: L("Wolfyslayer — Press Photo", "Wolfyslayer — pressbild"),
      type: "photo",
      artistId: "artist-wolfyslayer",
      src: artistMediaPaths.wolfyslayer.portrait,
      alt: L("Wolfyslayer press photo placeholder", "Platshållare för Wolfyslayer pressbild"),
      placeholder: true,
    },
  ],
};
