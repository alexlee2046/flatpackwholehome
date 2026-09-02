import { hasLocale } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { defaultLocale, routing, type AppLocale } from './routing'

export async function getPayloadLocale(): Promise<AppLocale> {
  const requestedLocale = await getLocale()
  return hasLocale(routing.locales, requestedLocale)
    ? (requestedLocale as AppLocale)
    : defaultLocale
}
