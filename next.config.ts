import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const staticExport = process.env.STATIC_EXPORT === "1" || process.env.GITHUB_PAGES === "1";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/^\//, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: staticExport ? "export" : undefined,
  trailingSlash: staticExport,
  poweredByHeader: false,
  ...(basePath ? { basePath: `/${basePath}` } : {}),
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com",
        pathname: "/**",
      },
      ...(staticExport
        ? []
        : [
            {
              protocol: "https" as const,
              hostname: "*.supabase.co",
              pathname: "/storage/v1/object/public/**",
            },
          ]),
    ],
    formats: staticExport ? undefined : ["image/avif", "image/webp"],
  },
  ...(staticExport
    ? {}
    : {
        async headers() {
          const securityHeaders = [
            { key: "X-DNS-Prefetch-Control", value: "on" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
            },
          ];
          return [{ source: "/(.*)", headers: securityHeaders }];
        },
      }),
};

export default withNextIntl(nextConfig);
