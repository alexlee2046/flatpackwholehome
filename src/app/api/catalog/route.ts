import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  getStorefrontOfferPrice,
  normalizeStorefrontCheckoutProduct,
} from '@/lib/commerce/catalogEligibility'
import { normalizeStorefrontVariants } from '@/lib/commerce/storefrontCart'
import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'

export const dynamic = 'force-dynamic'

const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'] as const
const CATALOG_PRODUCT_LIMIT = 100
const CATALOG_VARIANT_LIMIT = 100

function responseHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    // Inventory and published-state changes must not leave a stale purchasable
    // record in a shared cache.
    'Cache-Control': 'no-store',
  }
}

function isSupportedLocale(value: string): value is (typeof SUPPORTED_LOCALES)[number] {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Machine-readable browse catalog. It deliberately has no static fallbacks:
 * unavailable or incomplete catalog facts never become a purchasable listing.
 */
export async function GET(request: NextRequest) {
  const requestedLocale = new URL(request.url).searchParams.get('locale') || 'en'
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : 'en'
  const baseUrl = getCanonicalSiteURL()

  try {
    const payload = await getPayload({ config: configPromise })
    const productsResult = await payload.find({
      collection: 'products',
      depth: 1,
      limit: CATALOG_PRODUCT_LIMIT,
      locale,
      overrideAccess: true,
      select: {
        _status: true,
        enableVariants: true,
        id: true,
        inventory: true,
        packedVolumeCbm: true,
        priceInUSD: true,
        priceInUSDEnabled: true,
        slug: true,
        subtitle: true,
        title: true,
        variantTypes: true,
      },
      where: { _status: { equals: 'published' } },
    })

    // Do not silently publish a partial product catalog if the explicit limit
    // is reached. A configured source can raise the limit with review.
    if (productsResult.hasNextPage) throw new Error('Catalog product limit reached')

    const items = (
      await Promise.all(
        productsResult.docs.map(async (product) => {
          const variantsResult = await payload.find({
            collection: 'variants',
            depth: 2,
            limit: CATALOG_VARIANT_LIMIT,
            locale,
            overrideAccess: true,
            select: {
              _status: true,
              id: true,
              inventory: true,
              options: true,
              priceInUSD: true,
              priceInUSDEnabled: true,
              product: true,
            },
            where: { product: { equals: product.id } },
          })

          // The SKU collection is the source of option/type/price facts. A
          // truncated set could make a product look orderable when it is not.
          if (variantsResult.hasNextPage) return null

          const checkout = normalizeStorefrontCheckoutProduct(product, 'catalog')
          const variants = normalizeStorefrontVariants(variantsResult.docs)
          const offerPrice = getStorefrontOfferPrice(checkout, variants)
          const title = typeof product.title === 'string' ? product.title.trim() : ''
          const slug = typeof product.slug === 'string' ? product.slug.trim() : ''
          if (!checkout.id || !title || !slug || offerPrice === undefined) return null

          return {
            id: String(checkout.id),
            slug,
            name: title,
            ...(typeof product.subtitle === 'string' && product.subtitle.trim()
              ? { description: product.subtitle.trim() }
              : {}),
            priceBeforeDestinationDeliveryUSD: offerPrice / 100,
            destinationQuoteRequired: true,
            url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/products/${slug}`,
          }
        }),
      )
    ).filter((item): item is NonNullable<typeof item> => item !== null)

    return NextResponse.json(
      {
        brand: 'The Flat Set',
        website: baseUrl,
        locale,
        supportedLocales: SUPPORTED_LOCALES,
        catalogAvailable: true,
        currency: 'USD',
        totalItems: items.length,
        items,
      },
      { headers: responseHeaders() },
    )
  } catch (error) {
    console.error('[catalog]', error)
    return NextResponse.json(
      {
        code: 'CATALOG_UNAVAILABLE',
        catalogAvailable: false,
        currency: 'USD',
        items: [],
        locale,
      },
      { headers: responseHeaders(), status: 503 },
    )
  }
}
