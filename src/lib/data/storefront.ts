import { FAQ_ITEMS, type FaqItem } from '@/data/faq'
import { I18N_DICTIONARY } from '@/utilities/i18nDictionary'
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
      const dict = I18N_DICTIONARY[locale]
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

        const isEnglishFallback =
          locale !== 'en' && (h as any)?.trustPillars?.[0]?.label === 'Whole Apartment Suite'

        const resolvedHome =
          isEnglishFallback && dict?.homepage
            ? {
                ...h,
                bundlePromo: dict.homepage.bundlePromo,
                comparisonMatrix: dict.homepage.comparisonMatrix,
                testimonials: dict.homepage.testimonials,
                trustPillars: dict.homepage.trustPillars,
              }
            : h || (dict ? dict.homepage : null)

        return {
          announcement: a,
          homepage: resolvedHome,
          kitProduct: kitProductRes?.docs?.[0] || null,
        }
      } catch {
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
            limit: 20,
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
          const items: FaqItem[] = res.docs.map((doc: any, idx: number) => {
            const isEnglishFallback =
              locale !== 'en' && doc.question === FAQ_ITEMS[idx]?.q
            const localized = dict?.faqs?.[idx]
            return {
              q: isEnglishFallback && localized ? localized.q : doc.question || localized?.q || FAQ_ITEMS[idx]?.q,
              a: isEnglishFallback && localized ? localized.a : doc.answer || localized?.a || FAQ_ITEMS[idx]?.a,
            }
          })
          return { faqs: items }
        }
      } catch {
        // Fall back gracefully
      }
      return { faqs: dict?.faqs || FAQ_ITEMS }
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
      } catch {
        // Fall back gracefully
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
      } catch {
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
      } catch {
        return []
      }
    },
    ['storefront-materials', locale],
    { revalidate: 300, tags: ['materials', `materials-${locale}`] },
  )()
})
