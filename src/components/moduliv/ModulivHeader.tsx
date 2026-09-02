'use client'

import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import React from 'react'

export function ModulivHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 w-full px-margin-mobile md:px-margin-desktop py-3">
        {/* The Flat Set Wordmark */}
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

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 items-center ml-auto">
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
            href="/1-bedroom-kit-builder"
          >
            Move-In Bundles
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
            href="/products/modusofa"
          >
            ModuSofa
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
            href="/how-it-works-craft-logistics"
          >
            How It Works
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
            href="/free-swatch-box-material-discovery"
          >
            Free Swatch Box
          </Link>
          <Link
            className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
            href="/faq"
          >
            FAQ
          </Link>
        </nav>

        {/* Icons & Switchers */}
        <div className="flex items-center gap-4 text-primary dark:text-primary-fixed-dim ml-8">
          <LanguageSwitcher className="bg-transparent text-xs font-label-md uppercase tracking-wider text-on-surface border border-outline-variant/60 rounded px-2 py-1 outline-none focus:border-primary cursor-pointer" />
          <span className="font-label-md text-label-md cursor-pointer hover:opacity-80 transition-opacity duration-300">
            USD
          </span>
          <button
            aria-label="Search"
            type="button"
            className="hover:opacity-80 transition-opacity duration-300"
          >
            <span className="material-symbols-outlined" data-icon="search">
              search
            </span>
          </button>
          <Link
            href="/cart"
            data-cart-link
            aria-label="Cart"
            className="hover:opacity-80 transition-opacity duration-300 relative inline-block text-primary dark:text-primary-fixed-dim"
          >
            <span className="material-symbols-outlined" data-icon="shopping_cart">
              shopping_cart
            </span>
          </Link>
        </div>
      </div>

      <nav
        className="md:hidden flex gap-6 overflow-x-auto whitespace-nowrap px-margin-mobile pb-3 font-label-md text-label-md"
        aria-label="Site sections"
      >
        <Link
          className="shrink-0 pb-1 border-b-2 border-transparent text-on-surface-variant"
          href="/1-bedroom-kit-builder"
        >
          Move-In Bundles
        </Link>
        <Link
          className="shrink-0 pb-1 border-b-2 border-transparent text-on-surface-variant"
          href="/products/modusofa"
        >
          ModuSofa
        </Link>
        <Link
          className="shrink-0 pb-1 border-b-2 border-transparent text-on-surface-variant"
          href="/how-it-works-craft-logistics"
        >
          How It Works
        </Link>
        <Link
          className="shrink-0 pb-1 border-b-2 border-transparent text-on-surface-variant"
          href="/free-swatch-box-material-discovery"
        >
          Free Swatch Box
        </Link>
        <Link
          className="shrink-0 pb-1 border-b-2 border-transparent text-on-surface-variant"
          href="/faq"
        >
          FAQ
        </Link>
      </nav>
    </header>
  )
}
