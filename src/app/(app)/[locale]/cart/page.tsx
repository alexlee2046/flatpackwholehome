import { CartView } from '@/components/moduliv/CartView'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.Cart')

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/cart',
    title: t('title'),
  })
}

export default async function CartPage() {
  return (
    <>
      <ModulivHeader />
      <CartView />
      <ModulivFooter />
    </>
  )
}
