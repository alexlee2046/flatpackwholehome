import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { IkeaComparisonView } from '@/components/moduliv/IkeaComparisonView'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const tNav = await getTranslations('Navigation')

  return buildPageMetadata({
    description: 'Compare The Flat Set whole-home 6-box system with local US brick-and-mortar IKEA. 20.8% below IKEA tag price, 31.5% below landed in-store cost.',
    locale,
    pathname: '/us-vs-ikea',
    title: `${tNav('usVsIkea')} | The Flat Set`,
  })
}

export default async function UsVsIkeaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Why We Are 20% Cheaper Than IKEA', url: '/us-vs-ikea' },
        ]}
      />
      <ModulivHeader />
      <IkeaComparisonView />
      <ModulivFooter />
    </>
  )
}
