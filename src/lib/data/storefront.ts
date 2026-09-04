import { FAQ_ITEMS, type FaqItem } from '@/data/faq'
import { FAQ_SAFE_ANSWERS } from '@/data/faqSafeAnswers'
import { I18N_DICTIONARY } from '@/utilities/i18nDictionary'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Every product query here runs with `overrideAccess: true`, which bypasses the
 * field-level access control on Products. Strip the internal economics on the
 * way out instead, so a caller that spreads a whole document — rather than
 * hand-picking fields, as the pages happen to do today — still cannot leak
 * factory cost data to the browser.
 */
const INTERNAL_PRODUCT_FIELDS = ['targetBOMUSD', 'targetBOMRMB', 'ikeaBenchmarkPrice', 'supplierSKU']

function stripInternalFields<T>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc
  const out = { ...(doc as Record<string, unknown>) }
  for (const field of INTERNAL_PRODUCT_FIELDS) delete out[field]
  return out as T
}

// Payload join fields default to ten records and the product `variants` join is
// capped before option type relationships are fully populated. Query the SKU
// collection directly instead: depth 2 resolves options and their type, while
// the explicit limit lets us fail closed rather than price a truncated set.
const STOREFRONT_VARIANT_LIMIT = 100

async function getCompleteProductVariants(payload: any, productID: number, locale: string) {
  try {
    const result = await payload.find({
      collection: 'variants',
      depth: 2,
      limit: STOREFRONT_VARIANT_LIMIT,
      locale: locale as any,
      overrideAccess: true,
      where: { product: { equals: productID } },
    })

    return result.hasNextPage ? [] : result.docs || []
  } catch (error) {
    console.error('[storefront:getCompleteProductVariants]', error)
    return []
  }
}

/**
 * Retrieve homepage data with 5-minute data cache and in-flight deduplication.
 */
