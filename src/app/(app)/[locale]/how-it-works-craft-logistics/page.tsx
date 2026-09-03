import { HowItWorksView } from '@/components/moduliv/HowItWorksView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getHowItWorksData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.HowItWorks')
  const { hero } = await getHowItWorksData(locale)

  return buildPageMetadata({
    description: hero?.subtitle || t('subtitle'),
    locale,
    pathname: '/how-it-works-craft-logistics',
    title: hero?.title || t('title'),
  })
}

export default async function HowItWorksPage() {
  const locale = await getPayloadLocale()
  const { hero, steps } = await getHowItWorksData(locale)

  return (
    <>
      <SiteHeader locale={locale} />
      <HowItWorksView hero={hero as any} steps={steps as any} />
      <SiteFooter locale={locale} />
    </>
  )
}
