"use client";

import { LabelLogo } from "@/components/layout/label-logo";
import { SocialLinks } from "@/components/layout/social-links";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import type { PublicSocialLinks } from "@/lib/content/site-settings";
import { getPublicContactEmail } from "@/lib/config/public-contact";
import { siteConfig } from "@/lib/config/site";
import { useTranslations } from "next-intl";

const footerHrefs = [
  { href: "/artists", labelKey: "artists" as const, ns: "nav" as const },
  { href: "/music", labelKey: "music" as const, ns: "nav" as const },
  { href: "/merch", labelKey: "merch" as const, ns: "nav" as const },
  { href: "/upcoming", labelKey: "upcoming" as const, ns: "nav" as const },
  { href: "/news", labelKey: "news" as const, ns: "nav" as const },
  { href: "/about", labelKey: "about" as const, ns: "nav" as const },
  { href: "/press", labelKey: "press" as const, ns: "footer" as const },
  { href: "/contact", labelKey: "contact" as const, ns: "nav" as const },
];

export function SiteFooter({ socialLinks }: { socialLinks?: PublicSocialLinks }) {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tMeta = useTranslations("meta");
  const year = new Date().getFullYear();
  const contactEmail = getPublicContactEmail();

  return (
    <footer role="contentinfo" className="border-t border-border-subtle bg-charcoal pb-[env(safe-area-inset-bottom)]">
      <Container className="py-[var(--space-section)]">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <LabelLogo variant="footer" className="max-w-full" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
              {tMeta("defaultDescription")}
            </p>
            <div className="mt-6">
              <SocialLinks links={socialLinks} />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              {tFooter("explore")}
            </h2>
            <nav aria-label={tFooter("explore")}><ul className="mt-4 space-y-2">
              {footerHrefs.map(({ href, labelKey, ns }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-silver"
                  >
                    {ns === "footer" ? tFooter(labelKey) : tNav(labelKey)}
                  </Link>
                </li>
              ))}
            </ul></nav>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              {tFooter("contact")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/contact" className="inline-flex min-h-11 items-center hover:text-text-primary">
                  {tFooter("general")}
                </Link>
              </li>
              <li>
                <Link href="/press" className="inline-flex min-h-11 items-center hover:text-text-primary">
                  {tFooter("press")}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex min-h-11 items-center break-all hover:text-text-primary"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.fullName}. {tFooter("rights")}
          </p>
          <p>{tFooter("tagline")}</p>
        </div>
      </Container>
    </footer>
  );
}
