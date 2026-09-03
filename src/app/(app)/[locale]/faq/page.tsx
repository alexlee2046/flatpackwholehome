import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd'
import { FaqView } from '@/components/moduliv/FaqView'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getFaqData } from '@/lib/data/storefront'
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
  const locale = await getPayloadLocale()
  const { faqs } = await getFaqData(locale)

  return (
    <>
      <FaqJsonLd items={faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Frequently Asked Questions', url: '/faq' },
        ]}
      />
      <SiteHeader locale={locale} />
      <FaqView items={faqs} />
      <SiteFooter locale={locale} />
    </>
  )
}
