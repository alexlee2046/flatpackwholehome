import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { CartView } from '@/components/moduliv/CartView'
import { readCheckoutConfig } from '@/lib/commerce/checkoutConfig'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
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
  const t = await getTranslations({ locale, namespace: 'Pages.Cart' })

  return buildPageMetadata({
    description: t('subtitle'),
    image: '/assets/homepage/hero-split.png',
    index: false,
    locale,
    pathname: '/cart',
    title: t('title'),
  })
}

export default async function CartPage({ params }: Props) {
  const checkoutConfig = readCheckoutConfig()
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const [tCommon, tNav] = await Promise.all([
    getTranslations({ locale, namespace: 'Common' }),
    getTranslations({ locale, namespace: 'Navigation' }),
  ])

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: tCommon('home'), url: '/' },
          { name: tNav('cart'), url: '/cart' },
        ]}
      />
      <SiteHeader locale={locale} />
      <CartView
        checkoutEnabled={checkoutConfig.enabled}
        publishableKey={checkoutConfig.publishableKey}
      />
      <SiteFooter locale={locale} />
    </>
  )
}
