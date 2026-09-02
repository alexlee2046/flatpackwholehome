import { KitBuilder } from '@/components/moduliv/KitBuilder'
import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
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
  const t = await getTranslations('Pages.KitBuilder')
  let title = t('title')
  let description = t('subtitle')

  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      locale,
      overrideAccess: true,
      where: { slug: { equals: '1-bedroom-kit' } },
    })
    if (res.docs[0]) {
      if (res.docs[0].title) title = res.docs[0].title
      if (res.docs[0].subtitle) description = res.docs[0].subtitle
    }
  } catch {
    // fallback
  }

  return buildPageMetadata({
    description,
    locale,
    pathname: '/1-bedroom-kit-builder',
    title,
  })
}

export default async function KitBuilderPage() {
  await connection()
  const locale = await getPayloadLocale()

  let bundleProduct: any = null
  let livingProduct: any = null
  let bedProduct: any = null
  let spaces: any[] = []
  let materials: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const [productsRes, spacesRes, materialsRes] = await Promise.all([
      payload.find({
        collection: 'products',
        depth: 1,
        limit: 10,
        locale,
        overrideAccess: true,
        where: {
          slug: { in: ['1-bedroom-kit', 'modusofa', 'snapbed'] },
        },
      }),
      payload.find({
        collection: 'spaces',
        depth: 1,
        limit: 10,
        locale,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'materials',
        depth: 1,
        limit: 10,
        locale,
        overrideAccess: true,
      }),
    ])

    bundleProduct = productsRes.docs.find((p) => p.slug === '1-bedroom-kit') || null
    livingProduct = productsRes.docs.find((p) => p.slug === 'modusofa') || null
    bedProduct = productsRes.docs.find((p) => p.slug === 'snapbed') || null
    spaces = spacesRes.docs
    materials = materialsRes.docs
  } catch {
    // fallback when DB is unreachable
  }

  return (
    <>
      <ModulivHeader />
      <KitBuilder
        bedProduct={bedProduct}
        bundleProduct={bundleProduct}
        livingProduct={livingProduct}
        materials={materials}
        spaces={spaces}
      />
      <ModulivFooter />
    </>
  )
}
