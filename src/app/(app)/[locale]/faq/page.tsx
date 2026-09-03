import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd'
import { FaqView } from '@/components/moduliv/FaqView'
import { FAQ_ITEMS } from '@/data/faq'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.FAQ')

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/faq',
    title: t('title'),
  })
}

export default async function FaqPage() {
  return (
    <>
      <FaqJsonLd items={FAQ_ITEMS} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Frequently Asked Questions', url: '/faq' },
        ]}
      />
      <ModulivHeader />
      <FaqView />
      <ModulivFooter />
    </>
  )
}
