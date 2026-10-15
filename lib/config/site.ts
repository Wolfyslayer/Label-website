export const siteConfig = {
  name: "WOLFYSLAYER",
  fullName: "WOLFYSLAYER RECORDS",
  tagline: "Independent music. Two voices. One label.",
  description:
    "WOLFYSLAYER RECORDS is an independent music label representing Frostmark and Wolfyslayer.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "",
    spotify: process.env.NEXT_PUBLIC_SOCIAL_SPOTIFY ?? "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "",
    x: process.env.NEXT_PUBLIC_SOCIAL_X ?? "",
  },
  pressEmail: process.env.NEXT_PUBLIC_PRESS_EMAIL ?? "",
} as const;

export type SiteConfig = typeof siteConfig;
