import * as rootParams from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const requestedLocale = await rootParams.locale()

    if (!hasLocale(routing.locales, requestedLocale)) notFound()
    locale = requestedLocale
  }

  const [messages, pages, policies] = await Promise.all([
    import(`../../messages/${locale}.json`).then((module) => module.default),
    import(`../../messages/pages/${locale}.json`).then((module) => module.default),
    import(`../../messages/policies/${locale}.json`).then((module) => module.default),
  ])

  return {
    locale,
    messages: { ...messages, Pages: pages, Policies: policies },
    timeZone: 'UTC',
  }
})
