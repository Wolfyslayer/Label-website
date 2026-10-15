import { AdminNav } from "@/components/admin/admin-nav";
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
      <header className="relative border-b border-border-subtle">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
          <Link href="/admin" className="shrink-0 text-xs uppercase tracking-[0.2em]">
            {siteConfig.name} Admin
          </Link>
          <AdminNav />
          <Link
            href="/en"
            className="hidden text-xs text-text-muted hover:text-text-primary sm:inline"
          >
            View site
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-5">{children}</div>
    </div>
  );
}
