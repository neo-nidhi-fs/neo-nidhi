import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['pdf-parse'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  // Turbopack configuration equivalent to webpack alias stubbing
  turbopack: {
    resolveAlias: {
      canvas: './empty.js',
    },
  },
};

export default nextConfig;
