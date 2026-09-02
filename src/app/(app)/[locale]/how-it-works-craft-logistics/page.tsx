import { HowItWorksView } from '@/components/moduliv/HowItWorksView'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.HowItWorks')

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/how-it-works-craft-logistics',
    title: t('title'),
  })
}

export default async function HowItWorksPage() {
  return (
    <>
      <ModulivHeader />
      <HowItWorksView />
      <ModulivFooter />
    </>
  )
}
