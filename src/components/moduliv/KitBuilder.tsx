'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { localeDetails } from '@/i18n/routing'
import { AnimatedImageSwap } from '@/components/motion/AnimatedImageSwap'
import { resolveStorefrontMedia } from '@/utilities/storefrontMedia'
import { findStorefrontVariant, type StorefrontVariant } from '@/lib/commerce/storefrontCart'
import {
  getStorefrontCheckoutEligibility,
  type StorefrontCheckoutProduct,
} from '@/lib/commerce/catalogEligibility'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { ArrowLeft, ArrowRight, CircleCheck, Gift, ShoppingCart, Truck, Wrench } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef, useState } from 'react'

gsap.registerPlugin(useGSAP)

type SpaceKey = 'full' | 'living' | 'bedroom'

const SPACES: Record<
  SpaceKey,
  {
    alt: string
    boxes: string[]
    caption: string
    cta: string
    img: string
  }
> = {
  bedroom: {
    alt: 'Bedroom setup featuring the solid oak SnapBed frame and floating nightstands',
    boxes: ['b5', 'b6'],
    caption: '2 of 6 boxes — the bedroom set (bed frame + nightstands).',
    cta: 'Bedroom Set',
    img: '/assets/1-bedroom-kit-builder/da48e93272.png',
  },
  full: {
    alt: 'Wide render of the furnished 1-bedroom Japandi apartment included in the kit',
    boxes: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
    caption: 'All 6 boxes included in the Full Home bundle.',
    cta: 'Full Bundle',
    img: '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
  },
  living: {
    alt: 'Living room setup featuring the modular Japandi sofa and coffee table',
    boxes: ['b1', 'b2'],
    caption: '2 of 6 boxes — the ModuSofa living set (sofa base + backs).',
    cta: 'Living Set',
    img: '/assets/1-bedroom-kit-builder/188581c175.png',
  },
}

const SEEDED_SPACE_IMAGES = new Set(Object.values(SPACES).map((space) => space.img))

function resolveSpaceImage(space: SpaceKey, hero: KitBuilderSpaceData['hero']): string {
  const cmsImage = resolveStorefrontMedia(
    (typeof hero === 'object' && hero?.url) || (typeof hero === 'string' && hero),
  )

  // Preserve custom CMS media, but repair stale databases where the known seeded
  // room renders were linked to the wrong space record.
  if (!cmsImage || (SEEDED_SPACE_IMAGES.has(cmsImage) && cmsImage !== SPACES[space].img)) {
    return SPACES[space].img
  }

  return cmsImage
}

const BOX_LIST = [
  { id: 'b1', img: '/assets/1-bedroom-kit-builder/5ce35b6043.png', name: 'Sofa Base', num: 'Box 1' },
  { id: 'b2', img: '/assets/1-bedroom-kit-builder/b23c77bfdd.png', name: 'Sofa Backs', num: 'Box 2' },
  { id: 'b3', img: '/assets/1-bedroom-kit-builder/5c675ca5bd.png', name: 'Coffee Table', num: 'Box 3' },
  { id: 'b4', img: '/assets/1-bedroom-kit-builder/b0bf525a54.png', name: 'TV Console', num: 'Box 4' },
  { id: 'b5', img: '/assets/1-bedroom-kit-builder/d4a4793ee2.png', name: 'Snap Bed Frame', num: 'Box 5' },
  { id: 'b6', img: '/assets/1-bedroom-kit-builder/d66ddc7ba1.png', name: '2x Nightstands', num: 'Box 6' },
]

const FABRIC_ITEMS = [
  { id: 'boucle', img: '/assets/1-bedroom-kit-builder/ec621fdd7b.png', label: 'Cream Bouclé' },
  { id: 'corduroy', img: '/assets/1-bedroom-kit-builder/42c66f93ee.png', label: 'Caramel Corduroy' },
  { id: 'chenille', img: '/assets/1-bedroom-kit-builder/359e11ad79.png', label: 'Olive Chenille' },
  { id: 'techGrey', img: '/assets/1-bedroom-kit-builder/13266a8714.png', label: 'Tech Grey' },
]

