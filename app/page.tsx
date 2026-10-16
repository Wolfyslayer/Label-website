import Link from "next/link";
import type { Metadata } from "next";

/**
 * GitHub Pages serves a static root document, so server redirects are unavailable.
 * Send visitors directly to the Swedish homepage without a language-choice gate.
 * The full site retains its visible EN/SV selector in the header.
 */
export const metadata: Metadata = {
  title: "Wolfyslayer Records",
  alternates: { canonical: "/sv/" },
};

export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/sv/" />
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-void px-6 text-center text-text-secondary">
        <h1 className="font-display text-2xl text-text-primary">Wolfyslayer Records</h1>
        <p lang="sv">Du skickas vidare till hemsidan.</p>
        <p lang="en">Redirecting to the website.</p>
        <nav aria-label="Choose website language / Välj språk" className="flex flex-wrap justify-center gap-4">
          <Link href="/sv/" lang="sv" className="inline-flex min-h-11 items-center rounded-sm border border-border px-6 py-3 text-sm underline underline-offset-4 focus-visible:outline-2">Öppna svenska sidan</Link>
          <Link href="/en/" lang="en" className="inline-flex min-h-11 items-center rounded-sm border border-border px-6 py-3 text-sm underline underline-offset-4 focus-visible:outline-2">Open English website</Link>
        </nav>
      </main>
    </>
  );
}
