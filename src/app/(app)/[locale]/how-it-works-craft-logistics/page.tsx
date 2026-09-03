import { HowItWorksView } from '@/components/moduliv/HowItWorksView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getHowItWorksData } from '@/lib/data/storefront'
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
  const t = await getTranslations({ locale, namespace: 'Pages.HowItWorks' })
  const { hero } = await getHowItWorksData(locale)

  return buildPageMetadata({
    description: hero?.subtitle || t('subtitle'),
    locale,
    pathname: '/how-it-works-craft-logistics',
    title: hero?.title || t('title'),
  })
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const { hero, steps } = await getHowItWorksData(locale)

  return (
    <>
      <SiteHeader locale={locale} />
      <HowItWorksView hero={hero as any} steps={steps as any} />
      <SiteFooter locale={locale} />
    </>
  )
}
