import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { SwatchView } from '@/components/moduliv/SwatchView'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.Swatch')

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/free-swatch-box-material-discovery',
    title: t('title'),
  })
}

export default async function SwatchPage() {
  return (
    <>
      <ModulivHeader />
      <SwatchView />
      <ModulivFooter />
    </>
  )
}
