import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd'
import { KitBuilder } from '@/components/moduliv/KitBuilder'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getKitBuilderData } from '@/lib/data/storefront'
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
  const t = await getTranslations({ locale, namespace: 'Pages.KitBuilder' })
  let title = t('title')
  if (title === '1-Bedroom Move-In Kit Builder') {
    title = '1-Bedroom Flat-Pack Furniture Kit Builder | ModuSofa & SnapBed'
  }

  return buildPageMetadata({
    description: t('subtitle'),
    locale,
    pathname: '/1-bedroom-kit-builder',
    title,
  })
}

export default async function KitBuilderPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const { bundleProduct, livingProduct, bedProduct, spaces, materials } =
    await getKitBuilderData(locale)

  return (
    <>
      <ProductJsonLd
        currency="USD"
        description={bundleProduct?.subtitle || 'Move-In 1-Bedroom Bundle. 6 flat boxes, tool-free 60-minute assembly, DDP duties included.'}
        image="/assets/1-bedroom-kit-builder/b4e5f4d8a0.png"
        inStock={true}
        name={bundleProduct?.title || 'Move-In 1-Bedroom Bundle'}
        price={bundleProduct?.priceInUSD || 1499}
        sku="TFS-BUNDLE-1BED"
        url="/1-bedroom-kit-builder"
        locale={locale}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: '1-Bedroom Kit Builder', url: '/1-bedroom-kit-builder' },
        ]}
      />
      <SiteHeader locale={locale} />
      <KitBuilder
        bedProduct={bedProduct as any}
        bundleProduct={bundleProduct as any}
        livingProduct={livingProduct as any}
        materials={materials as any}
        spaces={spaces as any}
      />
      <SiteFooter locale={locale} />
    </>
  )
}
