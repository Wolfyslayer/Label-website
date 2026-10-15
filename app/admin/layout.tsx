import { siteConfig } from "@/lib/config/site";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-charcoal text-text-primary">
      <header className="border-b border-border-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/admin" className="text-xs uppercase tracking-[0.2em]">
            {siteConfig.name} Admin
          </Link>
          <Link href="/" className="text-xs text-text-muted hover:text-text-primary">
            View site
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
