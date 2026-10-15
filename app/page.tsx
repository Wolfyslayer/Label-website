import Link from "next/link";

/** Root entry for custom-domain GitHub Pages (no server middleware). */
export default function RootPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-void px-6 text-center text-text-secondary">
      <p className="font-display text-xl text-text-primary">Wolfyslayer Records</p>
      <p className="text-sm">Choose your language / Välj språk</p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/en/"
          className="inline-flex min-h-11 items-center rounded-sm border border-border px-6 text-sm uppercase tracking-widest text-accent hover:text-text-primary"
        >
          English
        </Link>
        <Link
          href="/sv/"
          className="inline-flex min-h-11 items-center rounded-sm border border-border px-6 text-sm uppercase tracking-widest text-accent hover:text-text-primary"
        >
          Svenska
        </Link>
      </div>
    </div>
  );
}
