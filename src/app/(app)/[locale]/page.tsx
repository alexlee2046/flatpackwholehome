import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { ModulivHomepage } from '@/components/moduliv/ModulivHomepage'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { connection } from 'next/server'
import { getPayload } from 'payload'
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
  await connection()
  const locale = await getPayloadLocale()
  let homepage: any = null
  let announcement: any = null
  let kitProduct: any = null

  try {
    const payload = await getPayload({ config: configPromise })
    const [h, a, kitProductRes] = await Promise.all([
      payload.findGlobal({
        slug: 'homepage',
        depth: 2,
        locale,
        overrideAccess: true,
      }),
      payload.findGlobal({
        slug: 'announcement',
        depth: 1,
        locale,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'products',
        depth: 0,
        limit: 1,
        locale,
        overrideAccess: true,
        where: { slug: { equals: '1-bedroom-kit' } },
      }),
    ])
    homepage = h
    announcement = a
    kitProduct = kitProductRes.docs[0] || null
  } catch (err) {
    // Fallback when DB is not reachable during build
  }

  return (
    <>
      <ModulivHeader />
      <ModulivHomepage
        announcement={announcement?.message || undefined}
        bundlePrice={kitProduct?.priceInUSD}
        bundleSubtitle={kitProduct?.subtitle}
        bundleTitle={kitProduct?.title}
        heroBody={homepage?.hero?.body || undefined}
        heroEyebrow={homepage?.hero?.eyebrow || undefined}
        heroHeadline={homepage?.hero?.headline || undefined}
        heroImage={homepage?.hero?.image || undefined}
      />
      <ModulivFooter />
    </>
  )
}
