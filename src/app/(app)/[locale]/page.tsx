import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { ModulivHomepage } from '@/components/moduliv/ModulivHomepage'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getHomePageData } from '@/lib/data/storefront'
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
  const t = await getTranslations({ locale, namespace: 'Pages.Home' })

  return buildPageMetadata({
    description: t('metadataDescription'),
    locale,
    pathname: '/',
    title: t('metadataTitle'),
  })
}

export default async function HomePage({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const { homepage, announcement, kitProduct } = await getHomePageData(locale)
  const hp = homepage as any

  return (
    <>
      <SiteHeader locale={locale} />
      <ModulivHomepage
        announcement={announcement?.message || undefined}
        bundlePrice={kitProduct?.priceInUSD || undefined}
        bundleSubtitle={kitProduct?.subtitle || undefined}
        bundleTitle={kitProduct?.title || undefined}
        comparisonMatrix={hp?.comparisonMatrix || undefined}
        heroBody={hp?.hero?.body || undefined}
        heroEyebrow={hp?.hero?.eyebrow || undefined}
        heroHeadline={hp?.hero?.headline || undefined}
        heroImage={hp?.hero?.image || undefined}
        testimonials={hp?.testimonials || undefined}
        trustPillars={hp?.trustPillars || undefined}
      />
      <SiteFooter locale={locale} />
    </>
  )
}
