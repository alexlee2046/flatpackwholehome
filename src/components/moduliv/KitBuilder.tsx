'use client'

import { Link, useRouter } from '@/i18n/navigation'
import React, { useState } from 'react'

type SpaceKey = 'full' | 'living' | 'bedroom'

const SPACES: Record<
  SpaceKey,
  {
    alt: string
    boxes: string[]
    caption: string
    cta: string
    img: string
    price: number
  }
> = {
  bedroom: {
    alt: 'Bedroom setup featuring the solid oak SnapBed frame and floating nightstands',
    boxes: ['b5', 'b6'],
    caption: '2 of 6 boxes — the bedroom set (bed frame + nightstands).',
    cta: 'Bedroom Set',
    img: '/assets/1-bedroom-kit-builder/da48e93272.png',
    price: 800,
  },
  full: {
    alt: 'Wide render of the furnished 1-bedroom Japandi apartment included in the kit',
    boxes: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
    caption: 'All 6 boxes included in the Full Home bundle.',
    cta: 'Full Bundle',
    img: '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
    price: 1499,
  },
  living: {
    alt: 'Living room setup featuring the modular Japandi sofa and coffee table',
    boxes: ['b1', 'b2'],
    caption: '2 of 6 boxes — the ModuSofa living set (sofa base + backs).',
    cta: 'Living Set',
    img: '/assets/1-bedroom-kit-builder/188581c175.png',
    price: 699,
  },
}

const BOX_LIST = [
  { id: 'b1', img: '/assets/1-bedroom-kit-builder/5ce35b6043.png', name: 'Sofa Base', num: 'Box 1' },
  { id: 'b2', img: '/assets/1-bedroom-kit-builder/b23c77bfdd.png', name: 'Sofa Backs', num: 'Box 2' },
  { id: 'b3', img: '/assets/1-bedroom-kit-builder/5c675ca5bd.png', name: 'Coffee Table', num: 'Box 3' },
  { id: 'b4', img: '/assets/1-bedroom-kit-builder/b0bf525a54.png', name: 'TV Console', num: 'Box 4' },
  { id: 'b5', img: '/assets/1-bedroom-kit-builder/d4a4793ee2.png', name: 'Snap Bed Frame', num: 'Box 5' },
  { id: 'b6', img: '/assets/1-bedroom-kit-builder/d66ddc7ba1.png', name: '2x Nightstands', num: 'Box 6' },
]

