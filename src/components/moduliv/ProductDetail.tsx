'use client'

import { Link, useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import React, { useState } from 'react'

type ProductDetailProps = {
  product?: {
    assemblyMinutes?: number | null
    boxBreakdown?: Array<{
      boxId: string
      description?: string | null
      dimensions?: string | null
      title: string
      weight?: string | null
    }> | null
    boxCount?: number | null
    id?: string | number
    joineryType?: string | null
    price?: number
    slug?: string
    specifications?: Array<{
      id?: string | null
      label?: string | null
      value?: string | null
    }> | null
    subtitle?: string | null
    title?: string
  }
}

const FABRICS = [
  { img: '/assets/modusofa-product-detail-page/4c8a514d7a.png', name: 'Caramel Corduroy', tag: 'Best Seller' },
  { img: '/assets/modusofa-product-detail-page/79b47e0bb2.png', name: 'Oatmeal Bouclé', tag: 'Textured' },
  { img: '/assets/modusofa-product-detail-page/6848039aa7.png', name: 'Forest Moss Velvet', tag: 'Plush' },
  { img: '/assets/modusofa-product-detail-page/7bc8f04499.png', name: 'Natural Raw Linen', tag: 'Cool Touch' },
]

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const isSofa = !product?.slug || product.slug === 'modusofa'
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0].name)
  const [selectedLeg, setSelectedLeg] = useState(isSofa ? 'Natural Oak' : 'Queen')
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const title = product?.title || 'ModuSofa 3-Seater'
  const price = product?.price || 699
  const boxCount = product?.boxCount || (isSofa ? 2 : 3)
  const assemblyMinutes = product?.assemblyMinutes || 15

  const mainImage = isSofa
    ? '/assets/modusofa-product-detail-page/e38c85e68d.png'
    : '/assets/1-bedroom-kit-builder/da48e93272.png'

  const thumbImages = isSofa
    ? [
        '/assets/modusofa-product-detail-page/0bbfa9bb39.png',
        '/assets/modusofa-product-detail-page/07df972410.png',
        '/assets/modusofa-product-detail-page/a56da1ec79.png',
      ]
    : [
        '/assets/1-bedroom-kit-builder/d4a4793ee2.png',
        '/assets/1-bedroom-kit-builder/d66ddc7ba1.png',
        '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
      ]

  const categoryName = isSofa ? 'Seating' : 'Bedroom'
  const eyebrowText = isSofa
    ? 'LIVING ROOM · TOOL-FREE SNAP ASSEMBLY'
    : `${product?.joineryType || 'SOLID WOOD'} · TOOL-FREE LIVING SYSTEM`

  const handleAddToCart = () => {
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.add(qty, {
        id: product?.slug || 'modusofa',
        name: title,
        price,
        qty,
        variant: `${selectedFabric} · ${selectedLeg}`,
      })
    }
    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-label-md text-on-surface-variant mb-8 gap-2">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link className="hover:text-primary transition-colors" href="/1-bedroom-kit-builder">
          {categoryName}
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap items-start">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full bg-surface-container rounded-xl overflow-hidden shadow-sm">
            <Image
              alt={title}
              className="object-cover transition-transform duration-700 hover:scale-105"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              src={mainImage}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative aspect-square bg-surface-container rounded-lg overflow-hidden">
              <Image
                alt="Product angle view"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 30vw, 15vw"
                src={thumbImages[0]}
              />
            </div>
            <div className="relative aspect-square bg-surface-container rounded-lg overflow-hidden">
              <Image
                alt="Product detail view"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 30vw, 15vw"
                src={thumbImages[1]}
              />
            </div>
            <div className="relative aspect-square bg-surface-container rounded-lg overflow-hidden">
              <Image
                alt="Packaging breakdown view"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 30vw, 15vw"
                src={thumbImages[2]}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Details & Customizer */}
        <div className="lg:col-span-5 flex flex-col lg:pl-6">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary mb-2 block">
            {eyebrowText}
          </span>
          <h1 className="font-display-lg text-[32px] md:text-[44px] leading-tight text-on-surface mb-3">
            {title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <a
              className="flex items-center gap-1.5 font-label-md text-sm text-primary hover:underline"
              href="#reviews"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span className="font-medium text-on-surface">4.9</span>
              <span className="text-on-surface-variant">(348 reviews)</span>
            </a>
            <span className="text-outline-variant">·</span>
            <span className="font-label-md text-xs uppercase tracking-wider text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
              {boxCount} Flat Boxes · {assemblyMinutes}m Assembly
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="font-headline-lg text-[36px] text-on-surface">${price}.00</span>
            <span className="font-body-md text-sm text-on-surface-variant">USD · DDP Doorstep Delivery Included</span>
          </div>

          {/* Fabric Selector */}
          <div className="mb-8 border-t border-b border-outline-variant/30 py-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                Fabric Upholstery
              </span>
              <span className="font-body-md text-sm text-on-surface-variant">{selectedFabric}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {FABRICS.map((fab) => {
                const sel = selectedFabric === fab.name
                return (
                  <button
                    aria-pressed={sel}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                      sel ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/50'
                    }`}
                    key={fab.name}
                    onClick={() => setSelectedFabric(fab.name)}
                    type="button"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30">
                      <Image alt={fab.name} className="object-cover" fill sizes="48px" src={fab.img} />
                    </div>
                    <span className="font-body-md text-[11px] text-center leading-tight text-on-surface mt-1">
                      {fab.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Leg Finish Selector */}
          <div className="mb-8">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
              Leg Finish
            </span>
            <div className="flex gap-3">
              {['Natural Oak', 'Matte Black Steel'].map((leg) => {
                const sel = selectedLeg === leg
                return (
                  <button
                    aria-pressed={sel}
                    className={`flex-1 py-3 rounded-lg font-label-md text-sm transition-all cursor-pointer border ${
                      sel
                        ? 'bg-on-surface text-white border-on-surface'
                        : 'border-outline-variant text-on-surface hover:border-on-surface'
                    }`}
                    key={leg}
                    onClick={() => setSelectedLeg(leg)}
                    type="button"
                  >
                    {leg}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center border border-outline-variant rounded">
                <button
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  type="button"
                >
                  −
                </button>
                <span aria-live="polite" className="w-10 text-center font-body-md text-sm">
                  {qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => setQty(qty + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="w-full bg-[#1A1C1D] text-white py-4 rounded-full uppercase tracking-wider text-label-md font-label-md hover:bg-primary transition-colors flex justify-center items-center gap-2 cursor-pointer"
              id="pdp-add"
              onClick={handleAddToCart}
              type="button"
            >
              <span>{isAdded ? '✓ Added to Cart!' : `Add to Cart — $${(price * qty).toFixed(2)}`}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              className="w-full rounded-full border border-on-background text-on-background hover:bg-on-background hover:text-on-primary transition-colors py-3 font-label-md flex justify-center items-center gap-2 cursor-pointer"
              id="pdp-buy-now"
              onClick={handleBuyNow}
              type="button"
            >
              Buy Now — Express Checkout
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>

            {/* Mini Trust Strip */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pt-2 text-on-surface-variant">
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">handyman</span>
                0 Screws
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

          {/* Swatch Promo Card */}
          <div className="bg-surface-container rounded-xl p-4 flex items-start gap-4 mb-8">
            <span className="material-symbols-outlined text-primary mt-1">palette</span>
            <div>
              <Link
                className="font-label-md text-sm underline hover:text-primary transition-colors block mb-1 text-on-surface"
                href="/free-swatch-box-material-discovery"
              >
                Order Free Swatch Box
              </Link>
              <p className="text-sm text-on-surface-variant">
                Includes all 4 premium fabrics and a $50 voucher towards your sofa order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="pt-12 border-t border-outline-variant/40" id="reviews">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Verified Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              author: 'Elena R., Brooklyn NY',
              date: '2 weeks ago',
              text: 'Delivered in 3 flat boxes that fit right up my 4th-floor walk-up. Clicked together in 12 minutes without a screwdriver. Beautiful corduroy finish.',
            },
            {
              author: 'Kenji T., Vancouver BC',
              date: '1 month ago',
              text: 'The Japandi proportions are perfection. Deep seat, firm supportive cushions, and zero import duties or surprise carrier bills.',
            },
            {
              author: 'Sarah M., Austin TX',
              date: '6 weeks ago',
              text: 'We bought the swatch box first and the $50 discount applied smoothly at checkout. Best apartment sofa we ever owned.',
            },
          ].map((rev) => (
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between" key={rev.author}>
              <div>
                <div className="flex text-amber-500 mb-2">★★★★★</div>
                <p className="font-body-md text-sm text-on-surface mb-4">“{rev.text}”</p>
              </div>
              <div className="text-xs font-label-md text-on-surface-variant">
                <span className="font-medium text-on-surface">{rev.author}</span> · {rev.date}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
