import { FaqView } from '@/components/moduliv/FaqView'
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
      <ModulivHeader />
      <FaqView />
      <ModulivFooter />
    </>
  )
}
