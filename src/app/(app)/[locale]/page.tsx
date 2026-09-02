import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { ModulivHomepage } from '@/components/moduliv/ModulivHomepage'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
  const locale = await getPayloadLocale()
  const payload = await getPayload({ config: configPromise })

  const [homepage, announcement] = await Promise.all([
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
  ])

  return (
    <>
      <ModulivHeader />
      <ModulivHomepage
        announcement={announcement?.message || undefined}
        heroBody={homepage?.hero?.body || undefined}
        heroEyebrow={homepage?.hero?.eyebrow || undefined}
        heroHeadline={homepage?.hero?.headline || undefined}
      />
      <ModulivFooter />
    </>
  )
}
