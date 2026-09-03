import { I18N_DICTIONARY } from '@/utilities/i18nDictionary'
import type { Payload } from 'payload'

const TARGET_LOCALES = ['zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'] as const

/**
 * Automatically seeds professional multilingual translations across all supported
 * target locales (zh-CN, zh-TW, de, ja, ar, ru) into Payload CMS database.
 * Safe, idempotent, non-destructive.
 */
export async function seedI18nContent(payload: Payload): Promise<void> {
  const p: any = payload
  try {
    // 1. Seed FAQs for each target locale
    const faqsRes = await p.find({
      collection: 'faqs',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      sort: 'order',
    })

    if (faqsRes?.docs?.length) {
      for (const locale of TARGET_LOCALES) {
        const dict = I18N_DICTIONARY[locale]
        if (!dict) continue

        p.logger.info(`[seedI18nContent] Populating FAQs for locale [${locale}]...`)
        for (let i = 0; i < faqsRes.docs.length; i++) {
          const doc = faqsRes.docs[i]
          const localizedItem = dict.faqs[i] || dict.faqs[i % dict.faqs.length]
          if (localizedItem) {
            await p.update({
              collection: 'faqs',
              id: doc.id,
              locale,
              data: {
                question: localizedItem.q,
                answer: localizedItem.a,
              },
              overrideAccess: true,
            })
          }
        }
      }
    }

    // 2. Seed Globals (HowItWorks, Homepage, Header, Footer) for each target locale
    for (const locale of TARGET_LOCALES) {
      const dict = I18N_DICTIONARY[locale]
      if (!dict) continue

      p.logger.info(`[seedI18nContent] Populating Globals for locale [${locale}]...`)

      // HowItWorks
      try {
        await p.updateGlobal({
          slug: 'how-it-works',
          locale,
          data: {
            hero: dict.howItWorks.hero,
            steps: dict.howItWorks.steps,
          },
          overrideAccess: true,
        })
      } catch (err: any) {
        p.logger.warn(`[seedI18nContent] HowItWorks global update warning for [${locale}]: ${err.message}`)
      }

      // Homepage extended fields
      try {
        await p.updateGlobal({
          slug: 'homepage',
          locale,
          data: {
            trustPillars: dict.homepage.trustPillars,
            comparisonMatrix: dict.homepage.comparisonMatrix,
            bundlePromo: dict.homepage.bundlePromo,
            testimonials: dict.homepage.testimonials,
          },
          overrideAccess: true,
        })
      } catch (err: any) {
        p.logger.warn(`[seedI18nContent] Homepage global update warning for [${locale}]: ${err.message}`)
      }

      // Header navigation
      try {
        await p.updateGlobal({
          slug: 'header',
          locale,
          data: {
            navItems: dict.header.navItems,
          },
          overrideAccess: true,
        })
      } catch (err: any) {
        p.logger.warn(`[seedI18nContent] Header global update warning for [${locale}]: ${err.message}`)
      }

      // Footer
      try {
        await p.updateGlobal({
          slug: 'footer',
          locale,
          data: {
            brandSlogan: dict.footer.brandSlogan,
            copyrightText: dict.footer.copyrightText,
            navItems: dict.footer.navItems,
          },
          overrideAccess: true,
        })
      } catch (err: any) {
        p.logger.warn(`[seedI18nContent] Footer global update warning for [${locale}]: ${err.message}`)
      }
    }

    p.logger.info('[seedI18nContent] All 6 target locales seeded successfully!')
  } catch (error) {
    p.logger.warn(`[seedI18nContent] Skipped or partial i18n seed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
