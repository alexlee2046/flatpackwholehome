import { getSiteLayoutData } from '@/lib/data/storefront'
import { ModulivFooter } from './ModulivFooter'
import React from 'react'

export async function SiteFooter({ locale }: { locale: string }) {
  const { footer } = await getSiteLayoutData(locale)

  return (
    <ModulivFooter
      brandSlogan={footer?.brandSlogan}
      copyrightText={footer?.copyrightText}
      navItems={footer?.navItems as any}
      socialLinks={footer?.socialLinks as any}
    />
  )
}