export type KitBuilderProductData = {
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
  id?: string | number
  joineryType?: string | null
  priceInUSD?: number | null
  shippingWeightKg?: number | null
  slug?: string
  subtitle?: string | null
  title?: string
  variants?: StorefrontVariant[]
}

export type KitBuilderSpaceData = {
  hero?: { url?: string | null } | string | null
  id?: string | number
  intro?: string | null
  slug?: string
  title?: string
}

export type KitBuilderMaterialData = {
  facts?: Array<{ body: string; label: string }> | null
  id?: string | number
  intro?: string | null
  slug?: string
  title?: string
}

export type KitBuilderProps = {
  bedProduct?: KitBuilderProductData | null
  bundleProduct?: KitBuilderProductData | null
  checkoutEnabled?: boolean
  livingProduct?: KitBuilderProductData | null
  materials?: KitBuilderMaterialData[] | null
  spaces?: KitBuilderSpaceData[] | null
}

function KitBuilderInner({
  bedProduct,
  bundleProduct,
  checkoutEnabled = false,
  livingProduct,
  materials,
  spaces,
}: KitBuilderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const isRtl = localeDetails[locale as keyof typeof localeDetails]?.dir === 'rtl'
  const tKit = useTranslations('Pages.KitBuilder')
  const tCommon = useTranslations('Common')
  const { formatCurrency } = useCurrency()

  const spaceParam = searchParams.get('space')
  const [space, setSpace] = useState<SpaceKey>(
    spaceParam === 'living' || spaceParam === 'bedroom' ? spaceParam : 'full',
  )
  const [bed, setBed] = useState<'queen' | 'king'>(searchParams.get('bed') === 'king' ? 'king' : 'queen')
  const initialFabricItem = FABRIC_ITEMS.find((f) => f.id === searchParams.get('fabric'))
  const [fabric, setFabric] = useState(initialFabricItem?.label || 'Caramel Corduroy')

  const oakMaterial = materials?.find((m) => m.slug === 'white-oak')
  const walnutMaterial = materials?.find((m) => m.slug === 'black-walnut')
  const defaultWood = oakMaterial?.title || 'Natural White Oak'
  const walnutLabel = walnutMaterial?.title || 'Smoked Walnut'
  const [wood, setWood] = useState(searchParams.get('wood') === 'walnut' ? walnutLabel : defaultWood)

  const [isAdded, setIsAdded] = useState(false)
  const [cartError, setCartError] = useState(false)
  const [showMobilePurchaseBar, setShowMobilePurchaseBar] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isNavigatingRef = useRef(false)
  const previousSpace = useRef<SpaceKey>(space)

  const spaceWholeHome = spaces?.find((s) => s.slug === 'whole-home')
  const spaceLivingDoc = spaces?.find((s) => s.slug === 'living-room')
  const spaceBedroomDoc = spaces?.find((s) => s.slug === 'bedroom')

  const dynamicSpaces: Record<
    SpaceKey,
    {
      alt: string
      boxes: string[]
      caption: string
      cta: string
      img: string
    }
  > = {
    bedroom: {
      alt: SPACES.bedroom.alt,
      boxes: ['b5', 'b6'],
      caption: spaceBedroomDoc?.intro || SPACES.bedroom.caption,
      cta: spaceBedroomDoc?.title || tKit('bedroom'),
      img: resolveSpaceImage('bedroom', spaceBedroomDoc?.hero),
    },
    full: {
      alt: SPACES.full.alt,
      boxes: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
      caption: spaceWholeHome?.intro || SPACES.full.caption,
      cta: spaceWholeHome?.title || tKit('fullHome'),
      img: resolveSpaceImage('full', spaceWholeHome?.hero),
    },
    living: {
      alt: SPACES.living.alt,
      boxes: ['b1', 'b2'],
      caption: spaceLivingDoc?.intro || SPACES.living.caption,
      cta: spaceLivingDoc?.title || tKit('living'),
      img: resolveSpaceImage('living', spaceLivingDoc?.hero),
    },
  }

  const currentSpace = dynamicSpaces[space]
  const currentProduct =
    space === 'full' ? bundleProduct : space === 'living' ? livingProduct : bedProduct
  const isLiving = space === 'living'

  // Keep the customizer selection shareable/restorable via the URL query string.
  useEffect(() => {
    if (isNavigatingRef.current) return
    const query: Record<string, string> = {}
    if (space !== 'full') query.space = space
    const fabricId = FABRIC_ITEMS.find((f) => f.label === fabric)?.id
    if (fabricId && fabricId !== 'corduroy') query.fabric = fabricId
    if (wood === walnutLabel) query.wood = 'walnut'
    if (!isLiving && bed !== 'queen') query.bed = bed
    router.replace(
      Object.keys(query).length > 0 ? { pathname, query } : { pathname },
      { scroll: false },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, bed, fabric, wood, isLiving])

  useEffect(() => {
    const customizer = rootRef.current?.querySelector('[data-kit-customizer]')
    if (!customizer || !window.matchMedia('(max-width: 767px)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShowMobilePurchaseBar(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0.05 },
    )
    observer.observe(customizer)
    return () => observer.disconnect()
  }, [])

  const boxBreakdownMap = new Map(
    (bundleProduct?.boxBreakdown || []).map((b) => [b.boxId, b]),
  )

  const resolvedBoxList = BOX_LIST.map((b) => {
    const cmsBox = boxBreakdownMap.get(b.id)
    const fallbackName = tKit.has(`boxes.${b.id}`) ? tKit(`boxes.${b.id}`) : b.name
    return {
      ...b,
      name: cmsBox?.title || fallbackName,
      description: cmsBox?.description || undefined,
    }
  })

  const fabricId = FABRIC_ITEMS.find((item) => item.label === fabric)?.id || 'corduroy'
  const selection = {
    ...(isLiving || space === 'full' ? { upholstery: fabricId } : {}),
    'wood-finish': wood === walnutLabel ? 'walnut' : 'oak',
    ...(!isLiving ? { 'bed-size': bed } : {}),
  }
  const selectedVariant = findStorefrontVariant(currentProduct?.variants, selection)
  const checkoutEligibility = currentProduct?.checkout
    ? getStorefrontCheckoutEligibility(currentProduct.checkout, currentProduct.variants, selection)
    : { available: false, code: 'CATALOG_UNAVAILABLE', requiresVariant: true }
  const configuredPrice =
    checkoutEligibility.available && typeof selectedVariant?.price === 'number' && selectedVariant.price > 0
      ? selectedVariant.price
      : undefined
  const canAddToCart = checkoutEnabled && checkoutEligibility.available && Boolean(selectedVariant) &&
    configuredPrice !== undefined
  const total = configuredPrice

  useGSAP(
    () => {
      if (previousSpace.current === space) return
      previousSpace.current = space
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const includedBoxes = gsap.utils.toArray<HTMLElement>('[data-box-included="true"]')
      const totalEl = rootRef.current?.querySelector<HTMLElement>('[data-kit-total]')
      const targets = [...includedBoxes, ...(totalEl ? [totalEl] : [])]
      gsap.killTweensOf(targets)
      gsap.fromTo(
        includedBoxes,
        { autoAlpha: 0.55, scale: reduceMotion ? 1 : 0.96 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: reduceMotion ? 0.12 : 0.32,
          ease: 'power3.out',
          stagger: { amount: reduceMotion ? 0.02 : 0.12 },
          overwrite: 'auto',
          willChange: 'transform,opacity',
          clearProps: 'transform,opacity,visibility,willChange',
        },
      )
      if (totalEl) {
        gsap.fromTo(
          totalEl,
          { autoAlpha: 0.62, y: reduceMotion ? 0 : 6 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduceMotion ? 0.12 : 0.3,
            ease: 'power3.out',
            overwrite: 'auto',
            willChange: 'transform,opacity',
            clearProps: 'transform,opacity,visibility,willChange',
          },
        )
      }
    },
    { dependencies: [space], scope: rootRef },
  )

  useGSAP(
    () => {
      if (!isAdded) return
      const button = rootRef.current?.querySelector<HTMLElement>('[data-kit-add]')
      if (!button) return
      gsap.timeline({ defaults: { overwrite: 'auto' } })
        .to(button, { scale: 0.975, duration: 0.07, ease: 'power1.out', willChange: 'transform' })
        .to(button, { scale: 1, duration: 0.1, ease: 'power3.out', clearProps: 'transform,willChange' })
    },
    { dependencies: [isAdded], scope: rootRef },
  )

  const handleAddToCart = () => {
    const cart = typeof window !== 'undefined' ? (window as any).modulivCart : null
    if (
      isAdded ||
      !canAddToCart ||
      !currentProduct?.slug ||
      !selectedVariant ||
      configuredPrice === undefined ||
      !cart ||
      typeof cart.add !== 'function'
    ) {
      setCartError(true)
      setTimeout(() => setCartError(false), 4000)
      return
    }

    const variantParts = [fabric, wood]
    if (!isLiving) variantParts.push(bed === 'king' ? tKit('king') : tKit('queen'))

    cart.add(1, {
      boxCount: currentSpace.boxes.length,
      id: currentProduct.slug,
      image: currentSpace.img,
      // The CMS has no exact multi-option image association for this view.
      imageIsRepresentative: true,
      name: currentProduct.title || currentSpace.cta,
      price: configuredPrice,
      qty: 1,
      shippingWeightKg: currentProduct.shippingWeightKg || undefined,
      variant: variantParts.join(' · '),
      variantId: selectedVariant.id,
    })

    setCartError(false)
    isNavigatingRef.current = true
    setIsAdded(true)
    setTimeout(() => {
      router.push('/cart')
    }, 550)
  }

  return (
    <div className="w-full" ref={rootRef}>
      <main
        className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
        id="main"
        tabIndex={-1}
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-label-md text-on-surface-variant mb-8 gap-2">
          <Link className="hover:text-primary transition-colors" href="/">
            {tCommon('home')}
          </Link>
          {isRtl ? <ArrowLeft aria-hidden="true" size={16} /> : <ArrowRight aria-hidden="true" size={16} />}
          <span className="text-on-surface font-medium">{tKit('title')}</span>
        </nav>

        {/* Header */}
        <header className="mb-12 max-w-3xl">
          <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
            {tKit('headerEyebrow')}
          </span>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6">
            {bundleProduct?.title || tKit('title')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {bundleProduct?.subtitle || tKit('subtitle')}
          </p>
        </header>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative items-start">
          {/* Left Column: Interactive Render */}
          <div className="lg:col-span-7 lg:sticky top-32 flex flex-col gap-6 w-full z-10">
            <div className="w-full aspect-[4/3] md:aspect-video bg-surface-container-low rounded-xl overflow-hidden relative group shadow-sm transition-shadow duration-500">
              <AnimatedImageSwap
                alt={currentSpace.alt}
                className="absolute inset-0"
                imageClassName="object-cover"
                src={currentSpace.img}
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              {/* Space Toggles */}
              <div
                aria-label={tKit('roomView')}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-lowest/80 backdrop-blur-md rounded-full p-1.5 flex shadow-sm border border-outline-variant/30 z-10"
                role="group"
              >
                {(['full', 'living', 'bedroom'] as const).map((sKey) => {
                  const active = space === sKey
                  const label = dynamicSpaces[sKey].cta
                  return (
                    <button
                      aria-pressed={active}
                      className={`px-5 py-2 rounded-full font-label-md text-[12px] uppercase tracking-wider transition-colors cursor-pointer ${
                        active
                          ? 'bg-on-surface text-on-primary'
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
            {selectedVariant && (
              <p className="text-xs text-on-surface-variant" data-kit-image-disclosure="">
                {tKit('representativeImage')}
              </p>
            )}

            {/* Boxes Strip */}
            <div className="flex flex-col gap-3">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                {tKit('whatsInSixBoxes')}
              </h2>
              <p aria-live="polite" className="font-body-md text-sm text-on-surface-variant">
                {currentSpace.caption}
              </p>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
                {resolvedBoxList.map((b, idx) => {
                  const included = currentSpace.boxes.includes(b.id)
                  return (
                    <div
                      data-box-included={included}
                      className={`min-w-[120px] max-w-[120px] flex flex-col gap-2 group transition-opacity ${
                        included ? 'opacity-100' : 'opacity-30'
                      }`}
                      key={b.id}
                    >
                      <div className="relative aspect-square w-full bg-surface-container rounded-lg overflow-hidden border border-transparent group-hover:border-outline-variant transition-colors flex items-center justify-center p-4">
                        <Image
                          alt={b.name}
                          className="object-contain mix-blend-multiply opacity-80 p-2"
                          src={b.img}
                          fill
                          sizes="120px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-[11px] text-on-surface-variant uppercase">
                          {tKit('boxNum', { number: idx + 1 })}
                        </span>
                        <span className="font-body-md text-sm text-on-surface">{b.name}</span>
                        {b.description && (
                          <span className="font-body-md text-[10px] text-on-surface-variant/80 line-clamp-2 mt-0.5" title={b.description}>
                            {b.description}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Steps */}
          <div className="lg:col-span-5 flex flex-col gap-12 pt-8 lg:pt-0" data-kit-customizer="">
            {/* Fabric is relevant to the sofa and full-home bundle, never the bed-only set. */}
            {space !== 'bedroom' && (
              <section className="border-b border-outline-variant pb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                    {tKit('step1')}
                  </span>
                  <h2 className="font-headline-md text-[28px] text-on-surface">{tKit('upholsteryFabric')}</h2>
                </div>
                <span className="font-body-md text-sm text-on-surface-variant">{fabric}</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {FABRIC_ITEMS.map((item) => {
                  const sel = fabric === item.label
                  const fabLabel = tKit.has(`fabrics.${item.id}`) ? tKit(`fabrics.${item.id}`) : item.label
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
                        {fabLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
              </section>
            )}

            {/* Wood Finish */}
            <section className="border-b border-outline-variant pb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-label-md text-[12px] text-primary uppercase tracking-widest mb-1 block">
                    {tKit(space === 'bedroom' ? 'step1' : 'step2')}
                  </span>
                  <h2 className="font-headline-md text-[28px] text-on-surface">{tKit('woodFinish')}</h2>
                </div>
                <span className="font-body-md text-sm text-on-surface-variant">{wood}</span>
              </div>
              <div className="flex gap-6">
                {[
                  { label: defaultWood, img: '/assets/1-bedroom-kit-builder/ebd8892f4c.png' },
                  { label: walnutLabel, img: '/assets/1-bedroom-kit-builder/wood-walnut.png' },
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
                          <CircleCheck aria-hidden="true" className="text-primary" size={20} />
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
                      {tKit(space === 'bedroom' ? 'step2' : 'step3')}
                    </span>
                    <h2 className="font-headline-md text-[28px] text-on-surface">{tKit('bedFrameSize')}</h2>
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
                    <span className="font-medium text-lg">{tKit('queen')}</span>
                    <span className="text-[13px] text-on-surface-variant">{tKit('included')}</span>
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
                    <span className="font-medium text-lg">{tKit('king')}</span>
                    <span className="text-[13px] text-on-surface-variant">{tKit('priceShownAfterSelection')}</span>
                  </button>
                </div>
              </section>
            )}

            <section className="pb-4">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-outline-variant bg-surface-container-low">
                <div className="flex items-center h-6 pt-1">
                  <Gift aria-hidden="true" className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body-md font-medium text-on-surface text-[16px]">
                      {tKit('notReadyTitle')}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant mb-3">
                    {tKit('notReadyDesc')}
                  </p>
                  <Link
                    className="font-label-md text-[13px] text-primary uppercase tracking-wider underline hover:text-on-surface transition-colors"
                    href="/free-swatch-box-material-discovery"
                  >
                    {tKit('orderFreeSwatches')}
                  </Link>
                </div>
              </div>
            </section>

            {/* Quote and configuration facts only; delivery inclusions are not known until quote. */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 pb-4 text-on-surface-variant">
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <Wrench aria-hidden="true" className="text-primary" size={16} />
                {tKit('zeroScrews')}
              </span>
              <span className="flex items-center gap-1.5 font-label-md text-[12px] uppercase tracking-wider">
                <Truck aria-hidden="true" className="text-primary" size={16} />
                {tKit('destinationQuoteRequired')}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className={`${showMobilePurchaseBar ? 'block' : 'hidden'} fixed bottom-0 left-0 right-0 z-50 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(26,28,29,0.04)] backdrop-blur-md border-t border-outline-variant md:static md:block md:bg-surface md:pb-0 md:shadow-none`}>
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-3 md:py-4 flex flex-row justify-between items-center gap-3 md:gap-4">
          <div aria-live="polite" className="flex flex-col items-start min-w-0 md:w-auto">
            <div className="flex items-end gap-3">
              <span data-kit-total="" className="font-headline-md text-xl md:text-3xl text-on-surface whitespace-nowrap" dir="ltr" id="kit-total">
                {total === undefined ? tKit('priceUnavailable') : formatCurrency(total, { locale })}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 mt-1 text-on-surface-variant">
              <Truck aria-hidden="true" size={16} />
              <span className="font-body-md text-[13px]">{tKit('destinationQuoteRequired')}</span>
            </div>
            {cartError && (
              <p aria-live="assertive" className="font-body-md text-[13px] text-error mt-1" role="alert">
                {tCommon('cartError')}
              </p>
            )}
          </div>
          <div className="flex flex-row gap-3 flex-1 justify-end md:w-auto">
            <Link
              className="hidden md:block px-6 py-4 rounded-full border border-on-surface text-on-surface font-label-md text-sm uppercase tracking-wider hover:bg-on-background hover:text-on-primary transition-colors text-center"
              href="/free-swatch-box-material-discovery"
            >
              {tKit('orderSwatchesFirst')}
            </Link>
            {canAddToCart ? (
              <button
                data-kit-add=""
                className="px-4 md:px-8 py-3 md:py-4 rounded-full bg-on-surface text-on-primary font-label-md text-xs md:text-sm uppercase tracking-wider hover:bg-primary transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 min-w-0"
                disabled={isAdded}
                id="kit-add"
                onClick={handleAddToCart}
                type="button"
              >
                <span>
                  {isAdded
                    ? tKit('addedOpeningCart')
                    : tKit('addToCartButton', { space: currentSpace.cta, count: currentSpace.boxes.length })}
                </span>
                {isAdded
                  ? <CircleCheck aria-hidden="true" size={18} />
                  : isRtl
                    ? <ArrowLeft aria-hidden="true" size={18} />
                    : <ShoppingCart aria-hidden="true" size={18} />}
              </button>
            ) : (
              <p
                aria-live="polite"
                className="max-w-xs rounded-lg bg-surface-container px-4 py-3 text-sm text-on-surface-variant"
                data-kit-purchase-unavailable=""
                role="status"
              >
                {checkoutEnabled ? tKit('configurationUnavailable') : tKit('onlineCheckoutUnavailable')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function KitBuilder(props: KitBuilderProps = {}) {
  return (
    <Suspense fallback={null}>
      <KitBuilderInner {...props} />
    </Suspense>
  )
}
