import { publicAssetPath, siteBrandPaths } from "@/lib/assets/site-brand";
import { siteConfig } from "@/lib/config/site";
import { siteDefaultOpenGraph } from "@/lib/metadata/open-graph";
import type { Metadata } from "next";
import { Cinzel, DM_Sans, Source_Serif_4 } from "next/font/google";
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

const { favicon } = siteBrandPaths;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s · ${siteConfig.fullName}`,
  },
  description: siteConfig.description,
  ...siteDefaultOpenGraph(),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: publicAssetPath(favicon.svg), type: "image/svg+xml" },
      { url: publicAssetPath(favicon.png32), sizes: "32x32", type: "image/png" },
      { url: publicAssetPath(favicon.png48), sizes: "48x48", type: "image/png" },
      { url: publicAssetPath(favicon.png192), sizes: "192x192", type: "image/png" },
      { url: publicAssetPath(favicon.png512), sizes: "512x512", type: "image/png" },
    ],
    shortcut: [publicAssetPath(favicon.png48)],
    apple: [
      {
        url: publicAssetPath(favicon.png180),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${dmSans.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-dvh bg-void text-text-primary antialiased">{children}</body>
    </html>
  );
}
