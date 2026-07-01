import type { NextConfig } from "next";

// NOTE: If Turbopack warns about the workspace root (multiple lockfiles),
// you can set the turbopack root to this project directory to silence the
// warning. Example (add to `nextConfig`):
// turbopack: { root: path.resolve(__dirname) }
// Alternatively, set `turbopack.root` in your global Next config.

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

