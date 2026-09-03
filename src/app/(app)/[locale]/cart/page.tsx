import { CartView } from '@/components/moduliv/CartView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
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
  const locale = await getPayloadLocale()

  return (
    <>
      <SiteHeader locale={locale} />
      <CartView />
      <SiteFooter locale={locale} />
    </>
  )
}
