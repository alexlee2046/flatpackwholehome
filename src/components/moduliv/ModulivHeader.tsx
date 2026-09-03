'use client'

import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslations } from 'next-intl'
import React, { useState, useEffect } from 'react'

type HeaderProps = {
  navItems?: Array<{ label: string; url: string; badge?: string | null }> | null
  showAnnouncement?: boolean | null
  announcementMessage?: string | null
  announcementUrl?: string | null
}

export function ModulivHeader({
  navItems,
  showAnnouncement,
  announcementMessage,
  announcementUrl,
}: HeaderProps = {}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const tNav = useTranslations('Navigation')
  const tFooter = useTranslations('Footer')

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  const openSearch = () => {
    setIsDrawerOpen(false)
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as unknown as { modulivOpenSearch?: () => void }).modulivOpenSearch) {
        (window as unknown as { modulivOpenSearch: () => void }).modulivOpenSearch()
      } else {
        const searchBtn = document.querySelector('button[aria-label="Search"]') as HTMLButtonElement | null
        searchBtn?.click()
      }
    }, 200)
  }

  const openPolicyModal = (modalId: string) => {
    setIsDrawerOpen(false)
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as unknown as { modulivOpenPolicy?: (id: string) => void }).modulivOpenPolicy) {
        (window as unknown as { modulivOpenPolicy: (id: string) => void }).modulivOpenPolicy(modalId)
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
    }, 200)
  }

  return (
    <>
      {showAnnouncement && announcementMessage && (
        <aside
          aria-label="Site Announcement"
          className="bg-primary text-on-primary py-2 px-margin-mobile md:px-margin-desktop text-center text-xs font-label-md tracking-wider flex items-center justify-center gap-2"
        >
          <span>{announcementMessage}</span>
          {announcementUrl && (
            <Link className="underline font-medium hover:opacity-85 transition-opacity" href={announcementUrl}>
              Learn more →
            </Link>
          )}
        </aside>
      )}

      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 w-full px-margin-mobile md:px-margin-desktop py-3">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-trigger"
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center ml-auto">
            {navItems && navItems.length > 0 ? (
              navItems.map((item) => (
                <Link
                  key={item.url}
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md relative flex items-center gap-1.5"
                  href={item.url}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <>
                <Link
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/1-bedroom-kit-builder"
                >
                  {tNav('kitBuilder')}
                </Link>
                <Link
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/products/modusofa"
                >
                  {tNav('modusofa')}
                </Link>
                <Link
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/how-it-works-craft-logistics"
                >
                  {tNav('howItWorks')}
                </Link>
                <Link
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/free-swatch-box-material-discovery"
                >
                  {tNav('swatchBox')}
                </Link>
                <Link
                  className="text-on-surface-variant dark:text-surface-dim hover:text-on-surface dark:hover:text-surface-bright hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/faq"
                >
                  {tNav('faq')}
                </Link>
              </>
            )}
          </nav>

          {/* Icons & Controls */}
          <div className="flex items-center gap-4 text-primary dark:text-primary-fixed-dim md:ml-8">
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher className="bg-transparent text-xs font-label-md uppercase tracking-wider text-on-surface border border-outline-variant/60 rounded px-2 py-1 outline-none focus:border-primary cursor-pointer" />
              <span className="font-label-md text-label-md cursor-pointer hover:opacity-80 transition-opacity duration-300">
                USD
              </span>
            </div>
            <button
              aria-label="Search"
              type="button"
              onClick={openSearch}
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
      </header>

      {/* Mobile Drawer (Accessible, Warm Japandi Style) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <aside
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className={`fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-[#f9f8f6] dark:bg-[#1a1c1d] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto p-6 transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Top Bar: Brand & Close */}
            <div className="flex items-center justify-between pb-5 border-b border-outline-variant/30 dark:border-outline/20">
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-baseline gap-1.5 focus:outline-none"
                aria-label="The Flat Set — Home"
              >
                <span className="font-serif italic text-xl tracking-tight text-on-surface dark:text-surface-bright group-hover:text-primary transition-colors">
                  The
                </span>
                <span className="font-serif font-semibold text-xl tracking-tight text-on-surface dark:text-surface-bright group-hover:text-primary transition-colors">
                  Flat Set
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="mt-4">
              <button
                type="button"
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/40 text-on-surface-variant text-sm font-label-md hover:border-primary transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">search</span>
                <span>{tNav('searchPlaceholder')}</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile Navigation">
              <span className="text-[10px] uppercase font-bold tracking-widest text-outline mb-2 px-2">
                Collections & Living
              </span>
              <Link
                href="/1-bedroom-kit-builder"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('kitBuilder')}</span>
                <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
              </Link>
              <Link
                href="/products/modusofa"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('modusofa')}</span>
                <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
              </Link>
              <Link
                href="/how-it-works-craft-logistics"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('howItWorks')}</span>
                <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
              </Link>
              <Link
                href="/free-swatch-box-material-discovery"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('swatchBox')}</span>
                <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
              </Link>
              <Link
                href="/faq"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('faq')}</span>
                <span className="material-symbols-outlined text-[18px] text-outline">arrow_forward</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface dark:text-surface-bright font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('cart')}</span>
                <span
                  data-cart-badge
                  className="text-xs px-2 py-0.5 rounded-full bg-primary text-on-primary font-sans font-bold"
                >
                  0
                </span>
              </Link>
            </nav>

            {/* Language & Currency Tools */}
            <div className="mt-6 pt-5 border-t border-outline-variant/30 dark:border-outline/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3 block px-2">
                Region & Preferences
              </span>
              <div className="flex items-center gap-3 px-2">
                <LanguageSwitcher className="bg-surface-container dark:bg-surface-container-high text-xs font-label-md uppercase tracking-wider text-on-surface border border-outline-variant/60 rounded-lg px-3 py-2 outline-none focus:border-primary flex-1 cursor-pointer" />
                <span className="px-3 py-2 text-xs font-label-md uppercase font-semibold rounded-lg bg-surface-container dark:bg-surface-container-high border border-outline-variant/60 text-on-surface">
                  USD ($)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Guarantees & Legal Policies */}
          <div className="pt-6 border-t border-outline-variant/30 dark:border-outline/20 flex flex-col gap-4">
            <div className="bg-surface-container-low dark:bg-surface-container p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant">
              <div className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>The Flat Set Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-outline">
                6 Flat Boxes · 60-Minute Assembly · 0 Screws · DDP Guaranteed Delivery.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-outline">
              <button
                type="button"
                onClick={() => openPolicyModal('moduliv-privacy-modal')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {tFooter('privacyPolicy')}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openPolicyModal('moduliv-terms-modal')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {tFooter('termsOfService')}
              </button>
            </div>
            <div className="text-[11px] text-outline/80 text-center">
              © 2026 The Flat Set Inc.
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
