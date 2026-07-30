import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  webpack: (config) => {
    // pdf-parse / pdfjs-dist use canvas as an optional peer dep; stub it out
    config.resolve.alias['canvas'] = false;
    return config;
  },
};

export default nextConfig;