export const getHomePageData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const dict = I18N_DICTIONARY[locale]
      try {
        const payload = await getPayload({ config: configPromise })
        const [h, hUnfallen, a, kitProductRes] = await Promise.all([
          payload.findGlobal({
            slug: 'homepage',
            depth: 2,
            locale: locale as any,
            overrideAccess: true,
          }),
          // Same global without Payload's locale fallback: fields come back empty
          // when this locale has no stored value, which is how we tell "showing
          // English because it was never translated" from "translated to this".
          locale === 'en'
            ? Promise.resolve(null)
            : payload.findGlobal({
                slug: 'homepage',
                depth: 0,
                fallbackLocale: false,
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

        const untranslated = (value: unknown) =>
          value === null || value === undefined || (Array.isArray(value) && value.length === 0)

        const raw = hUnfallen as any
        const isEnglishFallback =
          locale !== 'en' &&
          untranslated(raw?.comparisonMatrix) &&
          untranslated(raw?.testimonials)

        const resolvedHome =
          isEnglishFallback && dict?.homepage
            ? {
                ...h,
                comparisonMatrix: dict.homepage.comparisonMatrix,
                testimonials: dict.homepage.testimonials,
              }
            : h || (dict ? dict.homepage : null)

        return {
          announcement: a,
          homepage: resolvedHome,
          kitProduct: stripInternalFields(kitProductRes?.docs?.[0] || null),
        }
      } catch (err) {
        console.error('[storefront:getHomePageData]', err)
        return {
          announcement: null,
          homepage: dict ? dict.homepage : null,
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
        const product = productResult?.docs?.[0]
        if (!product) return null

        const variants = await getCompleteProductVariants(payload, product.id, locale)
        return stripInternalFields({ ...product, variants })
      } catch (err) {
        console.error('[storefront:getProductData]', err)
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
            depth: 3,
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
            limit: 20,
            locale: locale as any,
            overrideAccess: true,
          }),
        ])

        const products = productsRes?.docs || []
        const variantsByProduct = new Map(
          await Promise.all(
            products.map(async (product) => [
              product.id,
              await getCompleteProductVariants(payload, product.id, locale),
            ] as const),
          ),
        )
        const productWithVariants = (slug: string) => {
          const product = products.find((candidate) => candidate.slug === slug)
          return product
            ? stripInternalFields({ ...product, variants: variantsByProduct.get(product.id) || [] })
            : null
        }

        return {
          bedProduct: productWithVariants('snapbed'),
          bundleProduct: productWithVariants('1-bedroom-kit'),
          livingProduct: productWithVariants('modusofa'),
          materials: materialsRes?.docs || [],
          spaces: spacesRes?.docs || [],
        }
      } catch (err) {
        console.error('[storefront:getKitBuilderData]', err)
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

// Normalized English question text is the only key shared across the CMS `faqs`
// collection, the static FAQ_ITEMS defaults and the I18N_DICTIONARY translations —
// none of the three carries an explicit id. Match on this instead of array
// position so reordering/adding/removing a FAQ in the CMS can't misalign a doc
// with an unrelated translation.
const normalizeFaqKey = (text?: string | null) =>
  (text || '')
    .trim()
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')

const FAQ_INDEX_BY_KEY = new Map(FAQ_ITEMS.map((item, idx) => [normalizeFaqKey(item.q), idx]))
const safeFaqAnswers = (locale: string) => FAQ_SAFE_ANSWERS[locale] || FAQ_SAFE_ANSWERS.en

/**
 * Retrieve FAQ dataset from CMS with fallback to default questions.
 */
export const getFaqData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const dict = I18N_DICTIONARY[locale]
      try {
        const payload = await getPayload({ config: configPromise })
        const res = await payload.find({
          collection: 'faqs',
          depth: 0,
          limit: 100,
          locale: locale as any,
          overrideAccess: true,
          sort: 'order',
        })

        if (res?.docs?.length) {
          const items: FaqItem[] = res.docs.map((doc: any) => {
            const idx = FAQ_INDEX_BY_KEY.get(normalizeFaqKey(doc.question))
            const isEnglishFallback = locale !== 'en' && idx !== undefined
            const localized = idx !== undefined ? dict?.faqs?.[idx] : undefined
            const defaults = idx !== undefined ? FAQ_ITEMS[idx] : undefined
            return {
              q: isEnglishFallback && localized ? localized.q : doc.question || localized?.q || defaults?.q,
              a:
                idx === 0 || idx === 1
                  ? safeFaqAnswers(locale)[idx]
                  : isEnglishFallback && localized
                    ? localized.a
                    : doc.answer || localized?.a || defaults?.a,
            }
          })
          return { faqs: items }
        }
      } catch (err) {
        console.error('[storefront:getFaqData]', err)
      }
      const fallbackFaqs = dict?.faqs || FAQ_ITEMS
      return {
        faqs: fallbackFaqs.map((item, index) => ({
          ...item,
          ...(index === 0 || index === 1 ? { a: safeFaqAnswers(locale)[index] } : {}),
        })),
      }
    },
    ['storefront-faqs', locale],
    { revalidate: 300, tags: ['faqs', `faqs-${locale}`] },
  )()
})

/**
 * Retrieve HowItWorks 6-step dataset from CMS with fallback.
 */
export const getHowItWorksData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const dict = I18N_DICTIONARY[locale]
      try {
        const payload = await getPayload({ config: configPromise })
        const hiw = await payload.findGlobal({
          slug: 'how-it-works',
          depth: 1,
          locale: locale as any,
          overrideAccess: true,
        })
        if (hiw?.steps && hiw.steps.length > 0) {
          const isEnglishFallback =
            locale !== 'en' && hiw.steps[0]?.title === 'Made-to-Order & Fresh-Pressed'
          if (isEnglishFallback && dict?.howItWorks) {
            return {
              hero: dict.howItWorks.hero,
              steps: dict.howItWorks.steps,
            }
          }
          return {
            hero: hiw.hero || dict?.howItWorks.hero || null,
            steps: hiw.steps,
          }
        }
      } catch (err) {
        console.error('[storefront:getHowItWorksData]', err)
      }
      return {
        hero: dict?.howItWorks.hero || null,
        steps: dict?.howItWorks.steps || [],
      }
    },
    ['storefront-how-it-works', locale],
    { revalidate: 300, tags: ['how-it-works', `how-it-works-${locale}`] },
  )()
})

