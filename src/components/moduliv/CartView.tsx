'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useCart, useCurrency, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ODSAI_DESTINATIONS } from '@/lib/commerce/ddp'
import { isValidVoucherCode, normalizeVoucherCode } from '@/lib/commerce/vouchers'
import { CheckoutValidationError, normalizeCheckoutAddress } from '@/lib/commerce/checkoutValidation'
import { localeDetails } from '@/i18n/routing'

const THUMBS: Record<string, string> = {
  'bundle-1bed': '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
  modusofa: '/assets/modusofa-product-detail-page/e38c85e68d.png',
}

// Local cart items carry synthetic ids from KitBuilder/ProductDetail (e.g. 'bundle-1bed'),
// which don't always match the real Payload `products.slug`. Individual products already
// use their real slug as the cart item id — only the bundle needs an alias.
// Money is handled in cents end to end — the catalog stores cents, the DDP quote
// requires cents, and Stripe is charged cents. The v1 key held dollar amounts, so
// it is abandoned rather than reinterpreted: reading an old cart as cents would
// price a $699 sofa at $6.99.
const CART_ITEMS_KEY = 'moduliv-cart-items-v2'
const VOUCHER_DISCOUNT_CENTS = 5000
const VOUCHER_CODE_KEY = 'moduliv-voucher-code'

const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'bundle-1bed': '1-bedroom-kit',
}

// Mirrors checkoutValidation.ts's (unexported) countriesRequiringState — used here only to
// show a hint before submit; the server remains the authority and will reject a missing
// state for these countries regardless.
const STATE_HINT_COUNTRIES = new Set(['US', 'CA', 'AU'])

type CheckoutStep = 'cart' | 'address' | 'payment'
type StripeStatus = 'unknown' | 'configured' | 'disabled' | 'misconfigured'

type AddressFormValues = {
  email: string
  firstName: string
  lastName: string
  company: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

let stripeJsPromise: Promise<any> | null = null
function loadStripeJs(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if ((window as any).Stripe) return Promise.resolve((window as any).Stripe)
  if (!stripeJsPromise) {
    stripeJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      script.onload = () => resolve((window as any).Stripe)
      script.onerror = () => reject(new Error('Failed to load Stripe.js'))
      document.head.appendChild(script)
    })
  }
  return stripeJsPromise
}

function readCartFromStorage(): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_ITEMS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function readVoucherFromStorage(): string {
  if (typeof window === 'undefined') return ''
  try {
    return normalizeVoucherCode(localStorage.getItem(VOUCHER_CODE_KEY))
  } catch {
    return ''
  }
}

