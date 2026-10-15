import Link from "next/link";
import { LabelMonogram } from "@/components/brand/label-monogram";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Root 404 for static export (`out/404.html`) — GitHub Pages unknown URLs. */
export default function RootNotFound() {
  return (
    <div className="min-h-dvh bg-void text-text-primary">
      <Container className="flex min-h-dvh flex-col items-center justify-center py-16 text-center">
        <LabelMonogram className="mb-8 h-12 w-12 text-silver" />
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">404</p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] text-balance">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-sm text-text-secondary">
          The page you requested is not available on {siteConfig.fullName}. Choose a language below
          or open the music catalog.
        </p>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          Sidan kunde inte hittas. Välj språk nedan.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/en/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-8 text-sm uppercase tracking-widest text-silver transition-colors hover:text-text-primary"
          >
            English home
          </Link>
          <Link
            href="/sv/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-8 text-sm uppercase tracking-widest text-silver transition-colors hover:text-text-primary"
          >
            Svenska
          </Link>
          <Link
            href="/en/music/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-text-primary px-8 text-sm uppercase tracking-widest text-void transition-colors hover:bg-text-secondary"
          >
            Music catalog
          </Link>
        </div>
      </Container>
    </div>
  );
}
