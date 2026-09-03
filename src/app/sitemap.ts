import { locales, defaultLocale, type AppLocale } from '@/i18n/routing'
import { getAbsoluteLocaleURL, getLanguageAlternates } from '@/i18n/metadata'
import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theflatset.com'

/**
 * Dynamic Multilingual XML Sitemap Generator for Next.js 16
 * Outputs /sitemap.xml with full 7-locale hreflang alternates and Payload CMS products.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, '')
  const now = new Date()

  // 1. Core static storefront routes
  const staticRoutes = [
    { pathname: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { pathname: '/1-bedroom-kit-builder', changeFrequency: 'weekly' as const, priority: 1.0 },
    { pathname: '/free-swatch-box-material-discovery', changeFrequency: 'weekly' as const, priority: 0.9 },
    { pathname: '/how-it-works-craft-logistics', changeFrequency: 'monthly' as const, priority: 0.8 },
    { pathname: '/faq', changeFrequency: 'monthly' as const, priority: 0.8 },
    { pathname: '/cart', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // 2. Fetch dynamic products from Payload CMS
  let productSlugs: string[] = ['modusofa', 'snapbed', '1-bedroom-kit']
  try {
    const payload = await getPayload({ config: configPromise })
    const productsRes = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      select: {
        slug: true,
        updatedAt: true,
      },
    })
    if (productsRes?.docs?.length) {
      productSlugs = Array.from(
        new Set([...productSlugs, ...productsRes.docs.map((doc) => doc.slug).filter(Boolean)]),
      )
    }
  } catch {
    // Fallback to default product slugs if database is unreachable during build
  }

  const productRoutes = productSlugs.map((slug) => ({
    pathname: `/products/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const allRoutes = [...staticRoutes, ...productRoutes]

  // 3. Build localized entries with full hreflang alternates
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const route of allRoutes) {
    for (const locale of locales) {
      const canonicalUrl = getAbsoluteLocaleURL(locale as AppLocale, route.pathname)
      const languageAlternates = getLanguageAlternates(route.pathname, locales)

      sitemapEntries.push({
        url: canonicalUrl,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: languageAlternates,
        },
      })
    }
  }

  return sitemapEntries
}
