'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import React from 'react'

type ModulivHomepageProps = {
  heroEyebrow?: string
  heroHeadline?: string
  heroBody?: string
  heroImage?: string | { alt?: string | null; url?: string | null } | null
  announcement?: string
  bundleTitle?: string
  bundleSubtitle?: string
  bundlePrice?: number
  trustPillars?: Array<{ metric: string; label: string; icon?: string }>
  comparisonMatrix?: {
    eyebrow?: string
    title?: string
    subtitle?: string
    rows?: Array<{ label: string; flatSetValue: string; traditionalValue: string }>
  }
  testimonials?: Array<{
    quote: string
    author: string
    apartmentType?: string
    location?: string
    rating?: number
  }>
}

export function ModulivHomepage({
  heroEyebrow,
  heroHeadline,
  heroBody,
  heroImage,
  announcement,
  bundleTitle,
  bundleSubtitle,
  bundlePrice,
  trustPillars,
  comparisonMatrix,
  testimonials,
}: ModulivHomepageProps) {
  const tHome = useTranslations('Pages.Home')
  const tCommon = useTranslations('Common')
  const tAnnounce = useTranslations('Announcement')

  const resolvedEyebrow = heroEyebrow || tHome('heroEyebrow')
  const resolvedHeadline = heroHeadline || tHome('heroHeadline')
  const resolvedBody = heroBody || tHome('heroBody')
  const resolvedAnnouncement = announcement || tAnnounce('bar')

  const rawHeroUrl =
    (typeof heroImage === 'object' && heroImage?.url) ||
    (typeof heroImage === 'string' && heroImage) ||
    '/assets/homepage/hero-split.png'
  const heroSrc = rawHeroUrl
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/api\/media\/file\//, '/media/')
    .replace(/-\d+(\.[a-zA-Z0-9]+)$/, '$1')
  const heroAlt =
    (typeof heroImage === 'object' && heroImage?.alt) ||
    'Six flat-pack The Flat Set boxes beside the same room fully furnished in warm minimalist style'

  return (
    <>
      <a href="#main" className="skip-link">
        {tCommon('skipToContent')}
      </a>

      {/* Announcement Bar */}
      <div
        id="announcement-bar"
        className="w-full bg-[#A85F3B] text-on-primary py-2 px-margin-mobile md:px-margin-desktop md:pr-14 text-center font-label-md text-[11px] md:text-label-md tracking-wide relative"
      >
        {resolvedAnnouncement}
        <button
          id="announcement-dismiss"
          type="button"
          aria-label={tAnnounce('dismiss')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-primary opacity-80 hover:opacity-100 transition-opacity p-1 leading-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      <main id="main" tabIndex={-1}>
        {/* Hero Section */}
        <section id="overview" className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col-reverse md:flex-row gap-gutter md:gap-16 items-center">
          <div className="flex-1 space-y-6 max-w-xl reveal">
            <p className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
              {resolvedEyebrow}
            </p>
            <h1 className="font-display-lg text-[40px] leading-[1.12] md:text-[64px] md:leading-[1.1] text-on-surface">
              {resolvedHeadline}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {resolvedBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                className="inline-block text-center bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase rounded-full hover:bg-primary transition-colors duration-300"
                href="/1-bedroom-kit-builder"
              >
                {tHome('ctaExplore')} ({tHome('ctaSave')})
              </Link>
              <Link
                className="inline-block text-center border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase rounded-full hover:bg-on-background hover:text-on-primary transition-colors duration-300"
                href="/free-swatch-box-material-discovery"
              >
                {tHome('ctaSwatch')} ({tHome('ctaFree')})
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative reveal" style={{ transitionDelay: '.1s' }}>
            <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-xl shadow-sm">
              <Image
                alt={heroAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                src={heroSrc}
              />
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="border-y border-outline-variant/40 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-outline-variant/40">
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statHomesNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statHomesLabel')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statReviewsNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statReviewsLabel')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statAssemblyNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statAssemblyLabel')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statTrialNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statTrialLabel')}
              </span>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pb-12 pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {(testimonials && testimonials.length > 0
              ? testimonials
              : [
                  { quote: tHome('quote1Text'), author: tHome('quote1Author'), location: '', apartmentType: '' },
                  { quote: tHome('quote2Text'), author: tHome('quote2Author'), location: '', apartmentType: '' },
                  { quote: tHome('quote3Text'), author: tHome('quote3Author'), location: '', apartmentType: '' },
                ]
            ).map((t, idx) => (
              <figure key={idx} className="flex flex-col gap-3">
                <blockquote className="font-headline-sm text-[20px] leading-snug text-on-surface">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
                  {t.author} {t.location ? `· ${t.location}` : ''} {t.apartmentType ? `(${t.apartmentType})` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Flat vs Traditional Comparison */}
        <section id="comparison" className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-2xl mb-12">
            <span className="font-label-md text-label-md uppercase tracking-wider text-surface-tint block mb-4">
              {comparisonMatrix?.eyebrow || tHome('comparisonEyebrow')}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              {comparisonMatrix?.title || tHome('comparisonTitle')}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {comparisonMatrix?.subtitle || tHome('comparisonSubtitle')}
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(26,28,29,0.04)]">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant py-5 px-6 w-[22%]"></th>
                  <th className="font-headline-sm text-lg text-primary py-5 px-6 bg-primary-fixed/20 rounded-t-lg border-b-2 border-primary w-[39%]">
                    {tHome('comparisonColFlatSet')}
                  </th>
                  <th className="font-headline-sm text-lg text-on-surface-variant py-5 px-6 w-[39%]">
                    {tHome('comparisonColTraditional')}
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {(comparisonMatrix?.rows && comparisonMatrix.rows.length > 0
                  ? comparisonMatrix.rows
                  : [
                      {
                        label: tHome('rowAssemblyLabel'),
                        flatSetValue: tHome('rowAssemblyFlatSet'),
                        traditionalValue: tHome('rowAssemblyTraditional'),
                      },
                      {
                        label: tHome('rowLeadTimeLabel'),
                        flatSetValue: tHome('rowLeadTimeFlatSet'),
                        traditionalValue: tHome('rowLeadTimeTraditional'),
                      },
                      {
                        label: tHome('rowFreshnessLabel'),
                        flatSetValue: tHome('rowFreshnessFlatSet'),
                        traditionalValue: tHome('rowFreshnessTraditional'),
                      },
                      {
                        label: tHome('rowPriceLabel'),
                        flatSetValue: tHome('rowPriceFlatSet'),
                        traditionalValue: tHome('rowPriceTraditional'),
                      },
                    ]
                ).map((row, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/30">
                    <td className="py-5 px-6 font-label-md text-sm text-on-surface">{row.label}</td>
                    <td className="py-5 px-6 bg-primary-fixed/10 text-on-surface">{row.flatSetValue}</td>
                    <td className="py-5 px-6 text-on-surface-variant">{row.traditionalValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 1-Bedroom Bundle Promotion CTA */}
        <section id="bundles" className="bg-surface-container-low py-section-gap">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <span className="font-label-md text-label-md uppercase tracking-wider text-surface-tint block mb-2">
                {tHome('bundleEyebrow')}
              </span>
              <h2 className="font-headline-lg text-[32px] md:text-[44px] text-on-surface mb-4">
                {bundleTitle || tHome('bundleTitle')}
              </h2>
              <p className="font-body-lg text-on-surface-variant mb-6">
                {bundleSubtitle || tHome('bundleSubtitle')}
              </p>
              <div className="flex gap-4">
                <Link
                  className="bg-on-background text-on-primary py-3.5 px-7 font-label-md text-label-md uppercase rounded-full hover:bg-primary transition-colors"
                  href="/1-bedroom-kit-builder"
                >
                  {tHome('ctaExplore')} (${bundlePrice ?? 1499})
                </Link>
              </div>
            </div>
            <div className="relative w-full lg:max-w-lg aspect-video rounded-xl overflow-hidden shadow-sm">
              <Image
                src="/assets/1-bedroom-kit-builder/b4e5f4d8a0.png"
                alt="1-Bedroom kit rendered"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
