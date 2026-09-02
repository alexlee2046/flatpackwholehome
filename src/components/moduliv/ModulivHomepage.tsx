'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import React from 'react'

type ModulivHomepageProps = {
  heroEyebrow?: string
  heroHeadline?: string
  heroBody?: string
  heroImage?: string
  announcement?: string
}

export function ModulivHomepage({
  heroEyebrow,
  heroHeadline,
  heroBody,
  heroImage = '/assets/homepage/hero-split.png',
  announcement = 'Global DDP Doorstep Delivery (All Duties & Taxes Included) | Free Fabric Swatch Box With $50 Voucher | 100-Night In-Home Trial',
}: ModulivHomepageProps) {
  const tHome = useTranslations('Pages.Home')

  const resolvedEyebrow = heroEyebrow || tHome('heroEyebrow')
  const resolvedHeadline = heroHeadline || tHome('heroHeadline')
  const resolvedBody = heroBody || tHome('heroBody')

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Announcement Bar */}
      <div
        id="announcement-bar"
        className="w-full bg-[#A85F3B] text-on-primary py-2 px-margin-mobile md:px-margin-desktop md:pr-14 text-center font-label-md text-[11px] md:text-label-md tracking-wide relative"
      >
        {announcement}
        <button
          id="announcement-dismiss"
          type="button"
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-primary opacity-80 hover:opacity-100 transition-opacity p-1 leading-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      <main id="main" tabIndex={-1}>
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex flex-col-reverse md:flex-row gap-gutter md:gap-16 items-center">
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
                {tHome('ctaExplore')} (Save $395)
              </Link>
              <Link
                className="inline-block text-center border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase rounded-full hover:bg-on-background hover:text-on-primary transition-colors duration-300"
                href="/free-swatch-box-material-discovery"
              >
                {tHome('ctaSwatch')} ($0)
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative reveal" style={{ transitionDelay: '.1s' }}>
            <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-xl shadow-sm">
              <Image
                alt="Six flat-pack The Flat Set boxes beside the same room fully furnished in warm minimalist style"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                src={heroImage}
              />
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="border-y border-outline-variant/40 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-outline-variant/40">
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                12,000+
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                Homes furnished since 2023
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                4.8 / 5
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                3,148 verified reviews
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                58 min
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                Median full-kit assembly, solo
              </span>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-headline-md text-[36px] md:text-[40px] text-on-surface leading-none">
                100
              </span>
              <span className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant mt-2">
                Nights to change your mind
              </span>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pb-12 pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <figure className="flex flex-col gap-3">
              <blockquote className="font-headline-sm text-[20px] leading-snug text-on-surface">
                “The first flat-pack that respects both your walls and your weekends.”
              </blockquote>
              <figcaption className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
                — The Calm Home Journal
              </figcaption>
            </figure>
            <figure className="flex flex-col gap-3">
              <blockquote className="font-headline-sm text-[20px] leading-snug text-on-surface">
                “Japandi calm, delivered in cardboard. We timed the 60-minute claim. It’s real.”
              </blockquote>
              <figcaption className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
                — Form & Function
              </figcaption>
            </figure>
            <figure className="flex flex-col gap-3">
              <blockquote className="font-headline-sm text-[20px] leading-snug text-on-surface">
                “Six boxes, one coffee, zero leftover screws. Nothing left over is the whole point.”
              </blockquote>
              <figcaption className="font-label-md text-label-md uppercase tracking-wider text-surface-tint">
                — Dwelling Quarterly
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Flat vs Traditional Comparison */}
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="max-w-2xl mb-12">
            <span className="font-label-md text-label-md uppercase tracking-wider text-surface-tint block mb-4">
              WHY THE FLAT SET
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              Flat-Pack, Without the Flat-Pack Compromise.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Traditional furniture is designed for showrooms. Ours is designed for stairwells, Saturdays, and actually living in the room.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(26,28,29,0.04)]">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant py-5 px-6 w-[22%]"></th>
                  <th className="font-label-md text-label-md uppercase tracking-wider text-primary py-5 px-6 bg-primary-fixed/20">
                    The Flat Set Flat-Pack
                  </th>
                  <th className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant py-5 px-6">
                    Traditional Showroom Furniture
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                <tr className="border-b border-outline-variant/30">
                  <td className="py-5 px-6 font-label-md text-sm text-on-surface">Assembly</td>
                  <td className="py-5 px-6 bg-primary-fixed/10 text-on-surface">
                    Tool-free Snap-Lock joints. A full 1-bedroom kit in about 60 minutes — solo.
                  </td>
                  <td className="py-5 px-6 text-on-surface-variant">
                    An afternoon with hex keys, or a $200+ hired assembler.
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/30">
                  <td className="py-5 px-6 font-label-md text-sm text-on-surface">Lead time</td>
                  <td className="py-5 px-6 bg-primary-fixed/10 text-on-surface">
                    Crafted on demand, ships in 48h, at your door in 14–18 days.
                  </td>
                  <td className="py-5 px-6 text-on-surface-variant">
                    6–12 week backorders, “delayed in transit” included.
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/30">
                  <td className="py-5 px-6 font-label-md text-sm text-on-surface">Freshness</td>
                  <td className="py-5 px-6 bg-primary-fixed/10 text-on-surface">
                    Foam vacuum-sealed the day it cures. Never warehouse-aged.
                  </td>
                  <td className="py-5 px-6 text-on-surface-variant">
                    Cushions compressed on a shelf for months before you meet them.
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/30">
                  <td className="py-5 px-6 font-label-md text-sm text-on-surface">Price</td>
                  <td className="py-5 px-6 bg-primary-fixed/10 text-on-surface">
                    $1,499 for six pieces. DDP — duties, taxes and delivery included.
                  </td>
                  <td className="py-5 px-6 text-on-surface-variant">
                    Freight, customs and stair-carry fees billed after checkout.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 1-Bedroom Bundle Promotion CTA */}
        <section className="bg-surface-container-low py-section-gap">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <span className="font-label-md text-label-md uppercase tracking-wider text-surface-tint block mb-2">
                COMPLETE APARTMENT READY
              </span>
              <h2 className="font-headline-lg text-[32px] md:text-[44px] text-on-surface mb-4">
                The 1-Bedroom Full Apartment Kit
              </h2>
              <p className="font-body-lg text-on-surface-variant mb-6">
                Sofa, dining table, chairs, bed frame, nightstands, and storage — all engineered to live together in harmonious Japandi oak.
              </p>
              <div className="flex gap-4">
                <Link
                  className="bg-on-background text-on-primary py-3.5 px-7 font-label-md text-label-md uppercase rounded-full hover:bg-primary transition-colors"
                  href="/1-bedroom-kit-builder"
                >
                  Configure My Space ($1,499)
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
