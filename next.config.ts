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
  
  // Add API configuration for handling larger file uploads
  api: {
    bodyParser: {
      sizeLimit: '16mb', // Increase this as needed for your largest files
    },
    responseLimit: false,
  },
  
  // Optional: Add experimental features if needed
  experimental: {
    serverComponentsExternalPackages: ['cloudinary'], // If using cloudinary in server components
  },
};

export default nextConfig;