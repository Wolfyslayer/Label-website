export type Messages = {
  nav: {
    artists: string;
    music: string;
    upcoming: string;
    news: string;
    about: string;
    contact: string;
    listen: string;
    exploreMusic: string;
    openMenu: string;
    closeMenu: string;
    primary: string;
    mobilePrimary: string;
  };
  lang: {
    label: string;
    en: string;
    sv: string;
  };
  footer: {
    explore: string;
    contact: string;
    general: string;
    press: string;
    emailEnv: string;
    rights: string;
    tagline: string;
  };
  home: {
    heroTagline: string;
    latestMusic: string;
    meetArtists: string;
    rosterEyebrow: string;
    rosterTitle: string;
    rosterDesc: string;
    catalogEyebrow: string;
    catalogTitle: string;
    catalogCta: string;
    listenEyebrow: string;
    listenTitle: string;
    listenDesc: string;
    scheduleEyebrow: string;
    scheduleTitle: string;
    scheduleCta: string;
    newsEyebrow: string;
    newsTitle: string;
    newsCta: string;
    connectTitle: string;
    connectDesc: string;
    noReleases: string;
    spotifyMissing: string;
  };
  artist: {
    view: string;
    badge: string;
  };
  a11y: {
    skip: string;
  };
};

export const en: Messages = {
  nav: {
    artists: "Artists",
    music: "Music",
    upcoming: "Upcoming",
    news: "News",
    about: "About",
    contact: "Contact",
    listen: "Listen",
    exploreMusic: "Explore music",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primary: "Primary navigation",
    mobilePrimary: "Mobile navigation",
  },
  lang: {
    label: "Language",
    en: "English",
    sv: "Svenska",
  },
  footer: {
    explore: "Explore",
    contact: "Contact",
    general: "General inquiries",
    press: "Press & media",
    emailEnv: "Email configured via environment",
    rights: "All rights reserved.",
    tagline: "Independent label · Frostmark · Wolfyslayer",
  },
  home: {
    heroTagline:
      "Independent music. Two voices. One label. Cinematic releases from Frostmark and Wolfyslayer.",
    latestMusic: "Latest music",
    meetArtists: "Meet the artists",
    rosterEyebrow: "Roster",
    rosterTitle: "Artist spotlight",
    rosterDesc: "Two distinct voices under one independent label.",
    catalogEyebrow: "Catalog",
    catalogTitle: "Latest releases",
    catalogCta: "Full catalog",
    listenEyebrow: "Listen",
    listenTitle: "On Spotify",
    listenDesc:
      "Follow Frostmark and Wolfyslayer on Spotify. Embeds play through Spotify's official player.",
    scheduleEyebrow: "Schedule",
    scheduleTitle: "Upcoming releases",
    scheduleCta: "View all",
    newsEyebrow: "News",
    newsTitle: "Latest updates",
    newsCta: "All news",
    connectTitle: "Stay connected",
    connectDesc: "Follow Wolfyslayer Records and our artists on your preferred platforms.",
    noReleases: "Releases will appear here once published.",
    spotifyMissing: "Spotify URL not configured.",
  },
  artist: {
    view: "View artist",
    badge: "Artist",
  },
  a11y: {
    skip: "Skip to content",
  },
};
