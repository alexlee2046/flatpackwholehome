import { Link } from '@/i18n/navigation'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'
import { StorefrontIcon } from './StorefrontIcon'

type HowItWorksProps = {
  hero?: {
    eyebrow?: string | null
    title?: string | null
    subtitle?: string | null
  } | null
  steps?: Array<{
    stepNumber: string
    title: string
    description: string
    badge?: string | null
    metric?: string | null
    icon?: string | null
  }> | null
}

export async function HowItWorksView({ hero, steps }: HowItWorksProps = {}) {
  const [t, locale] = await Promise.all([getTranslations('Pages.HowItWorks'), getLocale()])
  const isRtl = localeDetails[locale as AppLocale].dir === 'rtl'

  const eyebrow = hero?.eyebrow || t('heroEyebrow')
  const title = hero?.title || t('title')
  const subtitle = hero?.subtitle || t('subtitle')

  return (
    <main id="main" tabIndex={-1}>
      {/* Page Header */}
      <section className="relative py-24 flex items-center justify-center overflow-hidden bg-surface-container-low border-b border-outline-variant/30">
        <div className="relative z-10 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <span className="inline-block font-label-md text-label-md tracking-widest text-primary uppercase mb-4">
            {eyebrow}
          </span>
          <h1 className="font-display-lg text-[40px] md:text-[64px] text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
            {title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Pillar 1 */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-xl overflow-hidden relative min-h-[420px] md:min-h-[500px] flex flex-col justify-end p-8 border border-outline-variant/30 shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/assets/how-it-works-craft-logistics/83b98d3f9e.png')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-surface-container/90 text-primary rounded-full font-label-md text-xs mb-3">
                01
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                {t('pillar1Title')}
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                {t('pillar1Body')}
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-xl overflow-hidden relative min-h-[420px] md:min-h-[500px] flex flex-col justify-end p-8 border border-outline-variant/30 shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/assets/1-bedroom-kit-builder/da48e93272.png')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-surface-container/90 text-primary rounded-full font-label-md text-xs mb-3">
                02
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                {t('pillar2Title')}
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                {t('pillar2Body')}
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="lg:col-span-12 bg-surface-container-low rounded-xl overflow-hidden flex flex-col md:flex-row border border-outline-variant/30 shadow-sm">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-surface-container text-primary rounded-full font-label-md text-xs self-start mb-4">
                03
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                {t('pillar3Title')}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                {t('pillar3Body')}
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <StorefrontIcon className="text-primary" name="check_circle" />
                  <span className="font-label-md text-xs uppercase tracking-wider">{t('badgeDutiesCovered')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StorefrontIcon className="text-primary" name="elevator" />
                  <span className="font-label-md text-xs uppercase tracking-wider">{t('badgeElevatorReady')}</span>
                </div>
              </div>
            </div>
            <div
              className="md:w-1/2 min-h-[360px] bg-cover bg-center"
              style={{
                backgroundImage: "url('/assets/how-it-works-craft-logistics/b99895568b.png')",
              }}
            />
          </div>
        </div>
      </section>

      {/* 5-Stage Journey Map */}
      <section className="py-section-gap bg-surface-container-low border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">{t('journeyTitle')}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {t('journeySubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {((steps && steps.length > 0)
              ? steps.map((s) => ({
                  desc: s.description,
                  icon: s.icon || 'precision_manufacturing',
                  stage: s.metric || s.badge || s.stepNumber,
                  title: s.title,
                }))
              : [
                  {
                    desc: t('step1Desc'),
                    icon: 'handyman',
                    stage: t('step1Stage'),
                    title: t('step1Title'),
                  },
                  {
                    desc: t('step2Desc'),
                    icon: 'compress',
                    stage: t('step2Stage'),
                    title: t('step2Title'),
                  },
                  {
                    desc: t('step3Desc'),
                    icon: 'directions_boat',
                    stage: t('step3Stage'),
                    title: t('step3Title'),
                  },
                  {
                    desc: t('step4Desc'),
                    icon: 'task_alt',
                    stage: t('step4Stage'),
                    title: t('step4Title'),
                  },
                  {
                    desc: t('step5Desc'),
                    icon: 'home_pin',
                    stage: t('step5Stage'),
                    title: t('step5Title'),
                  },
                ]
            ).map((step) => (
              <div
                className="flex flex-col items-center text-center p-6 bg-surface rounded-xl border border-outline-variant/30 shadow-sm"
                key={step.title}
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed/30 border border-primary text-primary flex items-center justify-center mb-4">
                  <StorefrontIcon name={step.icon} size={22} />
                </div>
                <h3 className="font-label-md text-sm font-semibold text-on-surface mb-1">{step.title}</h3>
                <span className="font-label-md text-xs text-primary mb-2">{step.stage}</span>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              className="inline-flex items-center gap-2 bg-on-background text-on-primary font-label-md text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors"
              href="/1-bedroom-kit-builder"
            >
              <span>{t('ctaBuildKit')}</span>
              <StorefrontIcon name={isRtl ? 'arrow_back' : 'arrow_forward'} size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
