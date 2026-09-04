import { getSearchIndexData, getSiteLayoutData } from '@/lib/data/storefront'
import { GeoSuggestionBanner } from './GeoSuggestionBanner'
import { ModulivHeader } from './ModulivHeader'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export async function SiteHeader({ locale }: { locale: string }) {
  const [{ header, announcement }, searchProducts, tAnnouncement] = await Promise.all([
    getSiteLayoutData(locale),
    getSearchIndexData(locale),
    getTranslations({ locale, namespace: 'Announcement' }),
  ])

  const rawAnnouncement = announcement?.message?.trim() || ''
  const isSwatchAnnouncement = /swatch|样板|樣板|muster|サンプル|عينات|образц/i.test(rawAnnouncement)
  const announcementMessage = isSwatchAnnouncement || !rawAnnouncement
    ? tAnnouncement('bar')
    : rawAnnouncement

  return (
    <>
      <GeoSuggestionBanner currentLocale={locale} />
      <ModulivHeader
        announcementMessage={announcement?.enabled !== false ? announcementMessage : null}
        announcementUrl={announcement?.linkURL}
        navItems={header?.navItems as any}
        searchProducts={searchProducts}
        showAnnouncement={header?.showAnnouncement !== false && announcement?.enabled !== false}
      />
    </>
  )
}
