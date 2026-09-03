import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { SwatchView } from '@/components/moduliv/SwatchView'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getMaterialsData } from '@/lib/data/storefront'
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
  const t = await getTranslations({ locale, namespace: 'Pages.Swatch' })

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/free-swatch-box-material-discovery',
    title: t('title'),
  })
}

export default async function SwatchPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const materials = await getMaterialsData(locale)

  return (
    <>
      <SiteHeader locale={locale} />
      <SwatchView materials={materials as any} />
      <SiteFooter locale={locale} />
    </>
  )
}
