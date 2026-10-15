"use client";

import { LabelLogo } from "@/components/layout/label-logo";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const navHrefs = [
  { href: "/artists", key: "artists" as const },
  { href: "/music", key: "music" as const },
  { href: "/upcoming", key: "upcoming" as const },
  { href: "/news", key: "news" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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

  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] pt-[env(safe-area-inset-top)] transition-[background,box-shadow,border-color] duration-500",
        scrolled || open
          ? "border-b border-border-subtle bg-void/92 shadow-[0_1px_0_0_rgba(201,209,217,0.06)] backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-void/90 via-void/50 to-transparent",
      )}
    >
      <Container as="div" className="flex h-[var(--header-height)] items-center justify-between gap-3">
        <LabelLogo className="min-w-0 shrink" compact={false} />

        <nav className="hidden items-center gap-6 xl:flex" aria-label={t("primary")}>
          {navHrefs.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap py-2 text-[11px] uppercase tracking-[0.18em] transition-colors",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "text-silver"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSelector className="hidden sm:flex" />
          <Button href="/music" variant="outline" size="sm" className="hidden min-h-11 md:inline-flex">
            {t("listen")}
          </Button>
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border text-text-primary xl:hidden"
            aria-expanded={open}
            aria-controls={dialogId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </Container>
    </header>

      {/* Portal + mount only when open: avoids backdrop-filter containing block and stray hit targets. */}
      {mounted && open
        ? createPortal(
            <div
              id={dialogId}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-hidden={false}
              aria-label={t("mobilePrimary")}
              className="fixed inset-x-0 bottom-0 top-[calc(var(--header-height)+env(safe-area-inset-top))] z-[90] overflow-y-auto bg-void/98 backdrop-blur-lg xl:hidden"
            >
              <Container className="flex min-h-full flex-col py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="mb-6 sm:hidden">
                  <LanguageSelector />
                </div>
                <nav className="flex flex-col gap-0" aria-label={t("mobilePrimary")}>
                  {navHrefs.map(({ href, key }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="border-b border-border-subtle py-4 font-display text-[clamp(1.35rem,5vw,1.75rem)] text-text-primary"
                    >
                      {t(key)}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto space-y-3 pt-10">
                  <Button href="/music" className="min-h-12 w-full">
                    {t("exploreMusic")}
                  </Button>
                  <Button href="/contact" variant="outline" className="min-h-12 w-full">
                    {t("contact")}
                  </Button>
                </div>
              </Container>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
