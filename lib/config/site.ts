const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Public URL including optional GitHub Pages project prefix (empty for custom domain at root). */
export const siteBasePath = rawBasePath.startsWith("/") ? rawBasePath : rawBasePath ? `/${rawBasePath}` : "";

function resolveSiteUrl() {
  if (!siteBasePath) return rawSiteUrl;
  if (rawSiteUrl.endsWith(siteBasePath)) return rawSiteUrl;
  return `${rawSiteUrl}${siteBasePath}`;
}

export const siteConfig = {
  name: "WOLFYSLAYER",
  fullName: "Wolfyslayer Records",
  tagline: "Independent music. Two voices. One label.",
  description:
    "WOLFYSLAYER RECORDS is an independent music label representing Frostmark and Wolfyslayer.",
  url: resolveSiteUrl(),
  basePath: siteBasePath,
  staticHosting: process.env.NEXT_PUBLIC_STATIC_HOSTING === "1",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  /** Public form endpoint (Formspree, etc.) for static hosting — no secrets. */
  contactFormEndpoint: process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "",
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
