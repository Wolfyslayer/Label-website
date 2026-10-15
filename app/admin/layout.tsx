import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Static export: CMS UI lives under server-routes/ for Node hosts. */
export default function AdminStaticLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-charcoal text-text-primary">
      <header className="border-b border-border-subtle">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="text-xs uppercase tracking-[0.2em]">{siteConfig.name} Admin</span>
          <Link href="/en/" className="text-xs text-accent hover:text-text-primary">
            View site
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
    </div>
  );
}
