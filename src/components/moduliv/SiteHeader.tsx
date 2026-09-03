import { getSiteLayoutData } from '@/lib/data/storefront'
import { GeoSuggestionBanner } from './GeoSuggestionBanner'
import { ModulivHeader } from './ModulivHeader'
import React from 'react'

export async function SiteHeader({ locale }: { locale: string }) {
  const { header, announcement } = await getSiteLayoutData(locale)

  return (
    <>
      <GeoSuggestionBanner currentLocale={locale} />
      <ModulivHeader
        announcementMessage={announcement?.enabled !== false ? announcement?.message : null}
        announcementUrl={announcement?.linkURL}
        navItems={header?.navItems as any}
        showAnnouncement={header?.showAnnouncement !== false && announcement?.enabled !== false}
      />
    </>
  )
}
