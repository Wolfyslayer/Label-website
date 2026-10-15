import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import { SocialLinks } from "@/components/layout/social-links";

const footerNav = [
  { href: "/artists", label: "Artists" },
  { href: "/music", label: "Music" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press Kit" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border-subtle bg-charcoal">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg tracking-[0.3em]">{siteConfig.fullName}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              Explore
            </h2>
            <ul className="mt-4 space-y-2">
              {footerNav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              Contact
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/contact" className="hover:text-text-primary">
                  General inquiries
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-text-primary">
                  Press &amp; media
                </Link>
              </li>
              {siteConfig.contactEmail ? (
                <li>
                  <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-text-primary">
                    {siteConfig.contactEmail}
                  </a>
                </li>
              ) : (
                <li className="text-text-muted">Email configured via environment</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.fullName}. All rights reserved.</p>
          <p>Independent label · Frostmark · Wolfyslayer</p>
        </div>
      </Container>
    </footer>
  );
}
