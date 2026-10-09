import type { NextConfig } from "next";

let apiOrigin = "http://localhost:5001";
try {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith("http")) {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  }
} catch {
  apiOrigin = "http://localhost:5001";
}

let siteOrigin = "http://localhost:3001";
try {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")) {
    siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
  }
} catch {
  siteOrigin = "http://localhost:3001";
}

const isProd = process.env.NODE_ENV === "production";
const scriptSrcEval = isProd ? "" : " 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${scriptSrcEval} 'wasm-unsafe-eval'`,
  "worker-src 'self' blob: data:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob: http:",
  "media-src 'self' https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} http://localhost:4000 https://res.cloudinary.com https://lottie.host https://cdn.jsdelivr.net blob: data:`,
  `frame-src ${siteOrigin} http://localhost:3001 http://127.0.0.1:3001 http://localhost:3002 http://127.0.0.1:3002`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
