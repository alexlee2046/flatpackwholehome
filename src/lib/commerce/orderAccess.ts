import { getLocalePathname } from '@/i18n/metadata'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'

export function resolveOrderLocale(...candidates: unknown[]): AppLocale {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && locales.includes(candidate as AppLocale)) {
      return candidate as AppLocale
    }
  }
  return defaultLocale
}

export function buildOrderAccessURL({
  accessToken,
  locale,
  orderID,
  serverURL,
}: {
  accessToken: string
  locale: AppLocale
  orderID: number | string
  serverURL: string
}) {
  const orderPath = getLocalePathname(locale, `/orders/${orderID}`)
  const orderURL = new URL(orderPath, serverURL)
  orderURL.searchParams.set('accessToken', accessToken)
  return orderURL
}