export function CartView({ publishableKey }: { publishableKey: string }) {
  const t = useTranslations('Transaction')
  const tCommon = useTranslations('Common')
  const locale = useLocale()
  const isRtl = localeDetails[locale as keyof typeof localeDetails]?.dir === 'rtl'

  // Client-first localStorage read avoids an empty-cart flash on first paint.
  const [items, setItems] = useState<any[]>(() => readCartFromStorage())
  const [appliedVoucherCode, setAppliedVoucherCode] = useState(() => readVoucherFromStorage())
  const voucherApplied = isValidVoucherCode(appliedVoucherCode)
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(
    null,
  )
  const [isOrdered, setIsOrdered] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  const [undoState, setUndoState] = useState<{ index: number; item: any } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { formatCurrency } = useCurrency()
  const { addItem, clearCart } = useCart()
  const { confirmOrder, initiatePayment, paymentMethods } = usePayments()
  const stripeReady = paymentMethods.some((m) => m.name === 'stripe') && Boolean(publishableKey)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [amountDueCents, setAmountDueCents] = useState<number | null>(null)
  const stripeRef = useRef<{ elements: any; stripe: any } | null>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<AddressFormValues>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
    },
  })
  const watchedCountry = watch('country')

  const loadCart = () => {
    setItems(readCartFromStorage())
    setAppliedVoucherCode(readVoucherFromStorage())
  }

  useEffect(() => {
    const handleCartUpdate = () => loadCart()
    window.addEventListener('moduliv:cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)
    return () => {
      window.removeEventListener('moduliv:cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    if (items.length === 0 && checkoutStep !== 'cart') {
      setCheckoutStep('cart')
    }
  }, [items.length, checkoutStep])

  // Mount the Stripe Payment Element once we have a clientSecret for this payment step.
  useEffect(() => {
    if (checkoutStep !== 'payment' || !clientSecret || !publishableKey) return
    let cancelled = false

    loadStripeJs()
      .then((StripeCtor) => {
        if (cancelled) return
        const stripe = StripeCtor(publishableKey)
        const elements = stripe.elements({ clientSecret })
        const paymentElement = elements.create('payment')
        paymentElement.mount('#checkout-payment-element')
        stripeRef.current = { elements, stripe }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }: any) => {
          if (!cancelled && paymentIntent) setAmountDueCents(paymentIntent.amount)
        })
      })
      .catch(() => {
        if (!cancelled) setCheckoutError(t('checkoutErrorGeneric'))
      })

    return () => {
      cancelled = true
      stripeRef.current = null
    }
  }, [checkoutStep, clientSecret, publishableKey, t])

  const removeAt = (idx: number) => {
    const removed = items[idx]
    if (!removed) return
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
    setUndoState({ index: idx, item: removed })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoState(null), 6000)
  }

  const updateQuantity = (idx: number, delta: number) => {
    const cur = items[idx]
    if (!cur) return
    const nextQty = (cur.qty || 1) + delta
    if (nextQty <= 0) {
      removeAt(idx)
      return
    }
    const next = items.map((it, i) => (i === idx ? { ...it, qty: nextQty } : it))
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
  }

  const removeItem = (idx: number) => removeAt(idx)

  const handleUndoRemove = () => {
    if (!undoState) return
    const next = [...items]
    next.splice(undoState.index, 0, undoState.item)
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState(null)
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = normalizeVoucherCode(promoCode)
    if (isValidVoucherCode(trimmed)) {
      setAppliedVoucherCode(trimmed)
      localStorage.setItem(VOUCHER_CODE_KEY, trimmed)
      setPromoMessage({
        // promoSuccess's message text carries a hardcoded "−$" prefix (messages/ is out of
        // scope here), so this is a plain locale-formatted decimal, not a currency string.
        text: t('promoSuccess', {
          amount: new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(50),
          code: trimmed,
        }),
        type: 'success',
      })
    } else {
      setPromoMessage({
        text: t('promoInvalid'),
        type: 'error',
      })
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucherCode('')
    localStorage.removeItem(VOUCHER_CODE_KEY)
    setPromoMessage(null)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0)
  const discount = voucherApplied ? VOUCHER_DISCOUNT_CENTS : 0
  const total = Math.max(0, subtotal - discount)

  // Resolves local cart items (synthetic ids) to real Payload `products` document ids so
  // a real cart/transaction can be created. Throws if any item can't be resolved rather
  // than silently dropping it from the order.
  const resolveCartItems = async (): Promise<
    { catalogPrice: number; product: number; quantity: number }[]
  > => {
    const slugs = [...new Set(items.map((it) => PRODUCT_SLUG_ALIASES[it.id] || it.id))]
    const res = await fetch(
      `/api/products?where[slug][in]=${slugs.map(encodeURIComponent).join(',')}&depth=0&limit=${slugs.length}`,
    )
    if (!res.ok) throw new Error(t('itemUnavailable'))
    const data = await res.json()
    const bySlug = new Map<string, { id: number; priceInUSD: number }>(
      (data?.docs || []).map((doc: any) => [doc.slug, { id: doc.id, priceInUSD: doc.priceInUSD }]),
    )

    return items.map((it) => {
      const slug = PRODUCT_SLUG_ALIASES[it.id] || it.id
      const found = bySlug.get(slug)
      if (!found) throw new Error(t('itemUnavailable'))
      return {
        catalogPrice: found.priceInUSD ?? 0,
        product: found.id,
        quantity: Math.max(1, it.qty || 1),
      }
    })
  }

  const onSubmitAddress = async (values: AddressFormValues) => {
    setCheckoutError(null)

    if (!stripeReady) {
      setCheckoutError(t('checkoutUnavailable'))
      return
    }
    if (!values.email || !/^\S+@\S+\.\S+$/.test(values.email)) {
      setCheckoutError(t('emailInvalid'))
      return
    }

    let address
    try {
      address = normalizeCheckoutAddress(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          company: values.company,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phone: values.phone,
        },
        'shipping',
      )
    } catch (err) {
      setCheckoutError(err instanceof CheckoutValidationError ? err.message : t('checkoutErrorGeneric'))
      return
    }

    setIsSubmittingAddress(true)
    try {
      const resolvedItems = await resolveCartItems()

      // Stripe is charged cart.subtotal, which the server recomputes from catalog
      // prices alone (see the ecommerce plugin's carts/beforeChange). It knows
      // nothing about the KitBuilder surcharges or the voucher, both of which are
      // applied locally — so the amount shown here and the amount charged can
      // diverge in either direction. Refuse instead of letting them.
      const catalogTotal = resolvedItems.reduce(
        (sum, item) => sum + item.catalogPrice * item.quantity,
        0,
      )
      if (catalogTotal !== subtotal) {
        console.error(
          `[checkout] price mismatch — cart subtotal ${subtotal} cents, catalog says ${catalogTotal} cents. ` +
            'KitBuilder surcharges and the voucher are not modelled in the catalog.',
        )
        throw new Error(t('checkoutErrorGeneric'))
      }

      await clearCart()
      for (const item of resolvedItems) {
        await addItem({ product: item.product }, item.quantity)
      }

      const initiated = (await initiatePayment('stripe', {
        additionalData: {
          billingAddress: address,
          customerEmail: values.email,
          locale,
          shippingAddress: address,
          // Previewed above, but only honoured if the server recognises it — the
          // charged amount comes back from the PaymentIntent, not from here.
          voucherCode: voucherApplied ? appliedVoucherCode : undefined,
        },
      })) as { clientSecret?: string } | undefined

      if (!initiated?.clientSecret) throw new Error(t('checkoutErrorGeneric'))

      setCheckoutEmail(values.email)
      setClientSecret(initiated.clientSecret)
      setAmountDueCents(null)
      setCheckoutStep('payment')
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t('checkoutErrorGeneric'))
    } finally {
      setIsSubmittingAddress(false)
    }
  }

  const handlePay = async () => {
    if (!stripeRef.current) return
    setCheckoutError(null)
    setIsPaying(true)
    try {
      const { elements, stripe } = stripeRef.current
      const { error: submitError } = await elements.submit()
      if (submitError) throw new Error(submitError.message || t('checkoutErrorGeneric'))

      const { error, paymentIntent } = await stripe.confirmPayment({
        confirmParams: { return_url: window.location.href },
        elements,
        redirect: 'if_required',
      })
      if (error) throw new Error(error.message || t('checkoutErrorGeneric'))
      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error(t('checkoutErrorGeneric'))
      }

      const confirmed = (await confirmOrder('stripe', {
        additionalData: { customerEmail: checkoutEmail, paymentIntentID: paymentIntent.id },
      })) as { orderID?: number | string } | undefined

      if (!confirmed?.orderID) throw new Error(t('checkoutErrorGeneric'))

      setOrderRef(String(confirmed.orderID))
      setIsOrdered(true)
      if (typeof window !== 'undefined' && (window as any).modulivCart) {
        ;(window as any).modulivCart.setItems([])
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t('checkoutErrorGeneric'))
    } finally {
      setIsPaying(false)
    }
  }

  const checkoutDisabled = !stripeReady
  const ctaClass =
    'bg-on-background text-on-primary py-4 px-8 font-label-md text-label-md uppercase hover:bg-primary transition-colors duration-300 inline-flex items-center justify-center rounded-full'

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          {tCommon('home')}
        </Link>
        <span className="material-symbols-outlined text-[16px]">{isRtl ? 'chevron_left' : 'chevron_right'}</span>
        <span className="text-on-surface font-medium">{t('cartTitle')}</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">{t('cartTitle')}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {t('cartDescription')}
        </p>
      </header>

      {/* Done State */}
      {isOrdered ? (
        <section className="border border-outline-variant/40 bg-surface-container-lowest px-6 py-16 md:py-24 text-center rounded-xl">
          <span className="inline-flex w-16 h-16 rounded-full bg-primary-fixed/30 items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[36px] text-primary">check_circle</span>
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            {t('orderConfirmed')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
            {t('orderConfirmedDesc')}
          </p>
          <p className="font-label-md text-label-md uppercase tracking-wider text-primary mt-6 mb-8">
            {t('orderRef')} <span dir="ltr" id="order-ref">{orderRef}</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link className={ctaClass} href="/">
              {t('backHome')}
            </Link>
            <Link
              className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/how-it-works-craft-logistics"
            >
              {t('seeNext')}
            </Link>
          </div>
        </section>
      ) : items.length === 0 ? (
        /* Empty State */
        <section className="border border-outline-variant/40 bg-surface-container-lowest px-6 py-16 md:py-24 text-center rounded-xl">
          <span className="material-symbols-outlined text-[56px] text-outline">shopping_cart</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mt-4 mb-2">
            {t('emptyCart')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
            {t('emptyCartPrompt')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link className={ctaClass} href="/1-bedroom-kit-builder">
              {t('continueShopping')}
            </Link>
            <Link
              className="border border-on-background text-on-background py-4 px-8 font-label-md text-label-md uppercase hover:bg-surface-container-low transition-colors duration-300 inline-flex items-center justify-center rounded-full"
              href="/products/modusofa"
            >
              {t('exploreModusofa')}
            </Link>
          </div>
        </section>
      ) : (
        /* Filled State */
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-7">
            {undoState && (
              <div
                aria-live="polite"
                className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-sm"
                role="status"
              >
                <span className="text-on-surface">{t('itemRemoved')}</span>
                <button
                  className="font-label-md text-xs uppercase tracking-wider text-primary underline cursor-pointer"
                  onClick={handleUndoRemove}
                  type="button"
                >
                  {t('undo')}
                </button>
              </div>
            )}
            <div className="divide-y divide-outline-variant/30 border-t border-b border-outline-variant/30">
              {items.map((it, idx) => (
                <article className="flex flex-col sm:flex-row gap-5 py-6" key={`${it.id}-${idx}`}>
                  <div className="relative w-full sm:w-28 h-28 bg-surface-container overflow-hidden shrink-0 rounded-lg">
                    <Image
                      alt={it.name || 'Cart item thumbnail'}
                      className="object-cover"
                      fill
                      sizes="112px"
                      src={THUMBS[it.id] || '/assets/homepage/hero-split.png'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 items-baseline">
                      <h3 className="font-headline-sm text-[19px] text-on-surface">{it.name}</h3>
                      <span className="font-medium text-on-surface whitespace-nowrap" dir="ltr">
                        {formatCurrency((it.price || 0) * (it.qty || 1), { locale })}
                      </span>
                    </div>
                    {it.variant && (
                      <p className="font-body-md text-sm text-on-surface-variant mt-1">{it.variant}</p>
                    )}
                    <div className="flex items-center gap-5 mt-4">
                      <div className="inline-flex items-center border border-outline-variant rounded">
                        <button
                          aria-label={t('decreaseQuantity')}
                          className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          onClick={() => updateQuantity(idx, -1)}
                          type="button"
                        >
                          −
                        </button>
                        <span aria-live="polite" className="w-9 text-center font-label-md text-sm">
                          {it.qty}
                        </span>
                        <button
                          aria-label={t('increaseQuantity')}
                          className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 lg:p-8 sticky top-28">
            <h2 className="font-headline-sm text-xl text-on-surface mb-6">{t('orderSummary')}</h2>
            <dl className="space-y-4 font-body-md text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">{t('subtotal')}</dt>
                <dd className="font-medium text-on-surface" dir="ltr">{formatCurrency(subtotal, { locale })}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant flex items-center gap-1">
                  <span>{t('shipping')}</span>
                  <span className="text-[11px] text-neutral-600 font-normal">{t('shippingDdpNote')}</span>
                </dt>
                <dd className="text-primary font-medium">
                  {t('included')} <span dir="ltr">({formatCurrency(0, { locale })})</span>
                </dd>
              </div>

              {/* DDP Logistics & IKEA Savings Callout */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>{t('freeShippingBadge', { amount: formatCurrency(25500, { locale }) })}</span>
                </div>
                <p className="text-neutral-600 leading-relaxed text-[11px]">
                  {t('freeShippingDetail', { boxes: 6, weight: 102 })}
                </p>
                <div className="pt-1 border-t border-primary/10 flex justify-between items-center text-[11px]">
                  <span className="text-neutral-600">{t('ikeaCompareLabel')}</span>
                  <Link href="/us-vs-ikea" className="font-bold text-emerald-700 hover:underline">
                    {t('ikeaCompareCta', { amount: formatCurrency(69000, { locale }) })}
                  </Link>
                </div>
              </div>

              {voucherApplied && (
                <div className="flex justify-between gap-4 items-center border border-primary/30 bg-primary-fixed/20 px-3 py-2 rounded">
                  <dt className="text-on-surface">
                    {t('voucher')} <span className="font-label-md text-[12px] uppercase tracking-wider text-primary">SWATCH50</span>
                  </dt>
                  <dd className="flex items-center gap-3">
                    <span className="text-primary font-medium" dir="ltr">
                      −{formatCurrency(discount, { locale })}
                    </span>
                    <button
                      aria-label={t('removeVoucher')}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      onClick={handleRemoveVoucher}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </dd>
                </div>
              )}

              {checkoutStep === 'cart' && (
                <div className="pt-3 border-t border-outline-variant/30" id="promo-code-section">
                  <label
                    className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5"
                    htmlFor="promo-code-input"
                  >
                    {t('promoLabel')}
                  </label>
                  <form className="flex gap-2" onSubmit={handleApplyPromo}>
                    <input
                      className="flex-1 px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface uppercase placeholder:normal-case placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary rounded"
                      id="promo-code-input"
                      name="promo"
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={t('promoPlaceholder')}
                      type="text"
                      value={promoCode}
                    />
                    <button
                      className="px-4 py-2 bg-on-background text-on-primary text-xs uppercase font-label-md tracking-wider hover:bg-primary transition-colors cursor-pointer rounded"
                      id="promo-code-submit"
                      type="submit"
                    >
                      {t('promoApply')}
                    </button>
                  </form>
                  {promoMessage && (
                    <p
                      className={`text-xs mt-1.5 ${
                        promoMessage.type === 'success' ? 'text-primary' : 'text-error'
                      }`}
                      id="promo-feedback"
                      role="alert"
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4 border-t border-outline-variant/40 text-lg">
                <dt className="font-medium text-on-surface">{t('total')}</dt>
                <dd className="font-headline-sm text-headline-sm text-on-surface" dir="ltr" id="sum-total">
                  {formatCurrency(total, { locale })}
                </dd>
              </div>
            </dl>

            {checkoutError && (
              <p className="mt-4 text-sm text-error" role="alert">
                {checkoutError}
              </p>
            )}

            {checkoutStep === 'cart' && (
              <>
                <button
                  className={`mt-8 w-full ${ctaClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={checkoutDisabled}
                  id="checkout-btn"
                  onClick={() => setCheckoutStep('address')}
                  type="button"
                >
                  {t('checkout')}
                  <span className="material-symbols-outlined text-[18px] ms-2">
                    {isRtl ? 'arrow_back' : 'arrow_forward'}
                  </span>
                </button>
                {checkoutDisabled && (
                  <p className="mt-2 text-xs text-error" role="alert">
                    {t('checkoutUnavailable')}
                  </p>
                )}
                <p className="mt-4 font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">credit_card</span>
                  {t('paymentMethodsNote')}
                </p>
                <p className="mt-2 font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">verified</span>
                  {t('checkoutSecure')}
                </p>
              </>
            )}

            {checkoutStep === 'address' && (
              <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmitAddress)}>
                <h3 className="font-headline-sm text-base text-on-surface">{t('shippingAddressTitle')}</h3>

                <div>
                  <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-email">
                    {t('emailLabel')}
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                    id="checkout-email"
                    placeholder={t('emailPlaceholder')}
                    type="email"
                    {...register('email', { required: t('fieldRequired') })}
                  />
                  {errors.email && <p className="text-xs text-error mt-1" role="alert">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-firstName">
                      {t('firstNameLabel')}
                    </label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      id="checkout-firstName"
                      type="text"
                      {...register('firstName', { required: t('fieldRequired') })}
                    />
                    {errors.firstName && <p className="text-xs text-error mt-1" role="alert">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-lastName">
                      {t('lastNameLabel')}
                    </label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      id="checkout-lastName"
                      type="text"
                      {...register('lastName', { required: t('fieldRequired') })}
                    />
                    {errors.lastName && <p className="text-xs text-error mt-1" role="alert">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-company">
                    {t('companyLabel')}
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                    id="checkout-company"
                    type="text"
                    {...register('company')}
                  />
                </div>

                <div>
                  <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-addressLine1">
                    {t('addressLine1Label')}
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                    id="checkout-addressLine1"
                    type="text"
                    {...register('addressLine1', { required: t('fieldRequired') })}
                  />
                  {errors.addressLine1 && <p className="text-xs text-error mt-1" role="alert">{errors.addressLine1.message}</p>}
                </div>

                <div>
                  <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-addressLine2">
                    {t('addressLine2Label')}
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                    id="checkout-addressLine2"
                    type="text"
                    {...register('addressLine2')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-city">
                      {t('cityLabel')}
                    </label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      id="checkout-city"
                      type="text"
                      {...register('city', { required: t('fieldRequired') })}
                    />
                    {errors.city && <p className="text-xs text-error mt-1" role="alert">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-state">
                      {t('stateLabel')}
                    </label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      id="checkout-state"
                      type="text"
                      {...register('state')}
                    />
                    {STATE_HINT_COUNTRIES.has(watchedCountry) && (
                      <p className="text-[11px] text-on-surface-variant mt-1">{t('stateHint')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-postalCode">
                      {t('postalCodeLabel')}
                    </label>
                    <input
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      dir="ltr"
                      id="checkout-postalCode"
                      type="text"
                      {...register('postalCode', { required: t('fieldRequired') })}
                    />
                    {errors.postalCode && <p className="text-xs text-error mt-1" role="alert">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-country">
                      {t('countryLabel')}
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                      id="checkout-country"
                      {...register('country', { required: t('fieldRequired') })}
                    >
                      <option value="">{t('countryPlaceholder')}</option>
                      {ODSAI_DESTINATIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {errors.country && <p className="text-xs text-error mt-1" role="alert">{errors.country.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5" htmlFor="checkout-phone">
                    {t('phoneLabel')}
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-outline-variant/60 bg-surface text-on-surface rounded focus:outline-none focus:border-primary"
                    dir="ltr"
                    id="checkout-phone"
                    type="tel"
                    {...register('phone')}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    className={`w-full ${ctaClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isSubmittingAddress}
                    type="submit"
                  >
                    {isSubmittingAddress ? t('resolvingCart') : t('continueToPayment')}
                  </button>
                </div>
                <button
                  className="w-full text-center font-label-md text-xs uppercase tracking-wider text-on-surface-variant underline cursor-pointer"
                  onClick={() => {
                    setCheckoutError(null)
                    setCheckoutStep('cart')
                  }}
                  type="button"
                >
                  {t('backToCart')}
                </button>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div className="mt-8 space-y-4">
                <h3 className="font-headline-sm text-base text-on-surface">{t('paymentTitle')}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{t('amountDueLabel')}</span>
                  <span className="font-medium text-on-surface" dir={amountDueCents === null ? undefined : 'ltr'}>
                    {amountDueCents === null ? t('calculatingTotal') : formatCurrency(amountDueCents, { locale })}
                  </span>
                </div>
                <div id="checkout-payment-element" />
                <button
                  className={`w-full ${ctaClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isPaying}
                  onClick={handlePay}
                  type="button"
                >
                  {isPaying ? t('paying') : t('payNow')}
                </button>
                <button
                  className="w-full text-center font-label-md text-xs uppercase tracking-wider text-on-surface-variant underline cursor-pointer"
                  disabled={isPaying}
                  onClick={() => {
                    setCheckoutError(null)
                    setClientSecret(null)
                    setCheckoutStep('address')
                  }}
                  type="button"
                >
                  {t('backToAddress')}
                </button>
                <p className="font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">credit_card</span>
                  {t('paymentMethodsNote')}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
