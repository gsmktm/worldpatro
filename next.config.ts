import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      { source:"/app/calendar", destination:"/app/patro", permanent:true },
      { source:"/app/converter", destination:"/app/tools#date-converter", permanent:true },
      { source:"/app/date-converter", destination:"/app/tools#date-converter", permanent:true },
      { source:"/app/convert", destination:"/app/tools#date-converter", permanent:true },
      { source:"/app/festival", destination:"/app/festivals", permanent:true },
      { source:"/app/my-calendar", destination:"/app/planner", permanent:true },
      { source:"/app/notifications", destination:"/app/alerts", permanent:true },
      { source:"/app/settings", destination:"/app/account", permanent:true },
      { source:"/app/modules", destination:"/app/ecosystem", permanent:true },
      { source:"/calendar", destination:"/app/patro", permanent:true },
      { source:"/panchang", destination:"/app/panchang", permanent:true },
      { source:"/kundli", destination:"/app/kundli", permanent:true },
      { source:"/muhurat", destination:"/app/muhurat", permanent:true },
      { source:"/festivals", destination:"/app/festivals", permanent:true }
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

export default nextConfig;