export function KitBuilder() {
  const router = useRouter()
  const [space, setSpace] = useState<SpaceKey>('full')
  const [bed, setBed] = useState<'queen' | 'king'>('queen')
  const [fabric, setFabric] = useState('Caramel Corduroy')
  const [wood, setWood] = useState('Natural White Oak')
  const [hasMattress, setHasMattress] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const currentSpace = SPACES[space]
  const isLiving = space === 'living'

  let total = currentSpace.price
  if (!isLiving) {
    if (bed === 'king') total += 150
    if (hasMattress) total += 399
  }

  const handleAddToCart = () => {
    const variantParts = [fabric, wood]
    if (!isLiving) variantParts.push(bed === 'king' ? 'King Bed (+$150)' : 'Queen Bed')
    if (!isLiving && hasMattress) variantParts.push('Cloud Hybrid Mattress (+$399)')

    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.add(1, {
        id: 'bundle-1bed',
        name: `Move-In ${currentSpace.cta} (${currentSpace.boxes.length} Boxes)`,
        price: total,
        qty: 1,
        variant: variantParts.join(' · '),
      })
    }

    setIsAdded(true)
    setTimeout(() => {
      router.push('/cart')
    }, 550)
  }

  return (
    <div className="w-full">
      <main
        className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
        id="main"
        tabIndex={-1}
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-label-md text-on-surface-variant mb-8 gap-2">
          <Link className="hover:text-primary transition-colors" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">1-Bedroom Full Home Builder</span>
        </nav>

        {/* Header */}
        <header className="mb-12 max-w-3xl">
          <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
            FURNISH YOUR WHOLE HOME IN ONE CLICK
          </span>
          <h1 className="font-display-lg text-[36px] leading-[1.15] md:text-[64px] md:leading-[1.1] text-on-surface mb-6">
            The 1-Bedroom Full Apartment Kit
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            6 flat boxes. 60 minutes. 0 tools. Curate your perfect space with our premium, sustainably crafted modular pieces designed for modern living.
          </p>
        </header>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative items-start">
          {/* Left Column: Interactive Render */}
          <div className="lg:col-span-7 lg:sticky top-32 flex flex-col gap-6 w-full z-10">
            <div className="w-full aspect-[4/3] md:aspect-video bg-surface-container-low rounded-xl overflow-hidden relative group shadow-sm transition-all duration-500">
              <img
                alt={currentSpace.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                id="kit-hero-render"
                src={currentSpace.img}
              />
              {/* Space Toggles */}
              <div
                aria-label="Room view"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md rounded-full p-1.5 flex shadow-sm border border-outline-variant/30"
                role="group"
              >
                {(['full', 'living', 'bedroom'] as const).map((sKey) => {
                  const active = space === sKey
                  const label = sKey === 'full' ? 'Full Home' : sKey === 'living' ? 'Living' : 'Bedroom'
                  return (
                    <button
                      aria-pressed={active}
                      className={`px-5 py-2 rounded-full font-label-md text-[12px] uppercase tracking-wider transition-colors cursor-pointer ${
                        active
                          ? 'bg-on-surface text-white'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      key={sKey}
                      onClick={() => setSpace(sKey)}
                      type="button"
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Boxes Strip */}
            <div className="flex flex-col gap-3">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                What&apos;s in the 6 Boxes
              </h2>
              <p aria-live="polite" className="font-body-md text-sm text-on-surface-variant">
                {currentSpace.caption}
              </p>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
                {BOX_LIST.map((b) => {
                  const included = currentSpace.boxes.includes(b.id)
                  return (
                    <div
                      className={`min-w-[120px] max-w-[120px] flex flex-col gap-2 group transition-opacity ${
                        included ? 'opacity-100' : 'opacity-30'
                      }`}
                      key={b.id}
                    >
                      <div className="aspect-square bg-surface-container rounded-lg overflow-hidden border border-transparent group-hover:border-outline-variant transition-colors flex items-center justify-center p-4">
                        <img
                          alt={b.name}
                          className="w-full h-auto object-contain mix-blend-multiply opacity-80"
                          src={b.img}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-[11px] text-on-surface-variant uppercase">
                          {b.num}
                        </span>
                        <span className="font-body-md text-sm text-on-surface">{b.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Steps */}
          <div className="lg:col-span-5 flex flex-col gap-12 pt-8 lg:pt-0">
            {/* Step 1: Fabric */}
            <section className="border-b border-outline-variant pb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                    Step 01
                  </span>
                  <h2 className="font-headline-md text-[28px] text-on-surface">Upholstery Fabric</h2>
                </div>
                <span className="font-body-md text-sm text-on-surface-variant">{fabric}</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Cream Bouclé', img: '/assets/1-bedroom-kit-builder/ec621fdd7b.png' },
                  { label: 'Caramel Corduroy', img: '/assets/1-bedroom-kit-builder/42c66f93ee.png' },
                  { label: 'Olive Chenille', img: '/assets/1-bedroom-kit-builder/359e11ad79.png' },
                  { label: 'Tech Grey', img: '/assets/1-bedroom-kit-builder/13266a8714.png' },
                ].map((item) => {
                  const sel = fabric === item.label
                  return (
                    <button
                      aria-pressed={sel}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                      key={item.label}
                      onClick={() => setFabric(item.label)}
                      type="button"
                    >
                      <div
                        className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative ${
                          sel ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${item.img}')` }}
                        />
                      </div>
                      <span className="font-body-md text-[13px] text-on-surface-variant text-center">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Step 2: Wood Finish */}
            <section className="border-b border-outline-variant pb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                    Step 02
                  </span>
                  <h2 className="font-headline-md text-[28px] text-on-surface">Wood Finish</h2>
                </div>
                <span className="font-body-md text-sm text-on-surface-variant">{wood}</span>
              </div>
              <div className="flex gap-6">
                {[
                  { label: 'Natural White Oak', img: '/assets/1-bedroom-kit-builder/ebd8892f4c.png' },
                  { label: 'Smoked Walnut', img: '/assets/1-bedroom-kit-builder/188581c175.png' },
                ].map((item) => {
                  const sel = wood === item.label
                  return (
                    <button
                      aria-pressed={sel}
                      className={`flex flex-col gap-3 flex-1 group cursor-pointer border rounded-xl p-2 transition-all ${
                        sel ? 'border-primary ring-1 ring-primary' : 'border-outline-variant'
                      }`}
                      key={item.label}
                      onClick={() => setWood(item.label)}
                      type="button"
                    >
                      <div className="h-24 rounded-lg overflow-hidden relative">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${item.img}')` }}
                        />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="font-body-md text-[15px]">{item.label}</span>
                        {sel && (
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            check_circle
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Step 3: Bed Size */}
            {!isLiving && (
              <section className="border-b border-outline-variant pb-10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                      Step 03
                    </span>
                    <h2 className="font-headline-md text-[28px] text-on-surface">Bed Frame Size</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    aria-pressed={bed === 'queen'}
                    className={`py-4 px-6 rounded-lg font-body-md text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      bed === 'queen'
                        ? 'border-primary ring-1 ring-primary bg-primary-fixed/10'
                        : 'border-outline-variant'
                    }`}
                    onClick={() => setBed('queen')}
                    type="button"
                  >
                    <span className="font-medium text-lg">Queen</span>
                    <span className="text-[13px] text-on-surface-variant">Included</span>
                  </button>
                  <button
                    aria-pressed={bed === 'king'}
                    className={`py-4 px-6 rounded-lg font-body-md text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      bed === 'king'
                        ? 'border-primary ring-1 ring-primary bg-primary-fixed/10'
                        : 'border-outline-variant'
                    }`}
                    onClick={() => setBed('king')}
                    type="button"
                  >
                    <span className="font-medium text-lg">King</span>
                    <span className="text-[13px] text-on-surface-variant">+$150.00</span>
                  </button>
                </div>
              </section>
            )}

            {/* Step 4: Add-ons */}
            <section className="pb-4">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                    Step 04
                  </span>
                  <h2 className="font-headline-md text-[28px] text-on-surface">Curated Add-ons</h2>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {!isLiving && (
                  <label className="flex items-start gap-4 p-5 rounded-xl border border-outline-variant hover:border-outline cursor-pointer transition-all bg-surface hover:bg-surface-container-low group">
                    <div className="flex items-center h-6">
                      <input
                        checked={hasMattress}
                        className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2 cursor-pointer"
                        id="addon-mattress"
                        onChange={(e) => setHasMattress(e.target.checked)}
                        type="checkbox"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-body-md font-medium text-on-surface text-[16px]">
                          Cloud Hybrid Mattress
                        </span>
                        <span className="font-body-md text-on-surface">+$399.00</span>
                      </div>
                      <p className="font-body-md text-sm text-on-surface-variant pr-8">
                        10-inch premium memory foam and pocket spring hybrid. Ships compressed in its own box.
                      </p>
                    </div>
                  </label>
                )}

                <div className="flex items-start gap-4 p-5 rounded-xl border border-outline-variant bg-surface-container-low">
                  <div className="flex items-center h-6 pt-1">
                    <span className="material-symbols-outlined text-primary text-[24px]">redeem</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-body-md font-medium text-on-surface text-[16px]">
                        Not ready to commit?
                      </span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface-variant mb-3">
                      Order a free physical swatch box to feel the fabrics in your home lighting before purchasing.
                    </p>
                    <Link
                      className="font-label-md text-[13px] text-primary uppercase tracking-wider underline hover:text-on-surface transition-colors"
                      href="/free-swatch-box-material-discovery"
                    >
                      Order Free Swatches
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Mini Trust Strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 pb-4 text-on-surface-variant">
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">handyman</span>
                0 Screws · 0 Tools
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">nights_stay</span>
                100-Night Trial
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
                DDP Duties Included
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant shadow-[0_-4px_20px_rgba(26,28,29,0.04)] z-50">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div aria-live="polite" className="flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="flex items-end gap-3">
              <span className="font-headline-md text-3xl text-on-surface" id="kit-total">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {space === 'full' && (
                <>
                  <span className="font-body-md text-sm text-on-surface-variant line-through mb-1 hidden sm:inline">
                    Retail $1,894.00
                  </span>
                  <span className="font-label-md text-xs text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full mb-1.5 ml-2">
                    Save $395
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span className="font-body-md text-[13px]">
                {currentSpace.boxes.length} boxes · DDP Doorstep Delivery Included (Ships in 48h)
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              className="px-6 py-4 rounded-full border border-on-surface text-on-surface font-label-md text-sm uppercase tracking-wider hover:bg-on-background hover:text-on-primary transition-colors text-center"
              href="/free-swatch-box-material-discovery"
            >
              Order Free Swatches First
            </Link>
            <button
              className="px-8 py-4 rounded-full bg-on-surface text-on-primary font-label-md text-sm uppercase tracking-wider hover:bg-primary transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75"
              disabled={isAdded}
              id="kit-add"
              onClick={handleAddToCart}
              type="button"
            >
              <span>
                {isAdded
                  ? '✓ Added — Opening Cart…'
                  : `Add ${currentSpace.cta} to Cart (${currentSpace.boxes.length} Boxes)`}
              </span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
