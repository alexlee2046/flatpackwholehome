'use client'

import { Link } from '@/i18n/navigation'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import { StorefrontIcon } from './StorefrontIcon'

/**
 * The paid swatch and automatic-voucher workflow is intentionally unavailable
 * until fulfillment can atomically create a durable entitlement. Keep this
 * page informational rather than collecting address or payment data that the
 * server must reject.
 */
export function SwatchView({
  materials,
}: {
  materials?: Array<{ id: string | number; title: string; intro?: string }>
} = {}) {
  const t = useTranslations('Swatch')
  const tCommon = useTranslations('Common')
  const locale = useLocale() as AppLocale
  const isRtl = localeDetails[locale].dir === 'rtl'

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          {tCommon('home')}
        </Link>
        <StorefrontIcon name={isRtl ? 'chevron_left' : 'chevron_right'} size={16} />
        <span className="text-on-surface font-medium">{t('breadcrumb')}</span>
      </nav>

      <section className="mb-section-gap grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
        <div>
          <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
            {t('discoveryKit')}
          </span>
          <h1 className="font-headline-lg text-[36px] md:text-[56px] leading-[1.1] text-on-surface mb-6">
            {t('heroTitle')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">{t('checkoutUnavailable')}</p>
          <a
            className="inline-flex bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors"
            href="mailto:concierge@theflatset.com?subject=Material%20swatch%20options"
          >
            {t('contactConcierge')}
          </a>
        </div>
        <div className="aspect-[4/3] bg-surface-container rounded-2xl overflow-hidden shadow-sm relative">
          <Image
            alt="The Flat Set curated swatch box"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            src="/screenshots/asset-swatch-box-hero.png"
          />
        </div>
      </section>

      <section
        className="w-full max-w-[1440px] mx-auto py-12 scroll-mt-24 border-t border-outline-variant/40"
        id="swatch-order"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
          <div className="flex flex-col gap-5">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary">
              {t('discoveryKit')}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('checkoutUnavailable')}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{t('checkoutUnavailable')}</p>
            {materials && materials.length > 0 && (
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant block mb-2">
                  {t('materialsInBox')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material) => (
                    <span
                      className="px-2.5 py-1 bg-surface-container text-on-surface rounded-full text-xs font-medium"
                      key={material.id}
                    >
                      {material.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside
            className="bg-surface-container-lowest border border-outline-variant/50 p-8 md:p-10 flex flex-col items-start gap-4 rounded-xl"
            role="status"
          >
            <StorefrontIcon className="text-primary" name="info" size={40} />
            <h3 className="font-headline-md text-headline-md text-on-surface">{t('checkoutUnavailable')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t('reserveSubtitle')}
            </p>
            <a
              className="bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-primary transition-colors mt-2 inline-flex items-center"
              href="mailto:concierge@theflatset.com?subject=Material%20swatch%20box"
            >
              {t('contactConcierge')}
            </a>
          </aside>
        </div>
      </section>
    </main>
  )
}
