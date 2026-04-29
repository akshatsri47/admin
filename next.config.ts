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
  
  // Optional: Add experimental features if needed
  serverExternalPackages: [
    'lodash.camelcase', 
    'combined-stream', 
    'asynckit', 
    '@protobufjs/codegen', 
    '@protobufjs/fetch', 
    '@protobufjs/aspromise'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "lodash.camelcase": false,
        "combined-stream": false,
        "asynckit": false,
        "@protobufjs/codegen": false,
        "@protobufjs/fetch": false,
        "@protobufjs/aspromise": false,
      };
    }
    return config;
  },
};

export default nextConfig;