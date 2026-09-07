import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  // Pin the workspace root so Next doesn't infer a stray parent-dir lockfile.
  turbopack: {
    root: path.join(import.meta.dirname, '..', '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
