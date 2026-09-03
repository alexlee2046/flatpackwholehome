'use client'

import { Link } from '@/i18n/navigation'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'

const CITY_DATA = [
  { id: 'la', taxRate: 0.1025 },
  { id: 'nyc', taxRate: 0.08875 },
  { id: 'chicago', taxRate: 0.1 },
  { id: 'seattle', taxRate: 0.101 },
  { id: 'austin', taxRate: 0.0825 },
  { id: 'portland', taxRate: 0.0 },
] as const

const TRANSPORT_DATA = [
  { id: 'uhaul', cost: 115 },
  { id: 'ikeaTruck', cost: 79 },
  { id: 'ownCar', cost: 0 },
] as const

export function IkeaComparisonView() {
  const t = useTranslations('Pages.UsVsIkea')
  const tCommon = useTranslations('Common')
  const locale = useLocale() as AppLocale
  const isRtl = localeDetails[locale].dir === 'rtl'
  const [selectedCityIndex, setSelectedCityIndex] = useState(0)
  const [selectedTransportId, setSelectedTransportId] = useState<(typeof TRANSPORT_DATA)[number]['id']>('uhaul')

  const currentCity = CITY_DATA[selectedCityIndex]
  const currentTransport = TRANSPORT_DATA.find((m) => m.id === selectedTransportId) || TRANSPORT_DATA[0]

  // Math variables
  const ikeaSubtotal = 1894.0
  const flatSetSubtotal = 1499.0

  const ikeaTax = ikeaSubtotal * currentCity.taxRate
  const ikeaLandedTotal = ikeaSubtotal + ikeaTax + currentTransport.cost
  const totalLandedSavings = ikeaLandedTotal - flatSetSubtotal
  const landedSavingsPercent = ((totalLandedSavings / ikeaLandedTotal) * 100).toFixed(1)
  const taxRatePercent = (currentCity.taxRate * 100).toFixed(2)

  return (
    <div className="w-full bg-background text-on-surface pb-24">
      {/* Header Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-12 pt-8">
        <nav className="flex items-center text-sm font-label-md text-on-surface-variant mb-6 gap-2">
          <Link className="hover:text-primary transition-colors" href="/">
            {tCommon('home')}
          </Link>
          <span className={`material-symbols-outlined text-[16px] ${isRtl ? 'scale-x-[-1]' : ''}`}>
            chevron_right
          </span>
          <span className="text-on-surface font-medium">{t('breadcrumbCurrent')}</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {t('badge')}
          </div>
          <h1 className="font-display-lg text-[32px] sm:text-[54px] leading-[1.12] text-on-surface mb-6 font-semibold">
            {t('heroTitleLine1')}
            <br className="hidden sm:inline" />
            {t('heroTitleLine2')}
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed font-normal max-w-3xl">
            {t.rich('heroSubtitle', { b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </header>

        {/* Interactive Simulator Card */}
        <section className="bg-white border border-outline-variant/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-outline-variant/60">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
                {t('simulatorLabel')}
              </span>
              <h2 className="text-2xl font-bold text-on-surface">{t('simulatorTitle')}</h2>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-on-surface-variant">{t('cityLabel')}</label>
                <select
                  value={selectedCityIndex}
                  onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
                  className="bg-surface-container-low border border-outline rounded-lg px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  {CITY_DATA.map((c, idx) => (
                    <option key={c.id} value={idx}>
                      {c.taxRate === 0
                        ? t('cityTaxFree', { city: t(`cities.${c.id}`) })
                        : t('cityTaxOption', { city: t(`cities.${c.id}`), rate: (c.taxRate * 100).toFixed(2) })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-on-surface-variant">{t('transportLabel')}</label>
                <select
                  value={selectedTransportId}
                  onChange={(e) => setSelectedTransportId(e.target.value as (typeof TRANSPORT_DATA)[number]['id'])}
                  className="bg-surface-container-low border border-outline rounded-lg px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                >
                  {TRANSPORT_DATA.map((m) => (
                    <option key={m.id} value={m.id}>
                      {t('transportOption', { name: t(`transportModes.${m.id}`), cost: m.cost })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Simulator Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {/* IKEA Side */}
            <div className="rounded-xl p-6 bg-surface-container-low border border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-on-surface-variant text-sm uppercase tracking-wider">
                  {t('ikeaCardLabel')}
                </span>
                <span className="text-xs px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-semibold">
                  {t('ikeaCardBadge')}
                </span>
              </div>
              <div className="space-y-3 text-sm text-on-surface-variant mb-6">
                <div className="flex justify-between">
                  <span>{t('ikeaLineSubtotal')}</span>
                  <span dir="ltr" className="font-semibold text-on-surface">
                    ${ikeaSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('ikeaLineTax', { rate: taxRatePercent })}</span>
                  <span dir="ltr" className="font-semibold">
                    +${ikeaTax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('ikeaLineTransport')}</span>
                  <span dir="ltr" className="font-semibold">
                    +${currentTransport.cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant/70 text-xs">
                  <span>{t('ikeaLineAssembly')}</span>
                  <span>{t('ikeaAssemblyValue')}</span>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-on-surface">{t('ikeaLandedLabel')}</span>
                <span dir="ltr" className="text-2xl font-extrabold text-on-surface">
                  ${ikeaLandedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* The Flat Set Side */}
            <div className="rounded-xl p-6 bg-primary/5 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 end-0 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-es-lg tracking-wider uppercase">
                {t('directAtelierBadge')}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-primary text-sm uppercase tracking-wider">
                  {t('flatSetCardLabel')}
                </span>
              </div>
              <div className="space-y-3 text-sm text-on-surface-variant mb-6">
                <div className="flex justify-between">
                  <span>{t('flatSetLineSubtotal')}</span>
                  <span dir="ltr" className="font-semibold text-on-surface">
                    ${flatSetSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-tertiary">
                  <span>{t('flatSetLineDuty')}</span>
                  <span className="font-bold">{t('flatSetLineDutyValue')}</span>
                </div>
                <div className="flex justify-between text-tertiary">
                  <span>{t('flatSetLineShipping')}</span>
                  <span className="font-bold">{t('flatSetLineShippingValue')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-xs">
                  <span>{t('flatSetLineAssembly')}</span>
                  <span className="text-primary font-bold">{t('flatSetAssemblyValue')}</span>
                </div>
              </div>
              <div className="border-t border-primary/20 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-primary">{t('flatSetPayLabel')}</span>
                <div className="text-end">
                  <span dir="ltr" className="text-3xl font-extrabold text-primary">
                    ${flatSetSubtotal.toFixed(2)}
                  </span>
                  <div className="text-xs font-bold text-tertiary mt-1">
                    {t('flatSetSavingsLine', { amount: totalLandedSavings.toFixed(2), percent: landedSavingsPercent })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Granular Breakdown Table Section */}
        <section className="bg-white border border-outline-variant/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                {t('breakdownLabel')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-on-surface">{t('breakdownTitle')}</h2>
              <p className="text-sm text-on-surface-variant mt-1">{t('breakdownSubtitle')}</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary/10 border border-tertiary/20 text-tertiary text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              {t('breakdownSavingsBadge')}
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 sm:-mx-10 mb-8">
            <table className="w-full text-start border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-surface-container-low border-y border-outline-variant text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <th scope="col" className="py-3.5 px-6">
                    {t('tableColBox')}
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-end">
                    {t('tableColRetail')}
                  </th>
                  <th scope="col" className="py-3.5 px-6 text-end">
                    {t('tableColBundle')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/70 text-sm text-on-surface font-medium">
                <tr className="hover:bg-surface-container-low/80 transition">
                  <th scope="row" className="py-4 px-6 font-semibold text-on-surface text-start">
                    {t('boxSofaName')}
                    <br />
                    <span className="text-xs font-normal text-on-surface-variant">{t('boxSofaDesc')}</span>
                  </th>
                  <td dir="ltr" className="py-4 px-4 text-end text-on-surface-variant">
                    $699.00
                  </td>
                  <td dir="ltr" className="py-4 px-6 text-end font-bold text-primary">
                    $599.00
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/80 transition">
                  <th scope="row" className="py-4 px-6 font-semibold text-on-surface text-start">
                    {t('boxCoffeeName')}
                    <br />
                    <span className="text-xs font-normal text-on-surface-variant">{t('boxCoffeeDesc')}</span>
                  </th>
                  <td dir="ltr" className="py-4 px-4 text-end text-on-surface-variant">
                    $149.00
                  </td>
                  <td dir="ltr" className="py-4 px-6 text-end font-bold text-primary">
                    $129.00
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/80 transition">
                  <th scope="row" className="py-4 px-6 font-semibold text-on-surface text-start">
                    {t('boxMediaName')}
                    <br />
                    <span className="text-xs font-normal text-on-surface-variant">{t('boxMediaDesc')}</span>
                  </th>
                  <td dir="ltr" className="py-4 px-4 text-end text-on-surface-variant">
                    $249.00
                  </td>
                  <td dir="ltr" className="py-4 px-6 text-end font-bold text-primary">
                    $219.00
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/80 transition">
                  <th scope="row" className="py-4 px-6 font-semibold text-on-surface text-start">
                    {t('boxBedName')}
                    <br />
                    <span className="text-xs font-normal text-on-surface-variant">{t('boxBedDesc')}</span>
                  </th>
                  <td dir="ltr" className="py-4 px-4 text-end text-on-surface-variant">
                    $349.00
                  </td>
                  <td dir="ltr" className="py-4 px-6 text-end font-bold text-primary">
                    $379.00
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/80 transition">
                  <th scope="row" className="py-4 px-6 font-semibold text-on-surface text-start">
                    {t('boxNightstandName')}
                    <br />
                    <span className="text-xs font-normal text-on-surface-variant">{t('boxNightstandDesc')}</span>
                  </th>
                  <td dir="ltr" className="py-4 px-4 text-end text-on-surface-variant">
                    $199.00
                  </td>
                  <td dir="ltr" className="py-4 px-6 text-end font-bold text-primary">
                    $173.00
                  </td>
                </tr>

                {/* Total Row */}
                <tr className="bg-primary/5 font-bold text-on-surface">
                  <th scope="row" className="py-5 px-6 text-primary text-start">
                    {t('totalRowLabel')}
                    <br />
                    <span className="text-xs font-normal text-primary/80">{t('totalRowDesc')}</span>
                  </th>
                  <td
                    dir="ltr"
                    className="py-5 px-4 text-end font-semibold text-on-surface-variant line-through"
                  >
                    $1,645.00
                  </td>
                  <td dir="ltr" className="py-5 px-6 text-end font-extrabold text-xl text-primary">
                    $1,499.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why It Stays Affordable Section */}
        <section className="bg-white border border-outline-variant/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
              {t('section3Label')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-on-surface">{t('section3Title')}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{t('section3Subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/80">
                <span className="material-symbols-outlined text-primary mb-2 block">compress</span>
                <h3 className="font-bold text-on-surface text-sm mb-1">{t('reasonCompactTitle')}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t('reasonCompactBody')}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/80">
                <span className="material-symbols-outlined text-primary mb-2 block">local_shipping</span>
                <h3 className="font-bold text-on-surface text-sm mb-1">{t('reasonDdpTitle')}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t('reasonDdpBody')}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/80">
                <span className="material-symbols-outlined text-primary mb-2 block">storefront</span>
                <h3 className="font-bold text-on-surface text-sm mb-1">{t('reasonDirectTitle')}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t('reasonDirectBody')}</p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface-container-low p-6 rounded-xl border border-outline-variant text-on-surface-variant text-sm leading-relaxed space-y-3">
              <div className="flex items-center gap-2 font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                {t('ctaCardTitle')}
              </div>
              <p>
                {t('ctaCardBody', { amount: totalLandedSavings.toFixed(2), percent: landedSavingsPercent })}
              </p>
              <div className="pt-3">
                <Link
                  href="/1-bedroom-kit-builder"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-primary text-white font-label-md text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  <span>{t('ctaButton')}</span>
                  <span className={`material-symbols-outlined text-[18px] ${isRtl ? 'scale-x-[-1]' : ''}`}>
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
