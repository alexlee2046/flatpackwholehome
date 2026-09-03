import type { Metadata } from 'next'

import { getAbsoluteLocaleURL, getLocalizedAlternates, getOpenGraphLocales } from './metadata'
import type { AppLocale } from './routing'
import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'

type PageMetadataArgs = {
  availableLocales?: readonly AppLocale[]
  description: string
  image?: string
  index?: boolean
  locale: AppLocale
  pathname: string
  title: string
}

export function buildPageMetadata({
  availableLocales,
  description,
  image,
  index = true,
  locale,
  pathname,
  title,
}: PageMetadataArgs): Metadata {
  const url = getAbsoluteLocaleURL(locale, pathname)
  const defaultImage = '/assets/homepage/hero-split.png'
  const rawImage = image || defaultImage
  const baseUrl = getCanonicalSiteURL().replace(/\/$/, '')
  const absoluteImageUrl = rawImage.startsWith('http')
    ? rawImage
    : `${baseUrl}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`

  return {
    alternates: getLocalizedAlternates(locale, pathname, availableLocales),
    description,
    openGraph: {
      description,
      images: [
        {
          alt: title,
          height: 630,
          url: absoluteImageUrl,
          width: 1200,
        },
      ],
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
      images: [absoluteImageUrl],
      title,
    },
  }
}
