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
    domains: ['yash-demo-s3-bucket-6660.s3.ap-south-1.amazonaws.com', 'img.youtube.com', 'placehold.co', 'image.tmdb.org'],
    unoptimized: true
  },
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.7.114.115:5000',
    STREAMING_BASE_URL: process.env.NEXT_PUBLIC_STREAMING_BASE_URL || 'http://3.7.114.115:5000/api/stream'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.7.114.115:5000'}/api/:path*`
      }
    ];
  }
}

module.exports = nextConfig
