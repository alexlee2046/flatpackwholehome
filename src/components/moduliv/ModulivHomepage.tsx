import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import React from 'react'
import { HomeMotion } from '@/components/motion/HomeMotion'
import { resolveStorefrontMedia } from '@/utilities/storefrontMedia'

type ModulivHomepageProps = {
  heroEyebrow?: string
  heroHeadline?: string
  heroBody?: string
  heroImage?: string | { alt?: string | null; url?: string | null } | null
  announcement?: string
  bundleTitle?: string
  bundleSubtitle?: string
  bundlePrice?: number
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

export async function ModulivHomepage({
  heroEyebrow,
  heroHeadline,
  heroBody,
  heroImage,
  bundleTitle,
  bundleSubtitle,
  bundlePrice,
  comparisonMatrix,
}: ModulivHomepageProps) {
  const tHome = await getTranslations('Pages.Home')

  const resolvedEyebrow = heroEyebrow || tHome('heroEyebrow')
  const resolvedHeadline = heroHeadline || tHome('heroHeadline')
  const resolvedBody = heroBody || tHome('heroBody')

  const rawHeroUrl =
    (typeof heroImage === 'object' && heroImage?.url) ||
    (typeof heroImage === 'string' && heroImage) ||
    '/assets/homepage/hero-split.png'
  const heroSrc = resolveStorefrontMedia(rawHeroUrl) || '/assets/homepage/hero-split.png'
  const heroAlt =
    (typeof heroImage === 'object' && heroImage?.alt) ||
    'Six flat-pack The Flat Set boxes beside the same room fully furnished in warm minimalist style'

  // Pricing and delivery copy is release-controlled rather than CMS-editable so
  // it cannot drift from the server quote contract.
  const comparisonRows = [
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

  return (
    <HomeMotion>
      {/* Announcement bar lives once, in SiteHeader — not duplicated here. */}

      <main id="main" tabIndex={-1}>
        {/* Hero Section */}
        <section data-home-hero="" id="overview" className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col-reverse md:flex-row gap-gutter md:gap-16 items-center">
          <div className="flex-1 space-y-6 max-w-xl">
            <p data-home-hero-copy="" className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
              {resolvedEyebrow}
            </p>
            <h1 data-home-hero-copy="" className="font-display-lg text-[40px] leading-[1.12] md:text-[64px] md:leading-[1.1] text-on-surface">
              {resolvedHeadline}
            </h1>
            <p data-home-hero-copy="" className="font-body-lg text-body-lg text-on-surface-variant">
              {resolvedBody}
            </p>
            <p data-home-hero-copy="" className="font-label-md text-label-md text-on-surface">
              {tHome('heroValueProp', { price: bundlePrice ?? 1499 })}
            </p>
            <div data-home-hero-copy="" className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                className="inline-block text-center bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase rounded-full hover:bg-primary transition-colors duration-300"
                href="/1-bedroom-kit-builder"
              >
                {tHome('ctaExplore')}
              </Link>
              <Link
                className="inline-block text-center border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase rounded-full hover:bg-on-background hover:text-on-primary transition-colors duration-300"
                href="/free-swatch-box-material-discovery"
              >
                {tHome('ctaSwatch')} ({tHome('ctaFree')})
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div data-home-hero-image="" className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-xl shadow-sm">
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
          <div data-home-stats="" className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div data-home-stat="" className="relative flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statHomesNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statHomesLabel')}
              </span>
            </div>
            <div data-home-stat="" className="relative flex flex-col items-center text-center px-4">
              <span data-home-stat-divider="" aria-hidden="true" className="hidden md:block absolute inset-y-0 start-0 w-px bg-outline-variant/40" />
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statReviewsNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statReviewsLabel')}
              </span>
            </div>
            <div data-home-stat="" className="relative flex flex-col items-center text-center px-4">
              <span data-home-stat-divider="" aria-hidden="true" className="hidden md:block absolute inset-y-0 start-0 w-px bg-outline-variant/40" />
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statAssemblyNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statAssemblyLabel')}
              </span>
            </div>
            <div data-home-stat="" className="relative flex flex-col items-center text-center px-4">
              <span data-home-stat-divider="" aria-hidden="true" className="hidden md:block absolute inset-y-0 start-0 w-px bg-outline-variant/40" />
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                {tHome('statTrialNumber')}
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                {tHome('statTrialLabel')}
              </span>
            </div>
          </div>
        </section>

        {/* Flat vs Traditional Comparison */}
        <section data-home-comparison="" id="comparison" className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
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
          <div className="grid gap-4 md:hidden">
            {comparisonRows.map((row) => (
              <article className="overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant/50" key={row.label}>
                <h3 className="px-5 py-4 font-label-md text-sm text-on-surface border-b border-outline-variant/30">
                  {row.label}
                </h3>
                <dl>
                  <div data-comparison-focus="" className="px-5 py-4 bg-primary-fixed/15 border-s border-primary">
                    <dt className="font-label-md text-xs uppercase tracking-wider text-primary mb-1">
                      {tHome('comparisonColFlatSet')}
                    </dt>
                    <dd className="font-body-md text-sm text-on-surface">{row.flatSetValue}</dd>
                  </div>
                  <div className="px-5 py-4">
                    <dt className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      {tHome('comparisonColTraditional')}
                    </dt>
                    <dd className="font-body-md text-sm text-on-surface-variant">{row.traditionalValue}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(26,28,29,0.04)]">
            <table className="w-full min-w-[720px] text-start border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant py-5 px-6 w-[22%]"></th>
                  <th data-comparison-focus="" className="font-headline-sm text-lg text-primary py-5 px-6 bg-primary-fixed/20 rounded-t-lg border-b border-primary border-s-primary w-[39%]">
                    {tHome('comparisonColFlatSet')}
                  </th>
                  <th className="font-headline-sm text-lg text-on-surface-variant py-5 px-6 w-[39%]">
                    {tHome('comparisonColTraditional')}
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/30">
                    <td className="py-5 px-6 font-label-md text-sm text-on-surface">{row.label}</td>
                    <td data-comparison-focus="" className="py-5 px-6 bg-primary-fixed/10 text-on-surface border-s border-primary/40">{row.flatSetValue}</td>
                    <td className="py-5 px-6 text-on-surface-variant">{row.traditionalValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 1-Bedroom Bundle Promotion CTA */}
        <section data-home-bundle="" id="bundles" className="bg-surface-container-low py-section-gap">
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
            <div data-home-bundle-image="" className="relative w-full lg:max-w-lg aspect-video rounded-xl overflow-hidden shadow-sm">
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
    </HomeMotion>
  )
}
