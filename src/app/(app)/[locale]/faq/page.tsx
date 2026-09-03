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
    locale,
    pathname: '/faq',
    title: t('title'),
  })
}

export default async function FaqPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const { faqs } = await getFaqData(locale)

  return (
    <>
      <FaqJsonLd items={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Frequently Asked Questions', url: '/faq' },
        ]}
      />
      <SiteHeader locale={locale} />
      <FaqView items={faqs} />
      <SiteFooter locale={locale} />
    </>
  )
}
