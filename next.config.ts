import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all domains
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/auth/(.*)", // Adjust this path based on where your auth routes are
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }, // Optional
        ],
      },
    ];
  },
  
  // Note: API configuration is handled in individual route files for App Router
  
  // Optional: Add experimental features if needed
 
};

export default nextConfig;