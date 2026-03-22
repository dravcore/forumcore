import type { NextConfig } from 'next'
import BundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // MinIO / S3-compatible storage (Coolify üzerindeki MinIO servisi)
      {
        protocol: 'http',
        hostname: '**',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
}

export default withBundleAnalyzer(nextConfig)
