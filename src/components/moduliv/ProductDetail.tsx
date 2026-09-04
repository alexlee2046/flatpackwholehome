'use client'

import { Link, useRouter } from '@/i18n/navigation'
import { localeDetails } from '@/i18n/routing'
import { AnimatedImageSwap } from '@/components/motion/AnimatedImageSwap'
import { resolveStorefrontMedia } from '@/utilities/storefrontMedia'
import {
  findStorefrontVariant,
  MAX_CART_ITEM_QUANTITY,
  type StorefrontVariant,
} from '@/lib/commerce/storefrontCart'
import {
  expectedOptionTypesForProduct,
  getStorefrontCheckoutEligibility,
  type StorefrontCheckoutProduct,
} from '@/lib/commerce/catalogEligibility'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { ArrowLeft, ArrowRight, CircleCheck, Palette, ShoppingCart, Truck, Wrench, Zap } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(useGSAP)

type ProductDetailProps = {
  checkoutEnabled?: boolean
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
    checkout?: StorefrontCheckoutProduct
    gallery?: Array<{
      id?: string | null
      image: number | string | { alt?: string | null; url?: string | null }
      /** A single option does not prove that an image matches a full SKU. */
      variantOption?: number | string | { id?: number | string } | null
    }> | null
    id?: string | number
    joineryType?: string | null
    meta?: {
      image?: number | string | { alt?: string | null; url?: string | null } | null
    } | null
    price?: number
    slug?: string
    shippingWeightKg?: number | null
    specifications?: Array<{
      id?: string | null
      label?: string | null
      value?: string | null
    }> | null
    subtitle?: string | null
    title?: string
    variants?: StorefrontVariant[]
  }
  materials?: Array<{
    id: string | number
    title: string
    hero?: any
    slug?: string
  }> | null
}

function materialMatchesFabric(material: NonNullable<ProductDetailProps['materials']>[number], fabricId: string) {
  const searchable = `${material.slug || ''} ${material.title}`.toLocaleLowerCase()
  const terms: Record<string, string[]> = {
    boucle: ['boucle', 'bouclé'],
    chenille: ['chenille'],
    corduroy: ['corduroy'],
    techGrey: ['tech', 'grey', 'gray'],
  }
  return terms[fabricId]?.some((term) => searchable.includes(term)) ?? false
}

const FABRICS = [
  { id: 'corduroy', img: '/assets/1-bedroom-kit-builder/42c66f93ee.png', name: 'Caramel Corduroy', tag: 'Best Seller' },
  { id: 'boucle', img: '/assets/1-bedroom-kit-builder/ec621fdd7b.png', name: 'Cream Bouclé', tag: 'Textured' },
  { id: 'chenille', img: '/assets/1-bedroom-kit-builder/359e11ad79.png', name: 'Olive Chenille', tag: 'Plush' },
  { id: 'techGrey', img: '/assets/1-bedroom-kit-builder/13266a8714.png', name: 'Tech Grey', tag: 'Cool Touch' },
]

