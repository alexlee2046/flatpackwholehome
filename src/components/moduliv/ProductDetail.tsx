'use client'

import { Link, useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
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
    gallery?: Array<{
      id?: string | null
      image: number | string | { alt?: string | null; url?: string | null }
    }> | null
    id?: string | number
    joineryType?: string | null
    meta?: {
      image?: number | string | { alt?: string | null; url?: string | null } | null
    } | null
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
  materials?: Array<{
    id: string | number
    title: string
    hero?: any
    slug?: string
  }> | null
}

const FABRICS = [
  { id: 'corduroy', img: '/assets/1-bedroom-kit-builder/42c66f93ee.png', name: 'Caramel Corduroy', tag: 'Best Seller' },
  { id: 'boucle', img: '/assets/1-bedroom-kit-builder/ec621fdd7b.png', name: 'Cream Bouclé', tag: 'Textured' },
  { id: 'chenille', img: '/assets/1-bedroom-kit-builder/359e11ad79.png', name: 'Olive Chenille', tag: 'Plush' },
  { id: 'techGrey', img: '/assets/1-bedroom-kit-builder/13266a8714.png', name: 'Tech Grey', tag: 'Cool Touch' },
]

export function ProductDetail({ product, materials }: ProductDetailProps) {
  const router = useRouter()
  const t = useTranslations('PDP')
  const tCommon = useTranslations('Common')
  const isSofa = !product?.slug || product.slug === 'modusofa'

  const activeFabrics =
    materials && materials.length > 0
      ? materials.map((m, idx) => {
          let img = FABRICS[idx % FABRICS.length]?.img || '/assets/1-bedroom-kit-builder/42c66f93ee.png'
          if (m.hero && typeof m.hero === 'object' && m.hero.url) {
            img = m.hero.url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/media\/file\//, '/media/')
          }
          return {
            id: String(m.id || m.slug || idx),
            img,
            name: m.title,
            tag: 'Curated',
          }
        })
      : FABRICS

  const [selectedFabric, setSelectedFabric] = useState(activeFabrics[0]?.name || 'Caramel Corduroy')
  const [selectedLeg, setSelectedLeg] = useState(isSofa ? 'Natural Oak' : 'Queen')
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const title = product?.title || (isSofa ? t('defaultTitle') : 'SnapBed Frame')
  const price = product?.price || 699
  const boxCount = product?.boxCount || (isSofa ? 2 : 3)
  const assemblyMinutes = product?.assemblyMinutes || 15

  // Resolve Payload gallery images or static fallbacks
  const normalizeUrl = (url?: string | null) => {
    if (!url) return null
    return url
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/api\/media\/file\//, '/media/')
      .replace(/-\d+(\.[a-zA-Z0-9]+)$/, '$1')
  }

  const galleryUrls = (product?.gallery || [])
    .map((item) => {
      if (!item) return null
      if (typeof item.image === 'string') return normalizeUrl(item.image)
      if (typeof item.image === 'object' && item.image && 'url' in item.image && item.image.url) {
        return normalizeUrl(item.image.url)
      }
      return null
    })
    .filter((url): url is string => Boolean(url))

  const defaultMainImage = isSofa
    ? '/assets/modusofa-product-detail-page/e38c85e68d.png'
    : '/assets/1-bedroom-kit-builder/da48e93272.png'

  const defaultThumbs = isSofa
    ? [
        '/screenshots/asset-boxes-to-room-split.png',
        '/assets/modusofa-product-detail-page/b354f66f79.png',
        '/assets/modusofa-product-detail-page/d3a3e93b3d.png',
      ]
    : [
        '/assets/1-bedroom-kit-builder/d4a4793ee2.png',
        '/assets/1-bedroom-kit-builder/d66ddc7ba1.png',
        '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
      ]

  const availableImages = galleryUrls.length > 0 ? galleryUrls : [defaultMainImage, ...defaultThumbs]
  const [selectedImage, setSelectedImage] = useState<string>(availableImages[0])

  const activeMainImage = availableImages.includes(selectedImage) ? selectedImage : availableImages[0]
  const thumbImages = availableImages.length > 1 ? availableImages.slice(1, 4) : defaultThumbs

  const categoryName = isSofa ? t('categorySeating') : t('categoryBedroom')
  const eyebrowText = isSofa
    ? t('eyebrowSofa')
    : (product?.joineryType ? t('eyebrowOtherWithJoinery', { joinery: product.joineryType }) : t('eyebrowOther'))

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
          {tCommon('home')}
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
              src={activeMainImage}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {thumbImages.map((thumb, idx) => {
              const isSelected = activeMainImage === thumb
              return (
                <button
                  aria-label={t('viewAngle', { number: idx + 1 })}
                  className={`relative aspect-square bg-surface-container rounded-lg overflow-hidden border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-transparent hover:border-outline-variant'
                  }`}
                  key={thumb + idx}
                  onClick={() => setSelectedImage(thumb)}
                  type="button"
                >
                  <Image
                    alt={`${title} view ${idx + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 30vw, 15vw"
                    src={thumb}
                  />
                </button>
              )
            })}
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
          {product?.subtitle && (
            <p className="font-body-md text-base text-on-surface-variant mb-4">
              {product.subtitle}
            </p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <a
              className="flex items-center gap-1.5 font-label-md text-sm text-primary hover:underline"
              href="#reviews"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span className="font-medium text-on-surface">4.9</span>
              <span className="text-on-surface-variant">{t('reviewsCount', { count: 348 })}</span>
            </a>
            <span className="text-outline-variant">·</span>
            <span className="font-label-md text-xs uppercase tracking-wider text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
              {t('boxesAndAssembly', { count: boxCount, minutes: assemblyMinutes })}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="font-headline-lg text-[36px] text-on-surface">${price}.00</span>
            <span className="font-body-md text-sm text-on-surface-variant">{t('deliveryIncluded')}</span>
          </div>

          {/* Fabric Selector */}
          <div className="mb-8 border-t border-b border-outline-variant/30 py-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                {t('fabricUpholstery')}
              </span>
              <span className="font-body-md text-sm text-on-surface-variant">{selectedFabric}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {activeFabrics.map((fab) => {
                const sel = selectedFabric === fab.name
                const fabLabel = fab.name === 'Caramel Corduroy' ? t('fabrics.corduroy')
                  : fab.name === 'Cream Bouclé' ? t('fabrics.boucle')
                  : fab.name === 'Olive Chenille' ? t('fabrics.chenille')
                  : fab.name === 'Tech Grey' ? t('fabrics.techGrey')
                  : fab.name
                return (
                  <button
                    aria-label={t('selectFabric', { name: fab.name })}
                    aria-pressed={sel}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                      sel ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/50'
                    }`}
                    key={fab.name}
                    onClick={() => setSelectedFabric(fab.name)}
                    type="button"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30">
                      <Image alt={fabLabel} className="object-cover" fill sizes="48px" src={fab.img} />
                    </div>
                    <span className="font-body-md text-[11px] text-center leading-tight text-on-surface mt-1">
                      {fabLabel}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Leg Finish Selector */}
          <div className="mb-8">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
              {t('legFinish')}
            </span>
            <div className="flex gap-3">
              {(isSofa
                ? [
                    { key: 'Natural Oak', label: t('finishNaturalOak') },
                    { key: 'Matte Black Steel', label: t('finishMatteBlackSteel') },
                  ]
                : [
                    { key: 'Queen', label: t('finishQueen') },
                    { key: 'King', label: t('finishKing') },
                  ]
              ).map((leg) => {
                const sel = selectedLeg === leg.key
                return (
                  <button
                    aria-pressed={sel}
                    className={`flex-1 py-3 rounded-lg font-label-md text-sm transition-all cursor-pointer border ${
                      sel
                        ? 'bg-on-surface text-white border-on-surface'
                        : 'border-outline-variant text-on-surface hover:border-on-surface'
                    }`}
                    key={leg.key}
                    onClick={() => setSelectedLeg(leg.key)}
                    type="button"
                  >
                    {leg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                {t('quantity')}
              </span>
              <div className="flex items-center border border-outline-variant rounded">
                <button
                  aria-label={t('decreaseQuantity')}
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
                  aria-label={t('increaseQuantity')}
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
              <span>{isAdded ? t('addedToCart') : t('addToCartWithPrice', { price: (price * qty).toFixed(2) })}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              className="w-full rounded-full border border-on-background text-on-background hover:bg-on-background hover:text-on-primary transition-colors py-3 font-label-md flex justify-center items-center gap-2 cursor-pointer"
              id="pdp-buy-now"
              onClick={handleBuyNow}
              type="button"
            >
              {t('buyNow')}
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>

            {/* Mini Trust Strip */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pt-2 text-on-surface-variant">
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">handyman</span>
                {t('zeroScrews')}
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">nights_stay</span>
                {t('trial')}
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
                {t('dutiesIncluded')}
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
                {t('orderFreeSwatchBox')}
              </Link>
              <p className="text-sm text-on-surface-variant">
                {t('swatchBoxCardDesc')}
              </p>
            </div>
          </div>

          {/* Packaging Breakdown */}
          {product?.boxBreakdown && product.boxBreakdown.length > 0 && (
            <div className="border-t border-outline-variant/30 pt-6 mb-8">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
                {t('boxBreakdownHeader', { count: product.boxBreakdown.length })}
              </span>
              <div className="space-y-3">
                {product.boxBreakdown.map((box) => (
                  <div
                    key={box.boxId}
                    className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-sm"
                  >
                    <div className="flex justify-between items-center font-medium text-on-surface">
                      <span>{box.title}</span>
                      {box.dimensions && (
                        <span className="text-xs text-on-surface-variant font-mono">
                          {box.dimensions} {box.weight ? `· ${box.weight}` : ''}
                        </span>
                      )}
                    </div>
                    {box.description && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {box.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product?.specifications && product.specifications.length > 0 && (
            <div className="border-t border-outline-variant/30 pt-6 mb-8">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
                {t('specificationsHeader')}
              </span>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {product.specifications.map((spec, i) => (
                  <div
                    key={spec.id || i}
                    className="flex justify-between py-1.5 border-b border-outline-variant/20"
                  >
                    <span className="text-on-surface-variant">{spec.label}</span>
                    <span className="font-medium text-on-surface text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="pt-12 border-t border-outline-variant/40" id="reviews">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
          {t('verifiedReviewsHeader')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              author: t('review1Author'),
              date: t('review1Date'),
              text: t('review1Text'),
            },
            {
              author: t('review2Author'),
              date: t('review2Date'),
              text: t('review2Text'),
            },
            {
              author: t('review3Author'),
              date: t('review3Date'),
              text: t('review3Text'),
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
