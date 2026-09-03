import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theflatset.com'

/**
 * Intelligent robots.txt generator for Next.js 16
 * Configures explicit permissions for standard search engines and Generative AI agents.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/_next/*',
          '/next/*',
          '/cart',
          '/*?*preview=*',
        ],
      },
      // Generative AI Search & LLM Crawlers: full open access to public knowledge endpoints
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Amazonbot',
          'Applebot-Extended',
          'Bytespider',
          'CCBot',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/api/catalog',
          '/products/*',
          '/1-bedroom-kit-builder',
          '/faq',
          '/how-it-works-craft-logistics',
          '/free-swatch-box-material-discovery',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/_next/*',
          '/cart',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
