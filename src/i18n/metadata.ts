import type { Metadata } from 'next'

import { defaultLocale, localeDetails, locales, type AppLocale } from './routing'
import { getCanonicalSiteURL } from '@/utilities/canonicalUrl'

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === '/') return ''
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export const getLocalePathname = (locale: AppLocale, pathname = '/') => {
  const normalizedPathname = normalizePathname(pathname)
  return locale === defaultLocale ? normalizedPathname || '/' : `/${locale}${normalizedPathname}`
}

export const getAbsoluteLocaleURL = (locale: AppLocale, pathname = '/') =>
  new URL(getLocalePathname(locale, pathname), getCanonicalSiteURL()).toString()

export const getLanguageAlternates = (
  pathname = '/',
  availableLocales: readonly AppLocale[] = locales,
) => ({
  ...(availableLocales.includes(defaultLocale)
    ? { 'x-default': getAbsoluteLocaleURL(defaultLocale, pathname) }
    : {}),
  ...Object.fromEntries(
    availableLocales.map((locale) => [locale, getAbsoluteLocaleURL(locale, pathname)]),
  ),
})

export const getLocalizedAlternates = (
  locale: AppLocale,
  pathname = '/',
  availableLocales: readonly AppLocale[] = locales,
): NonNullable<Metadata['alternates']> => ({
  canonical: getAbsoluteLocaleURL(locale, pathname),
  languages: getLanguageAlternates(pathname, availableLocales),
})

export const getOpenGraphLocales = (
  locale: AppLocale,
  availableLocales: readonly AppLocale[] = locales,
) => ({
  alternateLocale: availableLocales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => localeDetails[candidate].openGraphLocale),
  locale: localeDetails[locale].openGraphLocale,
})
