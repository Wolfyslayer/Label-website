import { siteConfig } from "@/lib/config/site";

export function getPublicContactEmail(): string {
  return siteConfig.contactEmail.trim();
}

export function getPublicPressEmail(): string {
  const press = siteConfig.pressEmail.trim();
  if (press) return press;
  return getPublicContactEmail();
}

export function isContactFormEnabled(): boolean {
  return Boolean(siteConfig.contactFormEndpoint.trim());
}

export function hasAnyPublicSocialLink(
  links: Record<string, string | undefined> = siteConfig.social,
): boolean {
  return Object.values(links).some((url) => Boolean(url?.trim()));
}
