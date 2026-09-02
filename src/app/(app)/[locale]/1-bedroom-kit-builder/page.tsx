import { KitBuilder } from '@/components/moduliv/KitBuilder'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getKitBuilderData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.KitBuilder')
  let title = t('title')
  let description = t('subtitle')

  const { bundleProduct } = await getKitBuilderData(locale)
  if (bundleProduct) {
    if (bundleProduct.title) title = bundleProduct.title
    if (bundleProduct.subtitle) description = bundleProduct.subtitle
  }

  return buildPageMetadata({
    description,
    locale,
    pathname: '/1-bedroom-kit-builder',
    title,
  })
}

export default async function KitBuilderPage() {
  const locale = await getPayloadLocale()
  const { bundleProduct, livingProduct, bedProduct, spaces, materials } =
    await getKitBuilderData(locale)

  return (
    <>
      <ModulivHeader />
      <KitBuilder
        bedProduct={bedProduct as any}
        bundleProduct={bundleProduct as any}
        livingProduct={livingProduct as any}
        materials={materials as any}
        spaces={spaces as any}
      />
      <ModulivFooter />
    </>
  )
}
