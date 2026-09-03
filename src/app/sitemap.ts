import { locales, type AppLocale } from '@/i18n/routing'
import { getAbsoluteLocaleURL, getLanguageAlternates } from '@/i18n/metadata'
import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'
import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

export const revalidate = 86400

/**
 * Sanitizes image URLs to prevent development hosts (localhost, 127.0.0.1, canbee.cn)
 * from leaking into the production sitemap XML.
 */
function sanitizeSitemapImageUrl(rawUrl: string, baseUrl: string): string {
  if (!rawUrl) return ''
  if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1') || rawUrl.includes('canbee.cn')) {
    return rawUrl.replace(/^https?:\/\/[^\/]+/, baseUrl)
  }
  if (rawUrl.startsWith('http')) {
    return rawUrl
  }
  return `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
}

/**
 * Dynamic Multilingual XML Sitemap Generator for Next.js 16
 * Outputs /sitemap.xml with full 7-locale hreflang alternates, Google image entries,
 * Payload CMS product synchronization with robust static media fallbacks, and strict deduplication.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getCanonicalSiteURL()
  const now = new Date()

  // 1. Core static storefront routes with relevant Google Image entries (no /cart)
  const staticRoutes: Array<{
    pathname: string
    changeFrequency: 'weekly' | 'monthly'
    priority: number
    images?: string[]
    lastModified?: Date
  }> = [
    {
      pathname: '/',
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [
        `${baseUrl}/media/hero-split.png`,
        `${baseUrl}/media/homepage.png`,
      ],
    },
    {
      pathname: '/1-bedroom-kit-builder',
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [
        `${baseUrl}/media/1-bedroom-kit-builder.png`,
        `${baseUrl}/media/asset-boxes-to-room-split.png`,
      ],
    },
    {
      pathname: '/us-vs-ikea',
      changeFrequency: 'weekly',
      priority: 0.95,
      images: [
        `${baseUrl}/media/asset-boxes-to-room-split.png`,
        `${baseUrl}/media/hero-split.png`,
      ],
    },
    {
      pathname: '/free-swatch-box-material-discovery',
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [
        `${baseUrl}/media/free-swatch-box-material-discovery.png`,
        `${baseUrl}/media/asset-swatch-box-hero.png`,
        `${baseUrl}/media/asset-swatch-box-closeup.png`,
      ],
    },
    {
      pathname: '/how-it-works-craft-logistics',
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [
        `${baseUrl}/media/how-it-works-craft-logistics.png`,
        `${baseUrl}/media/asset-snap-joint-exploded.png`,
      ],
    },
    {
      pathname: '/faq',
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [
        `${baseUrl}/media/hero-split.png`,
      ],
    },
  ]

  // 2. Default product catalog with high-resolution fallback image sets
  const FALLBACK_PRODUCT_IMAGES: Record<string, string[]> = {
    modusofa: [
      `${baseUrl}/media/modusofa-product-detail-page.png`,
      `${baseUrl}/media/e38c85e68d.png`,
      `${baseUrl}/media/b354f66f79.png`,
      `${baseUrl}/media/d3a3e93b3d.png`,
      `${baseUrl}/media/asset-boxes-to-room-split.png`,
    ],
    snapbed: [
      `${baseUrl}/media/b4e5f4d8a0.png`,
      `${baseUrl}/media/d4a4793ee2.png`,
      `${baseUrl}/media/d66ddc7ba1.png`,
    ],
    '1-bedroom-kit': [
      `${baseUrl}/media/1-bedroom-kit-builder.png`,
      `${baseUrl}/media/da48e93272.png`,
      `${baseUrl}/media/b4e5f4d8a0.png`,
      `${baseUrl}/media/asset-boxes-to-room-split.png`,
      `${baseUrl}/media/188581c175.png`,
    ],
  }

  interface ProductEntry {
    slug: string
    updatedAt?: string | Date
    images: string[]
  }

  const productsMap = new Map<string, ProductEntry>()

  // Pre-seed default products to guarantee sitemap completes even if DB is offline
  for (const [slug, images] of Object.entries(FALLBACK_PRODUCT_IMAGES)) {
    productsMap.set(slug, {
      slug,
      updatedAt: now,
      images,
    })
  }

  // 3. Query Payload CMS products if available
  try {
    const payload = await getPayload({ config: configPromise })
    const productsRes = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      select: {
        slug: true,
        updatedAt: true,
        gallery: true,
        meta: true,
      },
    })

    if (productsRes?.docs?.length) {
      for (const doc of productsRes.docs) {
        if (!doc.slug) continue

        const extractedImages: string[] = []

        // Extract meta image
        const metaImg = doc.meta?.image
        if (metaImg && typeof metaImg === 'object') {
          if ('url' in metaImg && typeof metaImg.url === 'string' && metaImg.url) {
            const url = sanitizeSitemapImageUrl(metaImg.url, baseUrl)
            if (url && !extractedImages.includes(url)) {
              extractedImages.push(url)
            }
          } else if ('filename' in metaImg && typeof metaImg.filename === 'string' && metaImg.filename) {
            const url = `${baseUrl}/media/${metaImg.filename}`
            if (!extractedImages.includes(url)) {
              extractedImages.push(url)
            }
          }
        }

        // Extract gallery images
        if (Array.isArray(doc.gallery)) {
          for (const item of doc.gallery) {
            const img = item?.image
            if (img && typeof img === 'object') {
              if ('url' in img && typeof img.url === 'string' && img.url) {
                const url = sanitizeSitemapImageUrl(img.url, baseUrl)
                if (url && !extractedImages.includes(url)) {
                  extractedImages.push(url)
                }
              } else if ('filename' in img && typeof img.filename === 'string' && img.filename) {
                const url = `${baseUrl}/media/${img.filename}`
                if (!extractedImages.includes(url)) {
                  extractedImages.push(url)
                }
              }
            }
          }
        }

        const fallback = FALLBACK_PRODUCT_IMAGES[doc.slug] || []
        const mergedImages = Array.from(new Set([...extractedImages, ...fallback]))

        productsMap.set(doc.slug, {
          slug: doc.slug,
          updatedAt: doc.updatedAt || now,
          images: mergedImages.length > 0 ? mergedImages : fallback,
        })
      }
    }
  } catch {
    // Database offline during build - fallback products already seeded in productsMap
  }

  const productRoutes = Array.from(productsMap.values()).map((product) => ({
    pathname: `/products/${product.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    images: product.images,
  }))

  const allRoutes = [...staticRoutes, ...productRoutes]

  // 4. Build localized entries with full hreflang alternates and strict deduplication
  const seenUrls = new Set<string>()
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const route of allRoutes) {
    for (const locale of locales) {
      const canonicalUrl = getAbsoluteLocaleURL(locale as AppLocale, route.pathname)
      if (seenUrls.has(canonicalUrl)) {
        continue
      }
      seenUrls.add(canonicalUrl)

      sitemapEntries.push({
        url: canonicalUrl,
        lastModified: route.lastModified || now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: getLanguageAlternates(route.pathname, locales),
        },
        images: route.images && route.images.length > 0 ? route.images : undefined,
      })
    }
  }

  return sitemapEntries
}

