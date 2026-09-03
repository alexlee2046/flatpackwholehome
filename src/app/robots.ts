import type { MetadataRoute } from 'next'
import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'
import { locales } from '@/i18n/routing'

export const revalidate = 86400

/**
 * Intelligent robots.txt generator for Next.js 16
 * Configures explicit permissions for search engines, aggressive crawlers with crawl-delay,
 * and Generative AI agents across all 7 supported locales.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalSiteURL()

  const publicSections = [
    '/products/*',
    '/1-bedroom-kit-builder',
    '/us-vs-ikea',
    '/free-swatch-box-material-discovery',
    '/how-it-works-craft-logistics',
    '/faq',
  ]

  const baseAllow = [
    '/',
    '/api/catalog',
    '/llms.txt',
    '/llms-full.txt',
    ...publicSections,
  ]

  const localeAllowPaths = locales.flatMap((locale) => [
    `/${locale}`,
    ...publicSections.map((section) => `/${locale}${section}`),
  ])

  const allowedStorefrontPaths = [...baseAllow, ...localeAllowPaths]

  const disallowedPrivatePaths = [
    '/admin',
    '/admin/*',
    '/api/*',
    '/_next/*',
    '/next/*',
    '/cart',
    '/*?*preview=*',
  ]

  return {
    rules: [
      // 1. General Search Engines
      {
        userAgent: '*',
        allow: ['/', '/api/catalog', '/llms.txt', '/llms-full.txt'],
        disallow: disallowedPrivatePaths,
      },
      // 2. Aggressive Crawlers (throttled crawl rate)
      {
        userAgent: ['Bytespider', 'CCBot'],
        crawlDelay: 2,
        allow: allowedStorefrontPaths,
        disallow: disallowedPrivatePaths,
      },
      // 3. AI Assistants & LLM Crawlers (full access to public storefront & knowledge endpoints)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Amazonbot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'Diffbot',
          'cohere-ai',
        ],
        allow: allowedStorefrontPaths,
        disallow: disallowedPrivatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

