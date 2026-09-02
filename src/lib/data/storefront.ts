import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Retrieve homepage data with 5-minute data cache and in-flight deduplication.
 */
export const getHomePageData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        const [h, a, kitProductRes] = await Promise.all([
          payload.findGlobal({
            slug: 'homepage',
            depth: 2,
            locale: locale as any,
            overrideAccess: true,
          }),
          payload.findGlobal({
            slug: 'announcement',
            depth: 1,
            locale: locale as any,
            overrideAccess: true,
          }),
          payload.find({
            collection: 'products',
            depth: 0,
            limit: 1,
            locale: locale as any,
            overrideAccess: true,
            where: { slug: { equals: '1-bedroom-kit' } },
          }),
        ])

        return {
          announcement: a,
          homepage: h,
          kitProduct: kitProductRes?.docs?.[0] || null,
        }
      } catch (err) {
        return {
          announcement: null,
          homepage: null,
          kitProduct: null,
        }
      }
    },
    ['storefront-homepage', locale],
    { revalidate: 300, tags: ['homepage', `homepage-${locale}`] },
  )()
})

/**
 * Retrieve product by slug with 5-minute data cache and in-flight deduplication.
 */
export const getProductData = cache(async (slug: string, locale: string) => {
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        const productResult = await payload.find({
          collection: 'products',
          depth: 2,
          limit: 1,
          locale: locale as any,
          overrideAccess: true,
          where: {
            slug: { equals: slug },
          },
        })
        return productResult?.docs?.[0] || null
      } catch {
        return null
      }
    },
    ['storefront-product', slug, locale],
    { revalidate: 300, tags: ['products', `product-${slug}`] },
  )()
})

/**
 * Retrieve kit builder datasets with 5-minute data cache and in-flight deduplication.
 */
export const getKitBuilderData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        const [productsRes, spacesRes, materialsRes] = await Promise.all([
          payload.find({
            collection: 'products',
            depth: 1,
            limit: 10,
            locale: locale as any,
            overrideAccess: true,
            where: {
              slug: { in: ['1-bedroom-kit', 'modusofa', 'snapbed'] },
            },
          }),
          payload.find({
            collection: 'spaces',
            depth: 1,
            limit: 10,
            locale: locale as any,
            overrideAccess: true,
          }),
          payload.find({
            collection: 'materials',
            depth: 1,
            limit: 10,
            locale: locale as any,
            overrideAccess: true,
          }),
        ])

        return {
          bedProduct: productsRes?.docs?.find((p) => p.slug === 'snapbed') || null,
          bundleProduct: productsRes?.docs?.find((p) => p.slug === '1-bedroom-kit') || null,
          livingProduct: productsRes?.docs?.find((p) => p.slug === 'modusofa') || null,
          materials: materialsRes?.docs || [],
          spaces: spacesRes?.docs || [],
        }
      } catch {
        return {
          bedProduct: null,
          bundleProduct: null,
          livingProduct: null,
          materials: [],
          spaces: [],
        }
      }
    },
    ['storefront-kit-builder', locale],
    { revalidate: 300, tags: ['kit-builder', 'products', 'spaces', 'materials'] },
  )()
})
