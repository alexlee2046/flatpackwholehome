import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd'
import { KitBuilder } from '@/components/moduliv/KitBuilder'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getKitBuilderData } from '@/lib/data/storefront'
import {
  getStorefrontOfferPrice,
  normalizeStorefrontCheckoutProduct,
} from '@/lib/commerce/catalogEligibility'
import { readCheckoutConfig } from '@/lib/commerce/checkoutConfig'
import { normalizeStorefrontVariants } from '@/lib/commerce/storefrontCart'
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
    image: '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
    locale,
    pathname: '/1-bedroom-kit-builder',
    title,
  })
}

export default async function KitBuilderPage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const [{ bundleProduct, livingProduct, bedProduct, spaces, materials }, tCommon, tKit] =
    await Promise.all([
      getKitBuilderData(locale),
      getTranslations({ locale, namespace: 'Common' }),
      getTranslations({ locale, namespace: 'Pages.KitBuilder' }),
    ])

  const checkoutConfig = readCheckoutConfig()
  const normalizeProduct = (product: typeof bundleProduct) => {
    if (!product) return null
    const variants = normalizeStorefrontVariants(product.variants)
    return {
      ...product,
      checkout: normalizeStorefrontCheckoutProduct(product, 'catalog'),
      variants,
    }
  }
  const normalizedBundleProduct = normalizeProduct(bundleProduct)
  const normalizedLivingProduct = normalizeProduct(livingProduct)
  const normalizedBedProduct = normalizeProduct(bedProduct)
  const bundleOfferPrice = normalizedBundleProduct
    ? getStorefrontOfferPrice(normalizedBundleProduct.checkout, normalizedBundleProduct.variants)
    : undefined
  // Do not publish merchant Offer markup while checkout is deliberately closed.
  const includeBundleOffer = checkoutConfig.enabled && bundleOfferPrice !== undefined

  return (
    <>
      <ProductJsonLd
        category="Furniture > Whole Home"
        currency="USD"
        description={bundleProduct?.subtitle || bundleProduct?.title || tKit('title')}
        image="/assets/1-bedroom-kit-builder/b4e5f4d8a0.png"
        includeOffer={includeBundleOffer}
        inStock={includeBundleOffer}
        locale={locale}
        name={bundleProduct?.title || tKit('title')}
        price={includeBundleOffer ? bundleOfferPrice / 100 : undefined}
        sku="TFS-BUNDLE-1BED"
        url="/1-bedroom-kit-builder"
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: tCommon('home'), url: '/' },
          { name: tKit('title'), url: '/1-bedroom-kit-builder' },
        ]}
      />
      <SiteHeader locale={locale} />
      <KitBuilder
        bedProduct={normalizedBedProduct as any}
        bundleProduct={normalizedBundleProduct as any}
        checkoutEnabled={checkoutConfig.enabled}
        livingProduct={normalizedLivingProduct as any}
        materials={materials as any}
        spaces={spaces as any}
      />
      <SiteFooter locale={locale} />
    </>
  )
}
