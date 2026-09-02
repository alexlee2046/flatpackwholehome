import type { Metadata } from 'next'

import { getAbsoluteLocaleURL, getLocalizedAlternates, getOpenGraphLocales } from './metadata'
import type { AppLocale } from './routing'

type PageMetadataArgs = {
  availableLocales?: readonly AppLocale[]
  description: string
  index?: boolean
  locale: AppLocale
  pathname: string
  title: string
}

export function buildPageMetadata({
  availableLocales,
  description,
  index = true,
  locale,
  pathname,
  title,
}: PageMetadataArgs): Metadata {
  const url = getAbsoluteLocaleURL(locale, pathname)

  return {
    alternates: getLocalizedAlternates(locale, pathname, availableLocales),
    description,
    openGraph: {
      description,
      siteName: 'The Flat Set',
      title,
      type: 'website',
      url,
      ...getOpenGraphLocales(locale, availableLocales),
    },
    robots: {
      follow: index,
      index,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      title,
    },
  }
}
