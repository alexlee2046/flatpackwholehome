'use client'

import { Link } from '@/i18n/navigation'
import React, { useState } from 'react'

export function SwatchView() {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    email: '',
    name: '',
    postal: '',
    room: '',
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postal) {
      setErrorMsg('Please complete all required fields.')
      return
    }
    setErrorMsg('')
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('moduliv-swatch-ordered', '1')
      } catch (err) {}
    }
    setIsSuccess(true)
  }

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Free Swatch Box</span>
      </nav>

      {/* Hero */}
      <section className="mb-section-gap grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
        <div>
          <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
            DISCOVERY KIT
          </span>
          <h1 className="font-headline-lg text-[36px] md:text-[56px] leading-[1.1] text-on-surface mb-6">
            Feel the Fabric in Your Living Light.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            Touch every weave, compare high-resilience foam densities, and inspect solid oak finishes in your own home lighting before ordering. Ships free with a $50 voucher card inside the lid.
          </p>
          <a
            className="inline-flex bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors"
            href="#swatch-order"
          >
            Order My Free Swatch Box
          </a>
        </div>
        <div className="aspect-[4/3] bg-surface-container rounded-2xl overflow-hidden shadow-sm">
          <img
            alt="Moduliv curated swatch box"
            className="w-full h-full object-cover"
            src="/assets/1-bedroom-kit-builder/ec621fdd7b.png"
          />
        </div>
      </section>

      {/* Swatch order form */}
      <section
        className="w-full max-w-[1440px] mx-auto py-12 scroll-mt-24 border-t border-outline-variant/40"
        id="swatch-order"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
          <div className="flex flex-col gap-5">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary">
              ORDER THE FREE BOX
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Reserve Your Swatch Box.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              One form, flat $5 express shipping, zero follow-up calls. Your box leaves the studio within 48 hours and reaches most doors in 7–10 days — with a $50 voucher printed inside the lid.
            </p>
            <ul className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-3 mt-2">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                4 full-weave fabric swatches, 2 foam-density slices, oak & walnut chips.
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                $50 voucher toward any sofa, bed or bundle — valid 60 days.
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                One box per household; decide in your own light, not a showroom’s.
              </li>
            </ul>
          </div>

          <div>
            {isSuccess ? (
              <div
                className="bg-surface-container-lowest border border-outline-variant/50 p-8 md:p-10 flex flex-col items-start gap-4 rounded-xl"
                role="status"
              >
                <span className="material-symbols-outlined text-primary text-[40px]">check_circle</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Your swatch box is reserved.
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  It leaves the workshop within 48 hours. Inside the lid you’ll find your $50 voucher card — valid 60 days toward any furniture order, on top of Move-In Bundle pricing.
                </p>
                <p className="font-body-md text-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">redeem</span>
                  Voucher code: SWATCH50
                </p>
                <Link
                  className="bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-primary transition-colors mt-4 inline-flex items-center"
                  href="/cart"
                >
                  Go to Cart
                </Link>
              </div>
            ) : (
              <form
                className="bg-surface-container-lowest border border-outline-variant/50 p-6 md:p-8 flex flex-col gap-5 rounded-xl"
                onSubmit={handleSubmit}
              >
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Delivery details</h3>
                {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-name">
                    Full name *
                  </label>
                  <input
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Rivera"
                    required
                    type="text"
                    value={formData.name}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-email">
                    Email *
                  </label>
                  <input
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-address">
                    Street address *
                  </label>
                  <input
                    className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                    id="sf-address"
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="12 Oak Lane, Apt 3"
                    required
                    type="text"
                    value={formData.address}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-city">
                      City *
                    </label>
                    <input
                      className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                      id="sf-city"
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Berlin"
                      required
                      type="text"
                      value={formData.city}
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="sf-zip">
                      Postal code *
                    </label>
                    <input
                      className="w-full px-4 py-3 font-body-md text-sm border border-outline-variant/60 rounded bg-surface"
                      id="sf-zip"
                      onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                      placeholder="10115"
                      required
                      type="text"
                      value={formData.postal}
                    />
                  </div>
                </div>

                <button
                  className="bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-8 py-4 rounded-full hover:bg-primary transition-colors mt-2 cursor-pointer"
                  type="submit"
                >
                  Order My Free Swatch Box — $5 Shipping
                </button>
                <p className="font-body-md text-[13px] text-on-surface-variant">
                  Demo build — nothing is charged; your details stay in this browser only.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
