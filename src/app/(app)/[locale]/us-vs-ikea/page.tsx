import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { IkeaComparisonView } from '@/components/moduliv/IkeaComparisonView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
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
  const tNav = await getTranslations({ locale, namespace: 'Navigation' })

  return buildPageMetadata({
    description:
      'Compare The Flat Set whole-home 6-box system with local US brick-and-mortar IKEA. 20.8% below IKEA tag price, 31.5% below landed in-store cost.',
    image: '/assets/homepage/hero-split.png',
    locale,
    pathname: '/us-vs-ikea',
    title: tNav('usVsIkea'),
  })
}

export default async function UsVsIkeaPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const [tCommon, tNav] = await Promise.all([
    getTranslations({ locale, namespace: 'Common' }),
    getTranslations({ locale, namespace: 'Navigation' }),
  ])

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: tCommon('home'), url: '/' },
          { name: tNav('usVsIkea'), url: '/us-vs-ikea' },
        ]}
      />
      <SiteHeader locale={locale} />
      <IkeaComparisonView />
      <SiteFooter locale={locale} />
    </>
  )
}
