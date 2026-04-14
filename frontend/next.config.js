/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'your-s3-bucket.s3.amazonaws.com'],
    unoptimized: true
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
    STREAMING_BASE_URL: process.env.STREAMING_BASE_URL || 'http://localhost:4567'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/:path*`
      }
    ];
  }
}

module.exports = nextConfig
