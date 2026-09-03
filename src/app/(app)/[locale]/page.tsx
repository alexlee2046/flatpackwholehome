import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { ModulivHomepage } from '@/components/moduliv/ModulivHomepage'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getHomePageData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPayloadLocale()
  const t = await getTranslations('Pages.Home')

  return buildPageMetadata({
    description: t('metadataDescription'),
    locale,
    pathname: '/',
    title: t('metadataTitle'),
  })
}

export default async function HomePage() {
  const locale = await getPayloadLocale()
  const { homepage, announcement, kitProduct } = await getHomePageData(locale)

  return (
    <>
      <SiteHeader locale={locale} />
      <ModulivHomepage
        announcement={announcement?.message || undefined}
        bundlePrice={kitProduct?.priceInUSD || undefined}
        bundleSubtitle={kitProduct?.subtitle || undefined}
        bundleTitle={kitProduct?.title || undefined}
        comparisonMatrix={(homepage as any)?.comparisonMatrix || undefined}
        heroBody={homepage?.hero?.body || undefined}
        heroEyebrow={homepage?.hero?.eyebrow || undefined}
        heroHeadline={homepage?.hero?.headline || undefined}
        heroImage={(homepage?.hero?.image as any) || undefined}
        testimonials={(homepage as any)?.testimonials || undefined}
        trustPillars={(homepage as any)?.trustPillars || undefined}
      />
      <SiteFooter locale={locale} />
    </>
  )
}

