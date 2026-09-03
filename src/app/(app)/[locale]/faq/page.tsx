import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd'
import { FaqView } from '@/components/moduliv/FaqView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getFaqData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Pages.FAQ' })

  return buildPageMetadata({
    description: t('subtitle'),
    image: '/assets/homepage/hero-split.png',
    locale,
    pathname: '/faq',
    title: t('title'),
  })
}

export default async function FaqPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const [{ faqs }, tCommon, tFaq] = await Promise.all([
    getFaqData(locale),
    getTranslations({ locale, namespace: 'Common' }),
    getTranslations({ locale, namespace: 'Pages.FAQ' }),
  ])

  return (
    <>
      <FaqJsonLd items={faqs} locale={locale} />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: tCommon('home'), url: '/' },
          { name: tFaq('title'), url: '/faq' },
        ]}
      />
      <SiteHeader locale={locale} />
      <FaqView items={faqs} />
      <SiteFooter locale={locale} />
    </>
  )
}
