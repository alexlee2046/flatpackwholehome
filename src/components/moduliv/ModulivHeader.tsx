'use client'

import { Link } from '@/i18n/navigation'
import type { SearchIndexProduct } from '@/lib/data/storefront'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SearchModal } from './SearchModal'
import { localeDetails, type AppLocale } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, BadgeCheck, Menu, Search, ShoppingCart, X } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

type HeaderProps = {
  navItems?: Array<{ label: string; url: string; badge?: string | null }> | null
  showAnnouncement?: boolean | null
  announcementMessage?: string | null
  announcementUrl?: string | null
  searchProducts?: SearchIndexProduct[]
}

export function ModulivHeader({
  navItems,
  showAnnouncement,
  announcementMessage,
  announcementUrl,
  searchProducts,
}: HeaderProps = {}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const locale = useLocale() as AppLocale
  const isRtl = localeDetails[locale]?.dir === 'rtl'
  const tNav = useTranslations('Navigation')
  const tFooter = useTranslations('Footer')
  const DirectionArrow = isRtl ? ArrowLeft : ArrowRight
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const hasOpenedDrawerRef = useRef(false)

  // Move focus into the drawer on open, back to the trigger on close.
  // Skipped when the drawer is closing to hand off to the search modal
  // (openSearch below) — the dialog manages its own focus restore then.
  useEffect(() => {
    if (isDrawerOpen) {
      hasOpenedDrawerRef.current = true
      drawerCloseRef.current?.focus()
    } else if (hasOpenedDrawerRef.current && !isSearchOpen) {
      menuTriggerRef.current?.focus()
    }
  }, [isDrawerOpen, isSearchOpen])

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

  // Make the rest of the page truly non-interactive and keep keyboard focus
  // inside the modal drawer until it closes.
  useEffect(() => {
    if (!isDrawerOpen) return
    const background = Array.from(document.querySelectorAll<HTMLElement>('main, footer'))
    background.forEach((element) => {
      element.inert = true
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsDrawerOpen(false)
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      background.forEach((element) => {
        element.inert = false
      })
    }
  }, [isDrawerOpen])

  const openSearch = () => {
    // Same-tick state flip — no transition to wait out, so no setTimeout.
    // The drawer-close focus effect above defers to the modal when isSearchOpen is true.
    setIsDrawerOpen(false)
    setIsSearchOpen(true)
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
          aria-label={tNav('announcement')}
          inert={isDrawerOpen}
          className="bg-primary text-on-primary py-2 px-margin-mobile md:px-margin-desktop text-center text-xs font-label-md tracking-wider flex items-center justify-center gap-2"
        >
          <span>{announcementMessage}</span>
          {announcementUrl && (
            <Link className="underline font-medium hover:opacity-85 transition-opacity" href={announcementUrl}>
              {tNav('learnMore')} →
            </Link>
          )}
        </aside>
      )}

      <header
        inert={isDrawerOpen}
        className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/30"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 w-full px-margin-mobile md:px-margin-desktop py-3">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-trigger"
              ref={menuTriggerRef}
              type="button"
              aria-label={tNav('openMenu')}
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 -ms-2 rounded-full text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <Menu aria-hidden="true" size={24} />
            </button>
            <Link
              className="group flex items-baseline gap-1.5 shrink-0 text-on-surface hover:opacity-85 transition-opacity"
              href="/"
              aria-label="The Flat Set — Home"
              dir="ltr"
            >
              <span className="font-headline-md italic font-normal text-[17px] tracking-wider text-on-surface/80">
                The
              </span>
              <span className="font-headline-md font-semibold text-[23px] tracking-[-0.02em] text-on-surface">
                Flat Set
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center ms-auto">
            {navItems && navItems.length > 0 ? (
              navItems.map((item) => (
                <Link
                  key={item.url}
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md relative flex items-center gap-1.5"
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
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/1-bedroom-kit-builder"
                >
                  {tNav('kitBuilder')}
                </Link>
                <Link
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/products/modusofa"
                >
                  {tNav('modusofa')}
                </Link>
                <Link
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/how-it-works-craft-logistics"
                >
                  {tNav('howItWorks')}
                </Link>
                <Link
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/free-swatch-box-material-discovery"
                >
                  {tNav('swatchBox')}
                </Link>
                <Link
                  className="text-on-surface-variant hover:text-on-surface hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/faq"
                >
                  {tNav('faq')}
                </Link>
                <Link
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:opacity-80 transition-opacity duration-300 font-label-md text-label-md"
                  href="/us-vs-ikea"
                >
                  <span>{tNav('usVsIkea')}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Icons & Controls */}
          <div className="flex items-center gap-4 text-primary md:ms-8">
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher className="bg-transparent text-xs font-label-md uppercase tracking-wider text-on-surface border border-outline-variant/60 rounded px-2 py-1 outline-none focus:border-primary cursor-pointer" />
              <span className="font-label-md text-label-md cursor-pointer hover:opacity-80 transition-opacity duration-300">
                USD
              </span>
            </div>
            <button
              aria-label={tNav('search')}
              type="button"
              onClick={openSearch}
              className="p-2 hover:opacity-80 transition-opacity duration-300"
            >
              <Search aria-hidden="true" data-icon="search" size={24} />
            </button>
            <Link
              href="/cart"
              data-cart-link
              aria-label="Cart"
              className="p-2 hover:opacity-80 transition-opacity duration-300 relative inline-block text-primary"
            >
              <ShoppingCart aria-hidden="true" data-icon="shopping_cart" size={24} />
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
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={tNav('mobileMenu')}
          className={`fixed top-0 start-0 bottom-0 w-[320px] max-w-[85vw] bg-[#f9f8f6] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto p-6 transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Top Bar: Brand & Close */}
            <div className="flex items-center justify-between pb-5 border-b border-outline-variant/30">
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-baseline gap-1.5"
                aria-label="The Flat Set — Home"
                dir="ltr"
              >
                <span className="font-serif italic text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
                  The
                </span>
                <span className="font-serif font-semibold text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
                  Flat Set
                </span>
              </Link>
              <button
                type="button"
                ref={drawerCloseRef}
                aria-label={tNav('closeMenu')}
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>

            {/* Quick Search */}
            <div className="mt-4">
              <button
                type="button"
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant text-sm font-label-md hover:border-primary transition-colors text-start"
              >
                <Search aria-hidden="true" className="text-primary" size={20} />
                <span>{tNav('searchPlaceholder')}</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 flex flex-col gap-1" aria-label={tNav('mobileMenu')}>
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 px-2">
                {tFooter('furnitureSystemHeading')}
              </span>
              <Link
                href="/1-bedroom-kit-builder"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('kitBuilder')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/products/modusofa"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('modusofa')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/products/snapbed"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('snapbed')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/products/1-bedroom-kit"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('oneBedroomKitProduct')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/how-it-works-craft-logistics"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('howItWorks')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/free-swatch-box-material-discovery"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('swatchBox')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/faq"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('faq')}</span>
                <DirectionArrow aria-hidden="true" className="text-outline" size={18} />
              </Link>
              <Link
                href="/us-vs-ikea"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-primary font-serif text-base font-semibold hover:bg-primary/5 transition-colors"
              >
                <span>{tNav('usVsIkea')}</span>
                <DirectionArrow aria-hidden="true" className="text-primary" size={18} />
              </Link>
              <Link
                href="/cart"
                data-cart-link
                onClick={() => setIsDrawerOpen(false)}
                className="relative flex items-center justify-between px-3 py-3 rounded-lg text-on-surface font-serif text-base hover:bg-surface-container-highest transition-colors"
              >
                <span>{tNav('cart')}</span>
              </Link>
            </nav>

            {/* Language & Currency Tools */}
            <div className="mt-6 pt-5 border-t border-outline-variant/30">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3 block px-2">
                {tNav('preferences')}
              </span>
              <div className="flex items-center gap-3 px-2">
                <LanguageSwitcher className="bg-surface-container text-xs font-label-md uppercase tracking-wider text-on-surface border border-outline-variant/60 rounded-lg px-3 py-2 outline-none focus:border-primary flex-1 cursor-pointer" />
                <span className="px-3 py-2 text-xs font-label-md uppercase font-semibold rounded-lg bg-surface-container border border-outline-variant/60 text-on-surface">
                  USD ($)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer: product facts and legal policies. */}
          <div className="pt-6 border-t border-outline-variant/30 flex flex-col gap-4">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant">
              <div className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <BadgeCheck aria-hidden="true" className="text-primary" size={16} />
                <span>The Flat Set</span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                Flat-pack furniture · Tool-free assembly · Delivery details confirmed in a destination quote.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
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
            <div className="text-[11px] text-on-surface-variant text-center">
              © 2026 The Flat Set Inc.
            </div>
          </div>
        </aside>
      </div>

      <SearchModal onClose={() => setIsSearchOpen(false)} open={isSearchOpen} products={searchProducts || []} />
    </>
  )
}