export function ProductDetail({ checkoutEnabled = false, product, materials }: ProductDetailProps) {
  const router = useRouter()
  const locale = useLocale()
  const isRtl = localeDetails[locale as keyof typeof localeDetails]?.dir === 'rtl'
  const t = useTranslations('PDP')
  const tCommon = useTranslations('Common')
  const tSwatch = useTranslations('Swatch')
  const { formatCurrency } = useCurrency()
  const isSofa = product?.slug === 'modusofa'
  const isBundle = product?.slug === '1-bedroom-kit'
  const optionTypes = new Set(expectedOptionTypesForProduct({
    slug: product?.slug,
    variantTypes: product?.checkout?.variantTypes || [],
  }))
  const supportsUpholstery = optionTypes.has('upholstery')
  const supportsWoodFinish = optionTypes.has('wood-finish')
  const supportsBedSize = optionTypes.has('bed-size')
  const visibleOptionCount = [supportsUpholstery, supportsWoodFinish, supportsBedSize].filter(Boolean).length
  const hasConfigurationOptions = visibleOptionCount > 0

  const fabricLabels: Record<string, string> = {
    boucle: t('fabrics.boucle'),
    chenille: t('fabrics.chenille'),
    corduroy: t('fabrics.corduroy'),
    techGrey: t('fabrics.techGrey'),
  }

  // The CMS collection contains both timber and upholstery. Keep the four
  // fabric choices stable, use CMS only for their imagery, and keep storefront
  // labels localized instead of leaking the CMS editing locale into the UI.
  const activeFabrics = FABRICS.map((fabric) => {
    const material = materials?.find((candidate) => materialMatchesFabric(candidate, fabric.id))
    const cmsImage =
      material?.hero && typeof material.hero === 'object' && material.hero.url
        ? resolveStorefrontMedia(material.hero.url)
        : null
    return {
      ...fabric,
      img: cmsImage || fabric.img,
      name: fabricLabels[fabric.id] || fabric.name,
    }
  })

  const [selectedFabric, setSelectedFabric] = useState(activeFabrics[0]?.id || 'corduroy')
  const [selectedWood, setSelectedWood] = useState<'oak' | 'walnut'>('oak')
  const [selectedBedSize, setSelectedBedSize] = useState<'queen' | 'king'>('queen')
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [cartError, setCartError] = useState(false)
  const [hasReachedConfigurator, setHasReachedConfigurator] = useState(false)
  const [isInlineAddVisible, setIsInlineAddVisible] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const configuratorRef = useRef<HTMLDivElement>(null)
  const inlineAddRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    if (!mobileQuery.matches || !configuratorRef.current || !inlineAddRef.current) return

    const configuratorObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setHasReachedConfigurator(true)
      configuratorObserver.disconnect()
    })
    const addButtonObserver = new IntersectionObserver(
      ([entry]) => setIsInlineAddVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    )

    configuratorObserver.observe(configuratorRef.current)
    addButtonObserver.observe(inlineAddRef.current)
    return () => {
      configuratorObserver.disconnect()
      addButtonObserver.disconnect()
    }
  }, [])

  const title = product?.title || (isSofa ? t('defaultTitle') : t('productFallbackTitle'))
  const boxCount = typeof product?.boxCount === 'number' && product.boxCount > 0 ? product.boxCount : undefined
  const assemblyMinutes =
    typeof product?.assemblyMinutes === 'number' && product.assemblyMinutes > 0
      ? product.assemblyMinutes
      : undefined
  const selectedFabricDetails = activeFabrics.find((fabric) => fabric.id === selectedFabric)
  const selectedFabricName = selectedFabricDetails?.name || fabricLabels.corduroy
  const selectedWoodName = selectedWood === 'oak' ? t('finishNaturalOak') : t('finishWalnut')
  const selection = {
    ...(supportsUpholstery ? { upholstery: selectedFabric } : {}),
    ...(supportsWoodFinish ? { 'wood-finish': selectedWood } : {}),
    ...(supportsBedSize ? { 'bed-size': selectedBedSize } : {}),
  }
  const selectedVariant = findStorefrontVariant(product?.variants, selection)
  const checkoutEligibility = product?.checkout
    ? getStorefrontCheckoutEligibility(product.checkout, product.variants, selection)
    : { available: false, code: 'CATALOG_UNAVAILABLE', requiresVariant: true }
  const configuredUnitPrice =
    checkoutEligibility.available &&
    typeof (selectedVariant?.price ?? product?.price) === 'number' &&
    (selectedVariant?.price ?? product?.price)! > 0
      ? (selectedVariant?.price ?? product?.price)!
      : undefined
  const canAddToCart =
    checkoutEnabled &&
    checkoutEligibility.available &&
    (!checkoutEligibility.requiresVariant || Boolean(selectedVariant)) &&
    configuredUnitPrice !== undefined
  const configuredTotal = configuredUnitPrice === undefined ? undefined : configuredUnitPrice * qty
  const showMobilePurchaseBar = canAddToCart && hasReachedConfigurator && !isInlineAddVisible

  // The CMS only records an optional single variant option for a gallery
  // image. That does not establish an exact multi-option SKU match, so every
  // chosen configuration uses the gallery as a representative image.
  const galleryUrls = (product?.gallery || []).flatMap((item) => {
    if (!item) return []
    const url =
      typeof item.image === 'string'
        ? resolveStorefrontMedia(item.image)
        : typeof item.image === 'object' && item.image && 'url' in item.image && item.image.url
          ? resolveStorefrontMedia(item.image.url)
          : ''
    return url ? [url] : []
  })

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

  const validSelectedImage = availableImages.includes(selectedImage)
    ? selectedImage
    : availableImages[0]
  const activeMainImage = validSelectedImage
  // Gallery rows are not linked to an exact multi-option SKU. Keep the
  // disclosure visible even when a product is unavailable or still loading.
  const imageIsRepresentative = true
  const thumbImages = availableImages.length > 1 ? availableImages.slice(1, 4) : defaultThumbs

  const categoryName = isSofa
    ? t('categorySeating')
    : isBundle
      ? t('categoryWholeHome')
      : t('categoryBedroom')
  const eyebrowText = isSofa
    ? t('eyebrowSofa')
    : (product?.joineryType ? t('eyebrowOtherWithJoinery', { joinery: product.joineryType }) : t('eyebrowOther'))

  const addConfiguredItem = (intent: 'add' | 'buy-now') => {
    const cart = typeof window !== 'undefined' ? (window as any).modulivCart : null
    const writeCart = intent === 'buy-now' ? cart?.upsert : cart?.add
    if (
      isAdded ||
      !canAddToCart ||
      configuredUnitPrice === undefined ||
      typeof writeCart !== 'function'
    ) {
      setCartError(true)
      setTimeout(() => setCartError(false), 4000)
      return false
    }

    const configuration = [
      ...(supportsUpholstery ? [selectedFabricName] : []),
      ...(supportsWoodFinish ? [selectedWoodName] : []),
      ...(supportsBedSize ? [selectedBedSize === 'queen' ? t('finishQueen') : t('finishKing')] : []),
    ]
    const variantOptions = {
      ...(supportsUpholstery ? { upholstery: selectedFabric } : {}),
      ...(supportsWoodFinish ? { woodFinish: selectedWood } : {}),
      ...(supportsBedSize ? { bedSize: selectedBedSize } : {}),
    }
    writeCart(qty, {
      boxCount,
      id: product?.slug || 'modusofa',
      image: activeMainImage,
      imageIsRepresentative,
      name: title,
      price: configuredUnitPrice,
      qty,
      shippingWeightKg: product?.shippingWeightKg || undefined,
      ...(configuration.length > 0 ? { variant: configuration.join(' · ') } : {}),
      ...(Object.keys(variantOptions).length > 0 ? { variantOptions } : {}),
      ...(selectedVariant ? { variantId: selectedVariant.id } : {}),
    })
    setCartError(false)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
    return true
  }

  const handleAddToCart = () => addConfiguredItem('add')

  const handleBuyNow = () => {
    if (addConfiguredItem('buy-now')) router.push('/cart')
  }

  useGSAP(
    () => {
      if (!isAdded) return
      const button = rootRef.current?.querySelector<HTMLElement>('[data-pdp-add]')
      if (!button) return
      gsap.timeline({ defaults: { overwrite: 'auto' } })
        .to(button, { scale: 0.975, duration: 0.07, ease: 'power1.out', willChange: 'transform' })
        .to(button, { scale: 1, duration: 0.1, ease: 'power3.out', clearProps: 'transform,willChange' })
    },
    { dependencies: [isAdded], scope: rootRef },
  )

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-5 pb-32 md:pb-section-gap"
      id="main"
      ref={rootRef}
      tabIndex={-1}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center overflow-x-auto whitespace-nowrap text-sm font-label-md text-on-surface-variant mb-5 gap-2">
        <Link className="hover:text-primary transition-colors" href="/">
          {tCommon('home')}
        </Link>
        {isRtl ? <ArrowLeft aria-hidden="true" size={16} /> : <ArrowRight aria-hidden="true" size={16} />}
        <Link className="hover:text-primary transition-colors" href="/1-bedroom-kit-builder">
          {categoryName}
        </Link>
        {isRtl ? <ArrowLeft aria-hidden="true" size={16} /> : <ArrowRight aria-hidden="true" size={16} />}
        <span className="text-on-surface font-medium">{title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap items-start">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-6 flex flex-col gap-3 lg:sticky lg:top-28">
          <div className="relative">
            <AnimatedImageSwap
              alt={title}
              className="aspect-[4/3] lg:aspect-[3/2] w-full bg-surface-container rounded-xl shadow-sm"
              imageClassName="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={activeMainImage}
            />
            {isSofa && selectedFabricDetails && (
              <div
                aria-live="polite"
                className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/50 bg-surface/90 px-3 py-2 shadow-sm backdrop-blur"
                data-product-visual-configuration=""
              >
                <span className="flex min-w-0 items-center gap-2 text-xs text-on-surface">
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-outline-variant">
                    <Image alt="" className="object-cover" fill sizes="32px" src={selectedFabricDetails.img} />
                  </span>
                  <span className="truncate">{selectedFabricName}</span>
                </span>
                <span className="flex min-w-0 items-center gap-2 text-xs text-on-surface">
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full border border-black/15 ${
                      selectedWood === 'oak' ? 'bg-[#d6b98c]' : 'bg-[#5a382b]'
                    }`}
                  />
                  <span className="truncate">{selectedWoodName}</span>
                </span>
              </div>
            )}
          </div>
          {imageIsRepresentative && (
            <p className="text-xs text-on-surface-variant" data-product-image-disclosure="">
              {t('representativeImage')}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {thumbImages.map((thumb, idx) => {
              const isSelected = activeMainImage === thumb
              return (
                <button
                  aria-label={t('viewAngle', { number: idx + 1 })}
                  aria-pressed={isSelected}
                  className={`relative aspect-[4/3] bg-surface-container rounded-lg overflow-hidden border-2 transition-all cursor-pointer text-start ${
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
        <div className="lg:col-span-6 flex flex-col xl:ps-6">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary mb-2 block">
            {eyebrowText}
          </span>
          <h1 className="font-display-lg text-headline-md md:text-headline-lg text-on-surface mb-2">
            {title}
          </h1>
          {product?.subtitle && (
            <p className="font-body-md text-base text-on-surface-variant mb-3">
              {product.subtitle}
            </p>
          )}

          {(boxCount !== undefined || assemblyMinutes !== undefined) && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="font-label-md text-xs uppercase tracking-wider text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
                {t('boxesAndAssembly', {
                  count: boxCount ?? '—',
                  minutes: assemblyMinutes ?? '—',
                })}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
            <span className="font-headline-lg text-[36px] text-on-surface" data-product-price="" dir="ltr">
              {configuredUnitPrice === undefined
                ? t('priceUnavailable')
                : formatCurrency(configuredUnitPrice, { locale })}
            </span>
            <span className="font-body-md text-sm text-on-surface-variant">{t('deliveryIncluded')}</span>
          </div>

          <div
            aria-hidden="true"
            className="h-px scroll-mt-24"
            data-pdp-configurator-start=""
            ref={configuratorRef}
          />

          {/* Fabric Selector */}
          {supportsUpholstery && (
            <div className="mb-4 border-t border-b border-outline-variant/30 py-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                  {t('fabricUpholstery')}
                </span>
                <span className="font-body-md text-sm text-on-surface-variant">{selectedFabricName}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {activeFabrics.map((fab) => {
                  const selected = selectedFabric === fab.id
                  return (
                    <button
                      aria-label={t('selectFabric', { name: fab.name })}
                      aria-pressed={selected}
                      className={`flex min-w-0 flex-col items-center gap-1.5 rounded-lg border p-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-primary ring-1 ring-primary bg-primary-fixed/10'
                          : 'border-outline-variant/50 hover:border-outline'
                      }`}
                      key={fab.id}
                      onClick={() => setSelectedFabric(fab.id)}
                      type="button"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-outline-variant/30">
                        <Image alt="" className="object-cover" fill sizes="48px" src={fab.img} />
                      </div>
                      <span className="font-body-md text-[11px] text-center leading-tight text-on-surface mt-1">
                        {fab.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Wood Finish Selector */}
          {supportsWoodFinish && (
          <div className="mb-4">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
              {t('woodFinish')}
            </span>
            <div className="flex gap-3">
              {([
                { key: 'oak', label: t('finishNaturalOak') },
                { key: 'walnut', label: t('finishWalnut') },
              ] as const).map((finish) => {
                const selected = selectedWood === finish.key
                return (
                  <button
                    aria-pressed={selected}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 font-label-md text-sm text-on-surface transition-all cursor-pointer ${
                      selected
                        ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary'
                        : 'border-outline-variant bg-surface hover:border-on-surface'
                    }`}
                    key={finish.key}
                    onClick={() => setSelectedWood(finish.key)}
                    type="button"
                  >
                    {selected && <CircleCheck aria-hidden="true" className="text-primary" size={16} />}
                    {finish.label}
                  </button>
                )
              })}
            </div>
          </div>
          )}

          {supportsBedSize && (
            <div className="mb-8">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface block mb-3">
                {t('bedSize')}
              </span>
              <div className="flex gap-3">
                {(['queen', 'king'] as const).map((size) => {
                  const selected = selectedBedSize === size
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex-1 py-3 rounded-lg font-label-md text-sm transition-all cursor-pointer border ${
                        selected
                          ? 'bg-on-surface text-on-primary border-on-surface'
                          : 'border-outline-variant text-on-surface hover:border-on-surface'
                      }`}
                      key={size}
                      onClick={() => setSelectedBedSize(size)}
                      type="button"
                    >
                      {size === 'queen' ? t('finishQueen') : t('finishKing')}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {hasConfigurationOptions && (
          <div
            aria-live="polite"
            className={`mb-3 grid gap-x-4 gap-y-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm ${
              visibleOptionCount > 1 ? 'grid-cols-2' : 'grid-cols-1'
            }`}
            data-pdp-configuration-summary=""
          >
            {supportsUpholstery && (
              <div className="min-w-0">
                <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  {t('fabricUpholstery')}
                </p>
                <p className="truncate font-medium text-on-surface">{selectedFabricName}</p>
              </div>
            )}
            {supportsWoodFinish && (
              <div className="min-w-0">
                <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  {t('woodFinish')}
                </p>
                <p className="truncate font-medium text-on-surface">{selectedWoodName}</p>
              </div>
            )}
            {supportsBedSize && (
              <div className="min-w-0">
                <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">
                  {t('bedSize')}
                </p>
                <p className="truncate font-medium text-on-surface">
                  {selectedBedSize === 'queen' ? t('finishQueen') : t('finishKing')}
                </p>
              </div>
            )}
          </div>
          )}

          {/* Quantity & CTA */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                {t('quantity')}
              </span>
              <div className="flex items-center border border-outline-variant rounded">
                <button
                  aria-label={t('decreaseQuantity')}
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={qty <= 1}
                  onClick={() => setQty((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  −
                </button>
                <output aria-live="polite" className="w-10 text-center font-body-md text-sm">
                  {qty}
                </output>
                <button
                  aria-label={t('increaseQuantity')}
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={qty >= MAX_CART_ITEM_QUANTITY}
                  onClick={() => setQty((current) => Math.min(MAX_CART_ITEM_QUANTITY, current + 1))}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
            {qty >= MAX_CART_ITEM_QUANTITY && (
              <p className="text-xs text-on-surface-variant">{t('quantityLimitReached')}</p>
            )}

            {canAddToCart ? (
              <>
                <button
                  data-pdp-add=""
                  className="w-full bg-on-background text-on-primary py-4 rounded-full uppercase tracking-wider text-label-md font-label-md hover:bg-primary transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75"
                  disabled={isAdded}
                  id="pdp-add"
                  onClick={handleAddToCart}
                  ref={inlineAddRef}
                  type="button"
                >
                  <span>
                    {isAdded
                      ? t('addedToCart')
                      : t('addToCartWithPrice', {
                          price: formatCurrency(configuredTotal as number, { locale }),
                        })}
                  </span>
                  {isAdded
                    ? <CircleCheck aria-hidden="true" size={18} />
                    : isRtl
                      ? <ArrowLeft aria-hidden="true" size={18} />
                      : <ShoppingCart aria-hidden="true" size={18} />}
                </button>

                <button
                  className="w-full rounded-full border border-on-background text-on-background hover:bg-on-background hover:text-on-primary transition-colors py-3 font-label-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75"
                  disabled={isAdded}
                  id="pdp-buy-now"
                  onClick={handleBuyNow}
                  type="button"
                >
                  {t('buyNow')}
                  <Zap aria-hidden="true" size={18} />
                </button>
              </>
            ) : (
              <div
                aria-live="polite"
                className="rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface-variant"
                data-pdp-purchase-unavailable=""
                role="status"
              >
                <p>{checkoutEnabled ? t('configurationUnavailable') : t('onlineCheckoutUnavailable')}</p>
                <a
                  className="mt-2 inline-flex font-label-md text-xs uppercase tracking-wider text-primary underline underline-offset-4"
                  href="mailto:concierge@theflatset.com?subject=Product%20quote%20request"
                >
                  {t('contactConcierge')}
                </a>
              </div>
            )}

            {cartError && (
              <p aria-live="assertive" className="text-sm text-error text-center" role="alert">
                {tCommon('cartError')}
              </p>
            )}

            {/* Quote and configuration facts only; delivery inclusions are not known until quote. */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pt-2 text-on-surface-variant">
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <Wrench aria-hidden="true" className="text-primary" size={16} />
                {t('zeroScrews')}
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <Truck aria-hidden="true" className="text-primary" size={16} />
                {t('destinationQuoteRequired')}
              </span>
            </div>
          </div>

          {/* Do not advertise a purchasable swatch or voucher while its
              fulfillment entitlement remains deliberately disabled. */}
          <aside className="bg-surface-container rounded-xl p-4 flex items-start gap-4 mb-8" role="status">
            <Palette aria-hidden="true" className="mt-1 text-primary" size={24} />
            <div>
              <p className="text-sm text-on-surface-variant">{tSwatch('checkoutUnavailable')}</p>
              <a
                className="mt-2 inline-flex font-label-md text-xs uppercase tracking-wider text-primary underline underline-offset-4"
                href="mailto:concierge@theflatset.com?subject=Material%20swatch%20options"
              >
                {tSwatch('contactConcierge')}
              </a>
            </div>
          </aside>

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
                        <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
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
                    <span className="font-medium text-on-surface text-end">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showMobilePurchaseBar && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
          data-mobile-purchase-bar=""
        >
          <div className="mx-auto flex max-w-[1440px] items-center gap-3">
            <div className="min-w-24">
              <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
                {t('configuredTotal')}
              </p>
              <p className="font-headline-md text-xl text-on-surface" dir="ltr">
                {formatCurrency(configuredTotal as number, { locale })}
              </p>
            </div>
            <button
              className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-4 font-label-md text-sm text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isAdded}
              onClick={handleAddToCart}
              type="button"
            >
              {isAdded ? t('addedToCart') : t('addToCart')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
