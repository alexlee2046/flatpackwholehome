import { Link } from '@/i18n/navigation'
import React from 'react'

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

export function HowItWorksView({ hero, steps }: HowItWorksProps = {}) {
  const eyebrow = hero?.eyebrow || 'CRAFTED ON-DEMAND · DELIVERED DIRECT'
  const title = hero?.title || 'How Precision Engineering Meets Ocean Express.'
  const subtitle =
    hero?.subtitle ||
    'From CNC-cut solid white oak in our zero-waste workshop to your living room in 14–18 days. No showrooms. No middlemen. Just honest craft and seamless DDP doorstep delivery.'

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
                The Fresh-Pressed Revolution
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                We compress our high-density foam on-demand, straight from the mold to the vacuum bag. No sitting in dusty warehouse racks for months. Freshness you can feel.
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
                The 0-Tool Snap Hardware
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant">
                Japanese-inspired CNC interlocking joinery. No Allen keys, no missing screws. Just satisfying, structural integrity that clicks into place in seconds.
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
                Global DDP Doorstep Logistics
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Delivered Duty Paid (DDP). We handle all customs, duties, and freight. Our modular components are specifically sized to navigate tight stairwells and fit elegantly into standard urban elevators. From our workshop directly to your door.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="font-label-md text-xs uppercase tracking-wider">Duties Covered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">elevator</span>
                  <span className="font-label-md text-xs uppercase tracking-wider">Elevator Ready</span>
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
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">The DDP Journey</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              From raw materials in our workshop to the final click in your living room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                desc: 'Your order is cut the morning it’s placed. CNC-milled oak to 0.1 mm tolerances, hand-sanded edges.',
                icon: 'handyman',
                stage: 'Day 1–3',
                title: 'Workshop Crafting',
              },
              {
                desc: 'Foam is poured, cured and vacuum-sealed the same day — fresh-pressed, never warehouse-stale.',
                icon: 'compress',
                stage: 'Day 4',
                title: 'Vacuum-Seal',
              },
              {
                desc: 'Carbon-offset freight, sized to standard pallets and apartment elevators.',
                icon: 'directions_boat',
                stage: 'Day 5–14',
                title: 'Ocean Express',
              },
              {
                desc: 'Our broker clears your boxes and pays every duty and tax. Nothing is owed at the door — ever.',
                icon: 'task_alt',
                stage: 'Day 15',
                title: 'Customs Cleared',
              },
              {
                desc: 'Six flat boxes at your door. Fast solo unboxing and snap assembly in minutes.',
                icon: 'home_pin',
                stage: 'Day 16–18',
                title: 'Final Doorstep',
              },
            ].map((step) => (
              <div
                className="flex flex-col items-center text-center p-6 bg-surface rounded-xl border border-outline-variant/30 shadow-sm"
                key={step.title}
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed/30 border border-primary text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
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
              <span>Build Your Apartment Kit</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
