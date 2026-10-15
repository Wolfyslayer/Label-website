import { OFFICIAL_CONTACT_EMAIL } from "@/lib/config/contact-email";
import { siteConfig } from "@/lib/config/site";

export { OFFICIAL_CONTACT_EMAIL };

export function getPublicContactEmail(): string {
  const fromEnv = siteConfig.contactEmail.trim();
  return fromEnv || OFFICIAL_CONTACT_EMAIL;
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

export function mailtoHref(email: string, subject?: string): string {
  if (!subject?.trim()) return `mailto:${email}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject.trim())}`;
}
