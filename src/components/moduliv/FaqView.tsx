'use client'
import { FAQ_ITEMS, type FaqItem } from '@/data/faq'
import { Link } from '@/i18n/navigation'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { StorefrontIcon } from './StorefrontIcon'

export { FAQ_ITEMS }

export function FaqView({ items = FAQ_ITEMS }: { items?: FaqItem[] }) {
  const t = useTranslations('Pages.FAQ')
  const tCommon = useTranslations('Common')
  const tNav = useTranslations('Navigation')
  const locale = useLocale() as AppLocale
  const isRtl = localeDetails[locale].dir === 'rtl'
  const [search, setSearch] = useState('')
  const activeItems = items && items.length > 0 ? items : FAQ_ITEMS

  const filtered = activeItems.filter((item) => {
    const q = search.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

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
        <span className="text-on-surface font-medium">{tNav('faq')}</span>
      </nav>

      <header className="mb-12 max-w-2xl">
        <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
          {t('eyebrow')}
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">{t('title')}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">{t('subtitle')}</p>
      </header>

      <div className="max-w-md mb-8">
        <div className="relative">
          <StorefrontIcon className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" name="search" size={20} />
          <input
            aria-label={t('searchPlaceholder')}
            className="w-full ps-10 pe-4 py-2.5 border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm rounded focus:outline-none focus:border-primary"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            type="search"
            value={search}
          />
        </div>
      </div>

      <div className="max-w-3xl border-t border-outline-variant/40" id="faq-accordion-container">
        {filtered.map((item, idx) => (
          <details
            className="group border-b border-outline-variant/40"
            key={item.q}
            open={idx === 0 || !!search}
          >
            <summary className="flex justify-between items-center py-6 cursor-pointer list-none gap-6">
              <span className="font-headline-sm text-[20px] text-on-surface">{item.q}</span>
              <StorefrontIcon className="text-primary transition-transform duration-300 group-open:rotate-180" name="arrow_downward" size={20} />
            </summary>
            <p className="font-body-md text-body-md text-on-surface-variant pb-6 pe-8">{item.a}</p>
          </details>
        ))}

        {filtered.length === 0 && (
          <div aria-live="polite" className="py-12 text-center text-on-surface-variant" role="status">
            {t('noResults', { query: search })}
          </div>
        )}
      </div>
    </main>
  )
}
