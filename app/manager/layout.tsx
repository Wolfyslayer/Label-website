import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Music Manager",
  description:
    "Client-side editor for Wolfyslayer Records content. Export files for manual GitHub upload — not a private admin.",
  robots: { index: false, follow: false },
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return children;
}
