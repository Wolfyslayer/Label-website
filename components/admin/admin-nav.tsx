"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AdminSignOut } from "@/components/admin/sign-out";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/artists", label: "Artists" },
  { href: "/admin/releases", label: "Releases" },
  { href: "/admin/tracks", label: "Tracks" },
  { href: "/admin/upcoming", label: "Upcoming" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <nav
        className={cn(
          "lg:flex lg:items-center lg:gap-1",
          open
            ? "absolute left-0 right-0 top-14 z-50 border-b border-border-subtle bg-charcoal p-4 shadow-lg"
            : "hidden",
        )}
      >
        <ul className="flex flex-col gap-1 lg:flex-row lg:flex-wrap">
          {links.map(({ href, label }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block min-h-11 rounded-sm px-3 py-2 text-sm transition-colors",
                    active ? "bg-surface-elevated text-text-primary" : "text-text-muted hover:text-text-primary",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 border-t border-border-subtle pt-4 lg:ml-auto lg:mt-0 lg:border-0 lg:pt-0">
          <AdminSignOut />
        </div>
      </nav>
    </>
  );
}
