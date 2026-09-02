import type { Metadata } from 'next'

import { getAbsoluteLocaleURL, getLocalizedAlternates, getOpenGraphLocales } from '@/i18n/metadata'
import type { AppLocale } from '@/i18n/routing'
import type { Page, Product } from '@/payload-types'

export const generateMeta = async ({
  availableLocales,
  doc,
  locale,
  pathname,
}: {
  availableLocales?: readonly AppLocale[]
  doc: Page | Product | null
  locale: AppLocale
  pathname: string
}): Promise<Metadata> => {
  if (!doc) {
    return { robots: { follow: false, index: false } }
  }

  const title = doc.meta?.title || doc.title || 'MODULIV'
  const description = doc.meta?.description || undefined
  const media = typeof doc.meta?.image === 'object' ? doc.meta.image : null
  const imageURL = media?.url
    ? new URL(media.url, process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').toString()
    : undefined

  return {
    alternates: getLocalizedAlternates(locale, pathname, availableLocales),
    description,
    openGraph: {
      description,
      images: imageURL ? [{ alt: media?.alt || title, url: imageURL }] : undefined,
      siteName: 'MODULIV',
      title,
      type: 'website',
      url: getAbsoluteLocaleURL(locale, pathname),
      ...getOpenGraphLocales(locale, availableLocales),
    },
    title,
  }
}
