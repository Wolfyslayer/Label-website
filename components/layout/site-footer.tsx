"use client";

import { useLocale } from "@/components/providers/locale-provider";
import type { Messages } from "@/lib/i18n";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import { SocialLinks } from "@/components/layout/social-links";

const footerHrefs: { href: string; label: (m: Messages) => string }[] = [
  { href: "/artists", label: (m) => m.nav.artists },
  { href: "/music", label: (m) => m.nav.music },
  { href: "/upcoming", label: (m) => m.nav.upcoming },
  { href: "/news", label: (m) => m.nav.news },
  { href: "/about", label: (m) => m.nav.about },
  { href: "/press", label: (m) => m.footer.press },
  { href: "/contact", label: (m) => m.nav.contact },
];

export function SiteFooter() {
  const { messages } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-charcoal pb-[env(safe-area-inset-bottom)]">
      <Container className="py-[var(--space-section)]">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-sm tracking-[0.28em] text-silver sm:text-base">
              {siteConfig.fullName}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              {messages.footer.explore}
            </h2>
            <ul className="mt-4 space-y-2">
              {footerHrefs.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {label(messages)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              {messages.footer.contact}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/contact" className="inline-flex min-h-11 items-center hover:text-text-primary">
                  {messages.footer.general}
                </Link>
              </li>
              <li>
                <Link href="/press" className="inline-flex min-h-11 items-center hover:text-text-primary">
                  {messages.footer.press}
                </Link>
              </li>
              {siteConfig.contactEmail ? (
                <li>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="inline-flex min-h-11 items-center hover:text-text-primary"
                  >
                    {siteConfig.contactEmail}
                  </a>
                </li>
              ) : (
                <li className="text-text-muted">{messages.footer.emailEnv}</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.fullName}. {messages.footer.rights}
          </p>
          <p>{messages.footer.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
