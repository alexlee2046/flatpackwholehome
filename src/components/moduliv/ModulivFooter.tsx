'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

export type FooterProps = {
  brandSlogan?: string | null
  copyrightText?: string | null
  navItems?: Array<{ label: string; url: string }> | null
  socialLinks?: Array<{ platform: string; url: string }> | null
}

export function ModulivFooter({
  brandSlogan,
  copyrightText,
  navItems,
  socialLinks,
}: FooterProps = {}) {
  const tNav = useTranslations('Navigation')
  const tFooter = useTranslations('Footer')

  const resolvedSlogan = brandSlogan || '6 Boxes · 60 Minutes · 0 Screws · 20% Below IKEA · DDP Duties Included'
  const resolvedCopyright = copyrightText || tFooter('copyright')

  const openPolicy = (modalId: string) => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { modulivOpenPolicy?: (id: string) => void }).modulivOpenPolicy
    ) {
      ;(window as unknown as { modulivOpenPolicy: (id: string) => void }).modulivOpenPolicy(modalId)
      return
    }
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = 'flex'
      modal.classList.remove('hidden')
      setTimeout(() => {
        modal.classList.remove('opacity-0')
        const container = modal.firstElementChild as HTMLElement | null
        if (container) {
          container.classList.remove('scale-95')
          container.classList.add('scale-100')
        }
      }, 10)
      document.body.style.overflow = 'hidden'
    }
  }

  return (
    <footer className="bg-surface-container-low dark:bg-inverse-surface w-full px-margin-mobile md:px-margin-desktop py-16 md:py-section-gap flex flex-col md:flex-row justify-between items-start gap-gutter max-w-[1440px] mx-auto border-t border-outline-variant dark:border-outline flat no shadows mt-section-gap">
      <div className="flex flex-col gap-4">
        <Link
          className="group flex items-baseline gap-1.5 shrink-0 text-on-surface dark:text-surface-bright hover:opacity-85 transition-opacity"
          href="/"
          aria-label="The Flat Set — Home"
        >
          <span className="font-headline-md italic font-normal text-[17px] tracking-wider text-on-surface/80 dark:text-surface-dim">
            The
          </span>
          <span className="font-headline-md font-semibold text-[23px] tracking-[-0.02em] text-on-surface dark:text-surface-bright">
            Flat Set
          </span>
        </Link>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-dim">
          {resolvedCopyright}
        </p>
        <p className="font-label-md text-[12px] tracking-widest uppercase text-outline mt-2">
          {resolvedSlogan}
        </p>
        {socialLinks && socialLinks.length > 0 && (
          <div className="flex gap-4 mt-2">
            {socialLinks.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label-md text-xs text-on-surface-variant hover:text-primary transition-colors underline"
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-label-md text-xs uppercase tracking-widest text-outline font-semibold">
          Furniture System
        </span>
        <nav aria-label="Furniture System Navigation" className="flex flex-wrap gap-x-8 gap-y-4 items-center font-label-md text-label-md">
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/products/modusofa"
          >
            The ModuSofa
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/products/snapbed"
          >
            The SnapBed
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/products/1-bedroom-kit"
          >
            The 1-Bedroom Kit
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/1-bedroom-kit-builder"
          >
            Move-In Kit Builder
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/free-swatch-box-material-discovery"
          >
            Free Swatch Box
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/how-it-works-craft-logistics"
          >
            Tool-Free Assembly
          </Link>
          <Link
            className="text-primary font-semibold hover:underline transition-all duration-200"
            href="/us-vs-ikea"
          >
            Vs IKEA (-20%)
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
            href="/faq"
          >
            FAQ
          </Link>
          {navItems &&
            navItems
              .filter(
                (item) =>
                  ![
                    '/products/modusofa',
                    '/products/snapbed',
                    '/products/1-bedroom-kit',
                    '/1-bedroom-kit-builder',
                    '/free-swatch-box-material-discovery',
                    '/how-it-works-craft-logistics',
                    '/us-vs-ikea',
                    '/faq',
                  ].includes(item.url)
              )
              .map((item) => (
                <Link
                  key={item.url}
                  className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200"
                  href={item.url}
                >
                  {item.label}
                </Link>
              ))}
          <button
            type="button"
            onClick={() => openPolicy('moduliv-privacy-modal')}
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200 cursor-pointer"
          >
            {tFooter('privacyPolicy')}
          </button>
          <button
            type="button"
            onClick={() => openPolicy('moduliv-terms-modal')}
            className="text-on-surface-variant dark:text-surface-dim hover:text-primary dark:hover:text-primary-fixed-dim hover:underline transition-all duration-200 cursor-pointer"
          >
            {tFooter('termsOfService')}
          </button>
        </nav>
      </div>
    </footer>
  )
}
