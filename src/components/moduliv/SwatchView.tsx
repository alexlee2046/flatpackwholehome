'use client'

import { Link } from '@/i18n/navigation'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { StorefrontIcon } from './StorefrontIcon'

export function SwatchView({
  materials,
}: {
  materials?: Array<{ id: string | number; title: string; intro?: string }>
} = {}) {
  const t = useTranslations('Swatch')
  const tCommon = useTranslations('Common')
  const locale = useLocale() as AppLocale
  const isRtl = localeDetails[locale].dir === 'rtl'
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    email: '',
    name: '',
    postal: '',
    room: '',
    // honeypot: real users never fill this, bots often do
    website: '',
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})

  const REQUIRED_FIELDS = ['name', 'email', 'address', 'city', 'postal'] as const

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = REQUIRED_FIELDS.filter((field) => !formData[field].trim())
    if (missing.length > 0) {
      setFieldErrors(Object.fromEntries(missing.map((field) => [field, true])))
      setErrorMsg(t('requiredError'))
      return
    }
    setFieldErrors({})
    setErrorMsg('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/enquiries/swatch', {
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!res.ok) {
        if (res.status === 429) throw new Error(t('rateLimitError'))
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || t('genericError'))
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('moduliv-swatch-ordered', '1')
        } catch {}
      }
      setIsSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

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

      {/* Hero */}
      <section className="mb-section-gap grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
        <div>
          <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
            {t('discoveryKit')}
          </span>
          <h1 className="font-headline-lg text-[36px] md:text-[56px] leading-[1.1] text-on-surface mb-6">
            {t('heroTitle')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            {t('heroSubtitle')}
          </p>
          <a
            className="inline-flex bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors"
            href="#swatch-order"
          >
            {t('orderButton')}
          </a>
        </div>
        <div className="aspect-[4/3] bg-surface-container rounded-2xl overflow-hidden shadow-sm relative">
          <Image
            alt="Moduliv curated swatch box"
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            src="/screenshots/asset-swatch-box-hero.png"
          />
        </div>
      </section>

      {/* Swatch order form */}
      <section
        className="w-full max-w-[1440px] mx-auto py-12 scroll-mt-24 border-t border-outline-variant/40"
        id="swatch-order"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
          <div className="flex flex-col gap-5">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary">
              {t('orderEyebrow')}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('reserveTitle')}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {t('reserveSubtitle')}
            </p>
            <ul className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-3 mt-2">
              <li className="flex items-start gap-3">
                <StorefrontIcon className="mt-0.5 shrink-0 text-primary" name="check_circle" />
                {t('trustItem1')}
              </li>
              <li className="flex items-start gap-3">
                <StorefrontIcon className="mt-0.5 shrink-0 text-primary" name="check_circle" />
                {t('trustItem2')}
              </li>
              <li className="flex items-start gap-3">
                <StorefrontIcon className="mt-0.5 shrink-0 text-primary" name="check_circle" />
                {t('trustItem3')}
              </li>
            </ul>

            {materials && materials.length > 0 && (
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant block mb-2">
                  Curated Materials in Box
                </span>
                <div className="flex flex-wrap gap-2">
                  {materials.map((m) => (
                    <span
                      key={m.id}
                      className="px-2.5 py-1 bg-surface-container text-on-surface rounded-full text-xs font-medium"
                    >
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {isSuccess ? (
              <div
                className="bg-surface-container-lowest border border-outline-variant/50 p-8 md:p-10 flex flex-col items-start gap-4 rounded-xl"
                role="status"
              >
                <StorefrontIcon className="text-primary" name="check_circle" size={40} />
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {t('reservedTitle')}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {t('reservedDesc')}
                </p>
                <p className="font-body-md text-sm text-primary flex items-center gap-2">
                  <StorefrontIcon name="redeem" size={18} />
                  {t('voucherCode')}
                </p>
                <Link
                  className="bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-primary transition-colors mt-4 inline-flex items-center"
                  href="/cart"
                >
                  {t('goToCart')}
                </Link>
              </div>
            ) : (
              <form
                className="bg-surface-container-lowest border border-outline-variant/50 p-6 md:p-8 flex flex-col gap-5 rounded-xl"
                onSubmit={handleSubmit}
              >
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('formTitle')}</h3>
                {errorMsg && (
                  <p className="text-sm text-error" role="alert">
                    {errorMsg}
                  </p>
                )}
                {/* Kept in the DOM for simple bot traps, but removed from keyboard and accessibility trees. */}
                <input
                  autoComplete="off"
                  name="website"
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  type="hidden"
                  value={formData.website}
                />
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-name">
                    {t('fullName')}
                  </label>
                  <input
                    aria-describedby={fieldErrors.name ? 'sf-name-error' : undefined}
                    aria-invalid={fieldErrors.name || undefined}
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Rivera"
                    required
                    type="text"
                    value={formData.name}
                  />
                  {fieldErrors.name && (
                    <p className="text-error text-xs mt-1" id="sf-name-error" role="alert">
                      {t('requiredError')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-email">
                    {t('email')}
                  </label>
                  <input
                    aria-describedby={fieldErrors.email ? 'sf-email-error' : undefined}
                    aria-invalid={fieldErrors.email || undefined}
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                  {fieldErrors.email && (
                    <p className="text-error text-xs mt-1" id="sf-email-error" role="alert">
                      {t('requiredError')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-address">
                    {t('streetAddress')}
                  </label>
                  <input
                    aria-describedby={fieldErrors.address ? 'sf-address-error' : undefined}
                    aria-invalid={fieldErrors.address || undefined}
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-address"
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="12 Oak Lane, Apt 3"
                    required
                    type="text"
                    value={formData.address}
                  />
                  {fieldErrors.address && (
                    <p className="text-error text-xs mt-1" id="sf-address-error" role="alert">
                      {t('requiredError')}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-city">
                      {t('city')}
                    </label>
                    <input
                      aria-describedby={fieldErrors.city ? 'sf-city-error' : undefined}
                      aria-invalid={fieldErrors.city || undefined}
                      className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                      id="sf-city"
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Berlin"
                      required
                      type="text"
                      value={formData.city}
                    />
                    {fieldErrors.city && (
                      <p className="text-error text-xs mt-1" id="sf-city-error" role="alert">
                        {t('requiredError')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-zip">
                      {t('postalCode')}
                    </label>
                    <input
                      aria-describedby={fieldErrors.postal ? 'sf-zip-error' : undefined}
                      aria-invalid={fieldErrors.postal || undefined}
                      className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                      id="sf-zip"
                      onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                      placeholder="10115"
                      required
                      type="text"
                      value={formData.postal}
                    />
                    {fieldErrors.postal && (
                      <p className="text-error text-xs mt-1" id="sf-zip-error" role="alert">
                        {t('requiredError')}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors mt-2 cursor-pointer disabled:opacity-50"
                  type="submit"
                >
                  {isLoading ? t('processing') : t('submitButton')}
                </button>
                <p className="font-body-md text-[13px] text-on-surface-variant">
                  {t('deliveryNote')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
