import type { NextConfig } from "next";

/**
 * `GITHUB_PAGES=true` builds a fully static export served from a sub-path
 * (https://<user>.github.io/<repo>/). Otherwise it is a normal Next.js server build.
 */
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? (process.env.PAGES_BASE_PATH ?? "/calce-museum") : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // three.js ships modern ESM; transpiling keeps the client bundle consistent.
  transpilePackages: ["three"],
  ...(pages
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
