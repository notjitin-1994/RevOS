/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    // Whitelist your CDN domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maas-log-prod.cn-wlcb.ufileos.com',
        pathname: '/anthropic/**',
      },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allowed image quality values (required for Next.js 16+)
    qualities: [25, 50, 75, 90],
    // Minimum cache TTL in seconds (1 day)
    minimumCacheTTL: 86400,
  },
}

module.exports = nextConfig
