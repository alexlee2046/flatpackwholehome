import { I18N_DICTIONARY } from '@/utilities/i18nDictionary'
import type { Payload } from 'payload'

const TARGET_LOCALES = ['zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'] as const

/**
 * Seeds the bundled translations into Payload for the six non-English locales.
 *
 * onInit runs on every process start, so this only ever fills in fields that are
 * still empty for the locale being seeded. Writing unconditionally would mean an
 * editor's work in the admin panel is reverted by the next deploy or dev restart,
 * which is what this used to do despite claiming to be non-destructive.
 *
 * Emptiness is read with fallbackLocale: false — without it Payload hands back the
 * English value for an unset locale, and every field would look populated.
 */

type AnyPayload = any

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/** Returns only the entries whose current value for this locale is still unset. */
function pickUnset(current: Record<string, unknown> | null, incoming: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined) continue
    if (isEmptyValue(current?.[key])) out[key] = value
  }
  return out
}

async function seedGlobal(
  p: AnyPayload,
  slug: string,
  locale: string,
  incoming: Record<string, unknown>,
) {
  try {
    const current = await p.findGlobal({
      slug,
      depth: 0,
      fallbackLocale: false,
      locale,
      overrideAccess: true,
    })
    const data = pickUnset(current, incoming)
    if (Object.keys(data).length === 0) return
    await p.updateGlobal({ slug, data, locale, overrideAccess: true })
    p.logger.info(`[seedI18nContent] ${slug} [${locale}]: filled ${Object.keys(data).join(', ')}`)
  } catch (err: any) {
    p.logger.warn(`[seedI18nContent] ${slug} [${locale}] skipped: ${err?.message}`)
  }
}

export async function seedI18nContent(payload: Payload): Promise<void> {
  const p = payload as AnyPayload
  try {
    const faqsRes = await p.find({
      collection: 'faqs',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      sort: 'order',
    })
    const faqDocs = faqsRes?.docs ?? []

    for (const locale of TARGET_LOCALES) {
      const dict = I18N_DICTIONARY[locale]
      if (!dict) continue

      // The bundled translations are a positional list, so they only line up with
      // the CMS while the two have the same length. Once an editor adds or removes
      // a question the mapping is meaningless — skip rather than attach the wrong
      // translation to a question, which the previous `i % length` wraparound did.
      if (faqDocs.length !== dict.faqs.length) {
        p.logger.warn(
          `[seedI18nContent] faqs [${locale}] skipped: CMS has ${faqDocs.length} entries, bundled translations have ${dict.faqs.length}.`,
        )
      } else {
        for (let i = 0; i < faqDocs.length; i++) {
          const doc = faqDocs[i]
          const translated = dict.faqs[i]
          try {
            const current = await p.findByID({
              id: doc.id,
              collection: 'faqs',
              depth: 0,
              fallbackLocale: false,
              locale,
              overrideAccess: true,
            })
            const data = pickUnset(current, { answer: translated.a, question: translated.q })
            if (Object.keys(data).length === 0) continue
            await p.update({
              id: doc.id,
              collection: 'faqs',
              data,
              locale,
              overrideAccess: true,
            })
          } catch (err: any) {
            p.logger.warn(`[seedI18nContent] faq ${doc.id} [${locale}] skipped: ${err?.message}`)
          }
        }
      }

      await seedGlobal(p, 'how-it-works', locale, {
        hero: dict.howItWorks.hero,
        steps: dict.howItWorks.steps,
      })
      await seedGlobal(p, 'homepage', locale, {
        comparisonMatrix: dict.homepage.comparisonMatrix,
        testimonials: dict.homepage.testimonials,
      })
      await seedGlobal(p, 'header', locale, { navItems: dict.header.navItems })
      await seedGlobal(p, 'footer', locale, {
        brandSlogan: dict.footer.brandSlogan,
        copyrightText: dict.footer.copyrightText,
        navItems: dict.footer.navItems,
      })
    }
  } catch (error) {
    p.logger.warn(
      `[seedI18nContent] Skipped or partial i18n seed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
