import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/media/**',
      },
      {
        pathname: '/screenshots/**',
      },
      {
        pathname: '/assets/**',
      },
      {
        pathname: '/images/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'theflatset.com',
      },
      {
        protocol: 'https',
        hostname: 'flatpack.dev.canbee.cn',
      },
      ...(process.env.NODE_ENV !== 'production'
        ? [{ protocol: 'http' as const, hostname: 'localhost' }]
        : []),
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        try {
          const url = new URL(item)
          return {
            hostname: url.hostname,
            pathname: '/**',
            port: url.port,
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
          }
        } catch {
          return {
            hostname: 'localhost',
            pathname: '/**',
            protocol: 'http' as const,
          }
        }
      }),
    ],
  },
  async headers() {
    return [
      {
        source: '/vendor/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/screenshots/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/vendor/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/moduliv-core.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
  reactStrictMode: true,
  redirects,
  async rewrites() {
    return [
      {
        source: '/api/media/file/:path*',
        destination: '/media/:path*',
      },
    ]
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withPayload(withNextIntl(nextConfig))
