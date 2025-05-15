import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // For static export
  images: {
    unoptimized: true, // For static export, next/image optimization needs a server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
