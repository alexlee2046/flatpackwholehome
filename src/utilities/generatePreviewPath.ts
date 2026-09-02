export type PreviewSearchParams = {
  path: string
  previewSecret: string
}
import { getLocalePathname } from '@/i18n/metadata'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: '',
  products: '/products',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, req, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const requestedLocale = req.locale as AppLocale
  const locale = locales.includes(requestedLocale) ? requestedLocale : defaultLocale
  const pathname = `${collectionPrefixMap[collection]}/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    path: getLocalePathname(locale, pathname),
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
