"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/artists", label: "Artists" },
  { href: "/music", label: "Music" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || open
          ? "border-b border-border-subtle bg-void/90 backdrop-blur-md"
          : "bg-gradient-to-b from-void/80 to-transparent",
      )}
    >
      <Container as="div" className="flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className="font-display text-sm tracking-[0.35em] text-text-primary sm:text-base"
          aria-label={`${siteConfig.fullName} home`}
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-xs uppercase tracking-[0.15em] transition-colors hover:text-text-primary",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "text-text-primary"
                  : "text-text-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button href="/music" variant="outline" size="sm" className="hidden sm:inline-flex">
            Listen
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-text-primary lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 top-16 z-40 bg-void/98 backdrop-blur-lg transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <Container className="flex h-[calc(100dvh-4rem)] flex-col py-8">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="border-b border-border-subtle py-4 font-display text-2xl text-text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8">
            <Button href="/music" className="w-full">
              Explore music
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
