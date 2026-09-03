import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

export default async function NotFound() {
  const locale = (await getLocale()) || routing.defaultLocale
  const t = await getTranslations('Transaction')
  const tError = await getTranslations('Errors')
  return (
    <>
      <SiteHeader locale={locale} />
      <main className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-24 text-center">
        <span className="font-label-md text-sm uppercase tracking-widest text-primary mb-3 block">
          {tError('notFoundEyebrow')}
        </span>
        <h1 className="font-display-lg text-[48px] md:text-[64px] text-on-surface mb-6">
          {tError('notFoundTitle')}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">
          {tError('notFoundBody')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            className="bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-primary transition-colors"
            href="/"
          >
            {t('backHome')}
          </Link>
          <Link
            className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase tracking-wider rounded-full hover:bg-surface-container-low transition-colors"
            href="/1-bedroom-kit-builder"
          >
            {tError('buildKitCta')}
          </Link>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
