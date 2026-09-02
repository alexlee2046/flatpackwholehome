'use client'

import { Link } from '@/i18n/navigation'
import React, { useEffect, useState } from 'react'

const THUMBS: Record<string, string> = {
  'bundle-1bed': '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
  modusofa: '/assets/modusofa-product-detail-page/e38c85e68d.png',
}

export function CartView() {
  const [items, setItems] = useState<any[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(
    null,
  )
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  const loadCart = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('moduliv-cart-items')
        setItems(raw ? JSON.parse(raw) : [])
        setVoucherApplied(localStorage.getItem('moduliv-voucher-applied') === '1')
      } catch (e) {
        setItems([])
      }
    }
  }

  useEffect(() => {
    loadCart()
    const handleCartUpdate = () => loadCart()
    window.addEventListener('moduliv:cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)
    return () => {
      window.removeEventListener('moduliv:cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  const updateQuantity = (idx: number, delta: number) => {
    const next = [...items]
    const cur = next[idx]
    if (!cur) return
    cur.qty = (cur.qty || 1) + delta
    if (cur.qty <= 0) {
      next.splice(idx, 1)
    }
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
  }

  const removeItem = (idx: number) => {
    const next = [...items]
    next.splice(idx, 1)
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = promoCode.trim().toUpperCase()
    if (trimmed === 'SWATCH50' || trimmed === 'MODULIV-SWATCH-50') {
      setVoucherApplied(true)
      localStorage.setItem('moduliv-voucher-applied', '1')
      setPromoMessage({
        text: `Code ${trimmed} applied successfully (−$50.00)`,
        type: 'success',
      })
    } else {
      setPromoMessage({
        text: 'Invalid or expired promo code.',
        type: 'error',
      })
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherApplied(false)
    localStorage.removeItem('moduliv-voucher-applied')
    setPromoMessage(null)
  }

  const handleCheckout = () => {
    const ref = `MOD-${Math.floor(100000 + Math.random() * 900000)}`
    setOrderRef(ref)
    setIsOrdered(true)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems([])
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  const discount = voucherApplied ? 50 : 0
  const total = Math.max(0, subtotal - discount)

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Cart</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Your Cart</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Every price below includes DDP delivery — duties, taxes and doorstep drop, all in.
        </p>
      </header>

      {/* Done State */}
      {isOrdered ? (
        <section className="border border-outline-variant/40 bg-surface-container-lowest px-6 py-16 md:py-24 text-center rounded-xl">
          <span className="inline-flex w-16 h-16 rounded-full bg-primary-fixed/30 items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[36px] text-primary">check_circle</span>
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Order placed — well, demo-placed.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
            In the real flow, your boxes would enter the workshop within 48 hours, cross the ocean in 14–18 days, and land DDP at your door — nothing owed on delivery, 100 nights to decide.
          </p>
          <p className="font-label-md text-label-md uppercase tracking-wider text-primary mt-6 mb-8">
            Demo order ref: <span id="order-ref">{orderRef}</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              className="bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-tint transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/"
            >
              Back to Homepage
            </Link>
            <Link
              className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/how-it-works-craft-logistics"
            >
              See What Happens Next
            </Link>
          </div>
        </section>
      ) : items.length === 0 ? (
        /* Empty State */
        <section className="border border-outline-variant/40 bg-surface-container-lowest px-6 py-16 md:py-24 text-center rounded-xl">
          <span className="material-symbols-outlined text-[56px] text-outline">shopping_cart</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mt-4 mb-2">
            Nothing in the cart yet.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
            Start with the whole home, or try the sofa first. Either way: 0 screws, 100 nights to change your mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              className="bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-tint transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/1-bedroom-kit-builder"
            >
              Build the $1,499 Bundle
            </Link>
            <Link
              className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/products/modusofa"
            >
              Explore ModuSofa
            </Link>
          </div>
        </section>
      ) : (
        /* Filled State */
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-7 divide-y divide-outline-variant/30 border-t border-b border-outline-variant/30">
            {items.map((it, idx) => (
              <article className="flex flex-col sm:flex-row gap-5 py-6" key={`${it.id}-${idx}`}>
                <div className="w-full sm:w-28 h-28 bg-surface-container overflow-hidden shrink-0 rounded-lg">
                  <img
                    alt=""
                    className="w-full h-full object-cover"
                    src={THUMBS[it.id] || '/assets/homepage/hero-split.png'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4 items-baseline">
                    <h3 className="font-headline-sm text-[19px] text-on-surface">{it.name}</h3>
                    <span className="font-medium text-on-surface whitespace-nowrap">
                      ${((it.price || 0) * (it.qty || 1)).toFixed(2)}
                    </span>
                  </div>
                  {it.variant && (
                    <p className="font-body-md text-sm text-on-surface-variant mt-1">{it.variant}</p>
                  )}
                  <div className="flex items-center gap-5 mt-4">
                    <div className="inline-flex items-center border border-outline-variant rounded">
                      <button
                        aria-label="Decrease quantity"
                        className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        onClick={() => updateQuantity(idx, -1)}
                        type="button"
                      >
                        −
                      </button>
                      <span aria-live="polite" className="w-9 text-center font-label-md text-sm">
                        {it.qty}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        onClick={() => updateQuantity(idx, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="font-label-md text-[12px] uppercase tracking-wider text-on-surface-variant underline hover:text-error transition-colors cursor-pointer"
                      onClick={() => removeItem(idx)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 lg:p-8 sticky top-28">
            <h2 className="font-headline-sm text-xl text-on-surface mb-6">Order Summary</h2>
            <dl className="space-y-4 font-body-md text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Subtotal</dt>
                <dd className="font-medium text-on-surface">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">DDP Freight & Duties</dt>
                <dd className="text-primary font-medium">Included ($0)</dd>
              </div>

              {voucherApplied && (
                <div className="flex justify-between gap-4 items-center border border-primary/30 bg-primary-fixed/20 px-3 py-2 rounded">
                  <dt className="text-on-surface">
                    Voucher <span className="font-label-md text-[12px] uppercase tracking-wider text-primary">SWATCH50</span>
                  </dt>
                  <dd className="flex items-center gap-3">
                    <span className="text-primary font-medium">−$50.00</span>
                    <button
                      aria-label="Remove voucher"
                      className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      onClick={handleRemoveVoucher}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </dd>
                </div>
              )}

              {/* Promo Code Form */}
              <div className="pt-3 border-t border-outline-variant/30" id="promo-code-section">
                <label
                  className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5"
                  htmlFor="promo-code-input"
                >
                  Have a Promo Code?
                </label>
                <form className="flex gap-2" onSubmit={handleApplyPromo}>
                  <input
                    className="flex-1 px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface uppercase placeholder:normal-case placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary rounded"
                    id="promo-code-input"
                    name="promo"
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. SWATCH50"
                    type="text"
                    value={promoCode}
                  />
                  <button
                    className="px-4 py-2 bg-on-background text-on-primary text-xs uppercase font-label-md tracking-wider hover:bg-primary transition-colors cursor-pointer rounded"
                    id="promo-code-submit"
                    type="submit"
                  >
                    Apply
                  </button>
                </form>
                {promoMessage && (
                  <p
                    className={`text-xs mt-1.5 ${
                      promoMessage.type === 'success' ? 'text-primary' : 'text-error'
                    }`}
                    id="promo-feedback"
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-4 pt-4 border-t border-outline-variant/40 text-lg">
                <dt className="font-medium text-on-surface">Total</dt>
                <dd className="font-headline-sm text-headline-sm text-on-surface" id="sum-total">
                  ${total.toFixed(2)}
                </dd>
              </div>
            </dl>

            <button
              className="mt-8 w-full bg-on-background text-on-primary py-4 font-label-md text-label-md uppercase hover:bg-surface-tint transition-colors duration-300 flex justify-center items-center gap-2 cursor-pointer rounded-full"
              id="checkout-btn"
              onClick={handleCheckout}
              type="button"
            >
              Demo Checkout
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <p className="mt-4 font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">info</span>
              Demo site — no payment is processed and nothing is ordered. Your cart lives in this browser only.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