/**
 * Retrieve global site layout configuration (Header, Footer, Announcement)
 */
export const getSiteLayoutData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const dict = I18N_DICTIONARY[locale]
      try {
        const payload = await getPayload({ config: configPromise })
        const [h, f, a] = await Promise.all([
          payload.findGlobal({
            slug: 'header',
            depth: 1,
            locale: locale as any,
            overrideAccess: true,
          }),
          payload.findGlobal({
            slug: 'footer',
            depth: 1,
            locale: locale as any,
            overrideAccess: true,
          }),
          payload.findGlobal({
            slug: 'announcement',
            depth: 1,
            locale: locale as any,
            overrideAccess: true,
          }),
        ])

        const isHeaderFallback =
          locale !== 'en' && h?.navItems?.[0]?.label === '1-Bedroom Kit'
        const resolvedHeader =
          isHeaderFallback && dict?.header
            ? { ...h, navItems: dict.header.navItems, showAnnouncement: true }
            : h || (dict ? { navItems: dict.header.navItems, showAnnouncement: true } : null)

        const isFooterFallback =
          locale !== 'en' && f?.brandSlogan?.includes('6 Boxes')
        const resolvedFooter: any =
          isFooterFallback && dict?.footer
            ? {
                ...f,
                brandSlogan: dict.footer.brandSlogan,
                copyrightText: dict.footer.copyrightText,
                navItems: dict.footer.navItems,
                socialLinks: (f as any)?.socialLinks || [],
              }
            : f ||
              (dict
                ? {
                    brandSlogan: dict.footer.brandSlogan,
                    copyrightText: dict.footer.copyrightText,
                    navItems: dict.footer.navItems,
                    socialLinks: [],
                  }
                : null)

        return {
          announcement: a || null,
          footer: resolvedFooter,
          header: resolvedHeader,
        }
      } catch (err) {
        console.error('[storefront:getSiteLayoutData]', err)
        return {
          announcement: null,
          footer: dict
            ? {
                brandSlogan: dict.footer.brandSlogan,
                copyrightText: dict.footer.copyrightText,
                navItems: dict.footer.navItems,
                socialLinks: [],
              }
            : null,
          header: dict ? { navItems: dict.header.navItems, showAnnouncement: true } : null,
        }
      }
    },
    ['storefront-site-layout', locale],
    { revalidate: 300, tags: ['layout', 'header', 'footer', 'announcement'] },
  )()
})

export type SearchIndexProduct = {
  title: string
  subtitle?: string | null
  slug: string
}

/**
 * Retrieve the lightweight product index used by the header search modal
 * (title/subtitle/slug only — never the cost fields stripInternalFields guards).
 */
export const getSearchIndexData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        const res = await payload.find({
          collection: 'products',
          depth: 0,
          limit: 20,
          locale: locale as any,
          overrideAccess: true,
          select: { title: true, subtitle: true, slug: true },
        })
        return (res?.docs || [])
          .filter((doc) => doc.slug)
          .map((doc) => stripInternalFields(doc)) as SearchIndexProduct[]
      } catch (err) {
        console.error('[storefront:getSearchIndexData]', err)
        return []
      }
    },
    ['storefront-search-index', locale],
    { revalidate: 300, tags: ['products', `products-${locale}`] },
  )()
})

/**
 * Retrieve materials (fabrics, woods) from CMS
 */
export const getMaterialsData = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        const res = await payload.find({
          collection: 'materials',
          depth: 1,
          limit: 30,
          locale: locale as any,
          overrideAccess: true,
        })
        return res?.docs || []
      } catch (err) {
        console.error('[storefront:getMaterialsData]', err)
        return []
      }
    },
    ['storefront-materials', locale],
    { revalidate: 300, tags: ['materials', `materials-${locale}`] },
  )()
})
