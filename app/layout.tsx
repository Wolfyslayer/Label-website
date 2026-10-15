import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";
import { Cinzel, DM_Sans, Source_Serif_4 } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s · ${siteConfig.fullName}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${cinzel.variable} ${dmSans.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-dvh bg-void text-text-primary antialiased">{children}</body>
    </html>
  );
}
