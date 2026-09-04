'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { isODSaiDestination, ODSAI_DESTINATIONS } from '@/lib/commerce/ddp'
import {
  isValidVoucherCode,
  normalizeVoucherCode,
  VOUCHER_REDEMPTION_ENABLED,
} from '@/lib/commerce/vouchers'
import { normalizeCheckoutAddress } from '@/lib/commerce/checkoutValidation'
import type { CheckoutQuote } from '@/lib/commerce/checkoutQuote'
import {
  CheckoutCartWriteError,
  CheckoutPaymentStartError,
  canonicalCheckoutFingerprint,
  confirmVerifiedCheckoutOrder,
  createVerifiedCheckoutCart,
  initiateVerifiedCheckoutPayment,
  parseCheckoutQuoteResponse,
  type PreparedCheckoutCart,
} from '@/lib/commerce/checkoutPaymentClient'
import {
  checkoutQuoteErrorCodeFromResponse,
  type CheckoutQuoteErrorCode,
} from '@/lib/commerce/quoteErrors'
import {
  CART_ITEMS_KEY,
  DELIVERY_DESTINATION_KEY,
  LEGACY_CART_ITEMS_KEY,
  MAX_CART_ITEM_QUANTITY,
  VOUCHER_CODE_KEY,
  migrateLegacyCartItems,
  normalizeCartQuantity,
  storefrontCartLineKey,
  type StorefrontCartItem,
} from '@/lib/commerce/storefrontCart'
import { localeDetails } from '@/i18n/routing'
import { StorefrontIcon } from './StorefrontIcon'

const THUMBS: Record<string, string> = {
  '1-bedroom-kit': '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
  modusofa: '/assets/modusofa-product-detail-page/e38c85e68d.png',
  snapbed: '/assets/homepage/hero-split.png',
}

// Money is cents end to end. Persisted carts are repaired and re-quoted from
// server-side catalog data before a checkout step is available.

// Mirrors checkoutValidation.ts's (unexported) countriesRequiringState — used here only to
// show a hint before submit; the server remains the authority and will reject a missing
// state for these countries regardless.
const STATE_HINT_COUNTRIES = new Set(['US', 'CA', 'AU'])

type CheckoutStep = 'cart' | 'address' | 'payment'
class QuoteRequestError extends Error {
  code: CheckoutQuoteErrorCode

  constructor(code: CheckoutQuoteErrorCode) {
    super(code)
    this.name = 'QuoteRequestError'
    this.code = code
  }
}

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

function readCartFromStorage(): StorefrontCartItem[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(CART_ITEMS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const items = migrateLegacyCartItems(parsed)
        if (JSON.stringify(items) !== raw) localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items))
        return items
      }
    } catch {
      // A corrupt v3 value must not hide a recoverable canonical legacy cart.
    }
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_CART_ITEMS_KEY)
    const legacyItems = migrateLegacyCartItems(legacyRaw ? JSON.parse(legacyRaw) : [], {
      allowParentItems: false,
    })
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(legacyItems))
    localStorage.removeItem(LEGACY_CART_ITEMS_KEY)
    return legacyItems
  } catch {
    localStorage.setItem(CART_ITEMS_KEY, '[]')
    return []
  }
}

function readDestinationFromStorage(): string {
  if (typeof window === 'undefined') return ''
  try {
    const destination = localStorage.getItem(DELIVERY_DESTINATION_KEY)
    return isODSaiDestination(destination) ? destination : ''
  } catch {
    return ''
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

export function CartView({
  checkoutEnabled,
  publishableKey,
}: {
  checkoutEnabled: boolean
  publishableKey: string
}) {
  const t = useTranslations('Transaction')
  const tCommon = useTranslations('Common')
  const tPDP = useTranslations('PDP')
  const locale = useLocale()
  const isRtl = localeDetails[locale as keyof typeof localeDetails]?.dir === 'rtl'
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' })

  // The server cannot read localStorage, so the first client render must use the
  // same values as SSR. Hydrate persisted cart state immediately after mount.
  const [items, setItems] = useState<StorefrontCartItem[]>([])
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('')
  const hasVoucherCandidate = isValidVoucherCode(appliedVoucherCode)
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(
    null,
  )
  const [isOrdered, setIsOrdered] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  const [undoState, setUndoState] = useState<{ index: number; item: any } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { formatCurrency } = useCurrency()
  // Payment is started with the fresh, verified cart returned by /api/carts,
  // not the provider's asynchronously updated guest-cart state.
  const stripeReady = checkoutEnabled && Boolean(publishableKey)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [amountDueCents, setAmountDueCents] = useState<number | null>(null)
  const [paymentCart, setPaymentCart] = useState<PreparedCheckoutCart | null>(null)
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [quoteRetry, setQuoteRetry] = useState(0)
  const stripeRef = useRef<{ elements: any; stripe: any } | null>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
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
    setQuote(null)
    setQuoteError(null)
    setClientSecret(null)
    setAmountDueCents(null)
    setPaymentCart(null)
    setCheckoutStep((step) => (step === 'cart' ? step : 'cart'))
    setItems(readCartFromStorage())
    setAppliedVoucherCode(readVoucherFromStorage())
    const destination = readDestinationFromStorage()
    if (destination) setValue('country', destination)
  }

  const cartVariantLabel = (item: StorefrontCartItem): string | undefined => {
    const options = item.variantOptions
    if (!options) return item.variant
    const fabrics: Record<NonNullable<typeof options.upholstery>, string> = {
      boucle: tPDP('fabrics.boucle'),
      chenille: tPDP('fabrics.chenille'),
      corduroy: tPDP('fabrics.corduroy'),
      techGrey: tPDP('fabrics.techGrey'),
    }
    const parts = [
      options.upholstery ? fabrics[options.upholstery] : undefined,
      options.woodFinish === 'oak'
        ? tPDP('finishNaturalOak')
        : options.woodFinish === 'walnut'
          ? tPDP('finishWalnut')
          : undefined,
      options.bedSize === 'queen'
        ? tPDP('finishQueen')
        : options.bedSize === 'king'
          ? tPDP('finishKing')
          : undefined,
    ].filter((part): part is string => Boolean(part))
    return parts.length ? parts.join(' · ') : item.variant
  }

  const quoteErrorMessage = (code: CheckoutQuoteErrorCode) => {
    switch (code) {
      case 'UNSUPPORTED_DESTINATION':
        return t('quoteErrorUnsupportedDestination')
      case 'VARIANT_REQUIRED':
        return t('quoteErrorVariantRequired')
      case 'QUANTITY_INVALID':
        return t('quoteErrorQuantity')
      case 'INVALID_REQUEST':
      case 'CART_EMPTY':
        return t('quoteErrorInvalidRequest')
      case 'CATALOG_UNAVAILABLE':
      case 'VARIANT_UNAVAILABLE':
        return t('quoteErrorCatalogUnavailable')
      default:
        return t('quoteErrorGeneric')
    }
  }

  useEffect(() => {
    const handleCartUpdate = () => loadCart()
    loadCart()
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

  const requestQuote = async (countryCode: string, signal?: AbortSignal) => {
    const response = await fetch('/api/checkout/quote', {
      body: JSON.stringify({
        countryCode,
        lines: items.map((item) => ({
          id: item.id,
          qty: normalizeCartQuantity(item.qty),
          ...(item.variantId ? { variantId: item.variantId } : {}),
        })),
        voucherCode: hasVoucherCandidate ? appliedVoucherCode : undefined,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      throw new QuoteRequestError(checkoutQuoteErrorCodeFromResponse(result))
    }
    const quote = parseCheckoutQuoteResponse(result)
    if (!quote) throw new QuoteRequestError('QUOTE_UNAVAILABLE')
    return quote
  }

  useEffect(() => {
    if (!watchedCountry || items.length === 0) {
      setQuote(null)
      setPaymentCart(null)
      setQuoteError(null)
      return
    }

    const controller = new AbortController()
    setQuote(null)
    setClientSecret(null)
    setAmountDueCents(null)
    setPaymentCart(null)
    setCheckoutStep((step) => (step === 'cart' ? step : 'cart'))
    setIsQuoting(true)
    setQuoteError(null)
    requestQuote(watchedCountry, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setQuote(result)
        if (hasVoucherCandidate) {
          setPromoMessage({
            text: result.voucherApplied ? t('promoVerified') : t('promoRejected'),
            type: result.voucherApplied ? 'success' : 'error',
          })
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (controller.signal.aborted) return
        setQuote(null)
        setQuoteError(
          error instanceof QuoteRequestError
            ? quoteErrorMessage(error.code)
            : quoteErrorMessage('QUOTE_UNAVAILABLE'),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsQuoting(false)
      })

    return () => controller.abort()
    // requestQuote and quoteErrorMessage intentionally use the current render's
    // cart and locale. The primitive dependencies are the quote fingerprint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedVoucherCode, hasVoucherCandidate, items, quoteRetry, watchedCountry])

  useEffect(() => {
    if (!isODSaiDestination(watchedCountry)) return
    try {
      localStorage.setItem(DELIVERY_DESTINATION_KEY, watchedCountry)
    } catch {
      // A blocked storage area only loses the convenience preference.
    }
  }, [watchedCountry])

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
          if (cancelled || !paymentIntent) return
          setAmountDueCents(paymentIntent.amount)
          if (quote && paymentIntent.amount !== quote.totalCents) {
            setCheckoutError(t('priceChanged'))
          }
        })
      })
      .catch(() => {
        if (!cancelled) setCheckoutError(t('checkoutErrorGeneric'))
      })

    return () => {
      cancelled = true
      stripeRef.current = null
    }
  }, [checkoutStep, clientSecret, publishableKey, quote, t])

  const removeAt = (idx: number) => {
    const removed = items[idx]
    if (!removed) return
    const next = items.filter((_, i) => i !== idx)
    setQuote(null)
    setPaymentCart(null)
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
    const nextQty = normalizeCartQuantity(cur.qty) + delta
    if (nextQty <= 0) {
      removeAt(idx)
      return
    }
    if (nextQty > MAX_CART_ITEM_QUANTITY) return
    const next = items.map((it, i) =>
      i === idx ? { ...it, qty: normalizeCartQuantity(nextQty) } : it,
    )
    setQuote(null)
    setPaymentCart(null)
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
    setQuote(null)
    setPaymentCart(null)
    setItems(next)
    if (typeof window !== 'undefined' && (window as any).modulivCart) {
      ;(window as any).modulivCart.setItems(next)
    }
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoState(null)
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!VOUCHER_REDEMPTION_ENABLED) {
      setPromoMessage({ text: t('promoUnavailable'), type: 'error' })
      return
    }
    const trimmed = normalizeVoucherCode(promoCode)
    if (isValidVoucherCode(trimmed)) {
      // A syntactically valid code is merely a candidate. Only the successful
      // server quote can say whether it was recognized and discounted.
      setQuote(null)
      setPaymentCart(null)
      setAppliedVoucherCode(trimmed)
      localStorage.setItem(VOUCHER_CODE_KEY, trimmed)
      setPromoMessage({ text: t('promoPending'), type: 'success' })
    } else {
      setPromoMessage({
        text: t('promoInvalid'),
        type: 'error',
      })
    }
  }

  const handleRemoveVoucher = () => {
    setQuote(null)
    setPaymentCart(null)
    setAppliedVoucherCode('')
    localStorage.removeItem(VOUCHER_CODE_KEY)
    setPromoMessage(null)
  }

  const localSubtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0,
  )
  const subtotal = quote?.subtotalCents ?? localSubtotal
  const discount = quote?.discountCents ?? 0
  const total = quote?.totalCents ?? null

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
    } catch {
      setCheckoutError(t('checkoutErrorGeneric'))
      return
    }

    setIsSubmittingAddress(true)
    try {
      const freshQuote = await requestQuote(values.country)
      setQuote(freshQuote)
      if (hasVoucherCandidate) {
        setPromoMessage({
          text: freshQuote.voucherApplied ? t('promoVerified') : t('promoRejected'),
          type: freshQuote.voucherApplied ? 'success' : 'error',
        })
      }

      // Do not call the provider's clearCart/addItem and immediately initiate
      // payment: its state update is asynchronous for a first guest checkout.
      // Create the exact quote lines, verify the returned cart fingerprint and
      // subtotal, then initiate Stripe explicitly against that cart ID.
      const verifiedCart = await createVerifiedCheckoutCart({
        expectedItems: freshQuote.items,
        expectedSubtotalCents: freshQuote.subtotalCents,
      })
      const initiated = await initiateVerifiedCheckoutPayment({
        additionalData: {
          billingAddress: address,
          customerEmail: values.email,
          locale,
          shippingAddress: address,
          voucherCode: hasVoucherCandidate ? appliedVoucherCode : undefined,
        },
        cart: verifiedCart,
        expectedAmountCents: freshQuote.totalCents,
      })

      setCheckoutEmail(values.email)
      setPaymentCart(verifiedCart)
      setClientSecret(initiated.clientSecret)
      setAmountDueCents(initiated.amountInUSD)
      setCheckoutStep('payment')
    } catch (err) {
      if (err instanceof QuoteRequestError) {
        setQuote(null)
        setQuoteError(quoteErrorMessage(err.code))
        setCheckoutStep('cart')
      } else if (err instanceof CheckoutCartWriteError) {
        setCheckoutError(t('checkoutCartWriteFailed'))
      } else if (err instanceof CheckoutPaymentStartError) {
        setCheckoutError(t('checkoutErrorGeneric'))
      } else {
        setCheckoutError(t('checkoutErrorGeneric'))
      }
    } finally {
      setIsSubmittingAddress(false)
    }
  }

  const handlePay = async () => {
    if (!stripeRef.current) return
    const quoteFingerprint = quote ? canonicalCheckoutFingerprint(quote.items) : null
    if (
      !quote ||
      !paymentCart ||
      amountDueCents !== quote.totalCents ||
      !quoteFingerprint ||
      paymentCart.fingerprint !== quoteFingerprint
    ) {
      setCheckoutError(t('priceChanged'))
      return
    }
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
      if (
        !paymentIntent ||
        paymentIntent.status !== 'succeeded' ||
        paymentIntent.amount !== quote.totalCents
      ) {
        throw new Error(t('priceChanged'))
      }

      const confirmed = await confirmVerifiedCheckoutOrder({
        cart: paymentCart,
        customerEmail: checkoutEmail,
        paymentIntentID: paymentIntent.id,
      })

      setOrderRef(String(confirmed.orderID))
      setIsOrdered(true)
      setPaymentCart(null)
      if (typeof window !== 'undefined' && (window as any).modulivCart) {
        ;(window as any).modulivCart.setItems([])
      }
    } catch (err) {
      setCheckoutError(
        err instanceof CheckoutPaymentStartError ? t('checkoutErrorGeneric') : t('checkoutErrorGeneric'),
      )
    } finally {
      setIsPaying(false)
    }
  }

  const checkoutUnavailable = !stripeReady
  const checkoutDisabled = checkoutUnavailable || !quote || isQuoting || Boolean(quoteError)
  const conciergeHref = `mailto:concierge@theflatset.com?subject=${encodeURIComponent(
    t('conciergeSubject'),
  )}&body=${encodeURIComponent(
    [
      t('conciergeGreeting'),
      '',
      t('conciergeRequest'),
      ...items.map((item) =>
        t('conciergeProductLine', {
          name: item.name,
          quantity: normalizeCartQuantity(item.qty),
          subtotal: formatCurrency(item.price * normalizeCartQuantity(item.qty), { locale }),
        }),
      ),
      quote
        ? t('conciergeQuotedTotal', { total: formatCurrency(quote.totalCents, { locale }) })
        : t('conciergeQuotePending'),
      '',
      t('conciergeNoPaymentDetails'),
    ].join('\n'),
  )}`
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
        <StorefrontIcon name={isRtl ? 'chevron_left' : 'chevron_right'} size={16} />
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
            <StorefrontIcon className="text-primary" name="check_circle" size={36} />
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
          <StorefrontIcon className="mx-auto text-outline" name="shopping_cart" size={56} />
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
                <article className="flex flex-col sm:flex-row gap-5 py-6" key={storefrontCartLineKey(it)}>
                  <div className="relative w-full sm:w-28 h-28 bg-surface-container overflow-hidden shrink-0 rounded-lg">
                    <Image
                      alt={t('cartItemImage', { name: it.name })}
                      className="object-cover"
                      fill
                      sizes="112px"
                      src={it.image || THUMBS[it.id] || '/assets/homepage/hero-split.png'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 items-baseline">
                      <h3 className="font-headline-sm text-[19px] text-on-surface">{it.name}</h3>
                      <div className="shrink-0 text-end" dir="ltr">
                        <span className="block font-medium text-on-surface whitespace-nowrap">
                          {formatCurrency((it.price || 0) * (it.qty || 1), { locale })}
                        </span>
                        {(it.qty || 1) > 1 && (
                          <span className="block text-[11px] text-on-surface-variant whitespace-nowrap">
                            {formatCurrency(it.price || 0, { locale })} × {it.qty}
                          </span>
                        )}
                      </div>
                    </div>
                    {cartVariantLabel(it) && (
                      <p className="font-body-md text-sm text-on-surface-variant mt-1">
                        {cartVariantLabel(it)}
                      </p>
                    )}
                    {it.imageIsRepresentative && (
                      <p className="mt-1 text-xs text-on-surface-variant" data-cart-image-disclosure="">
                        {t('representativeImage')}
                      </p>
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
                        <output
                          aria-label={t('quantityValue', { quantity: normalizeCartQuantity(it.qty) })}
                          className="w-9 text-center font-label-md text-sm"
                        >
                          {it.qty}
                        </output>
                        <button
                          aria-label={t('increaseQuantity')}
                          className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={it.qty >= MAX_CART_ITEM_QUANTITY}
                          onClick={() => updateQuantity(idx, 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      {it.qty >= MAX_CART_ITEM_QUANTITY && (
                        <span className="text-xs text-on-surface-variant">{t('quantityLimitReached')}</span>
                      )}
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
            {checkoutStep === 'cart' && (
              <div className="mb-5">
                <label
                  className="mb-1.5 block font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant"
                  htmlFor="cart-destination"
                >
                  {t('deliveryDestination')}
                </label>
                <select
                  className="w-full rounded border border-outline-variant/60 bg-surface px-3 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                  id="cart-destination"
                  onChange={(event) => {
                    setQuote(null)
                    setPaymentCart(null)
                    setValue('country', event.target.value, { shouldValidate: true })
                  }}
                  value={watchedCountry}
                >
                  <option value="">{t('selectCountry')}</option>
                  {ODSAI_DESTINATIONS.map((country) => (
                    <option key={country.value} value={country.value}>
                      {regionNames.of(country.value) || country.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <dl className="space-y-4 font-body-md text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">{t('productSubtotalBeforeDelivery')}</dt>
                <dd className="font-medium text-on-surface" dir="ltr">{formatCurrency(subtotal, { locale })}</dd>
              </div>
              {!quote && (
                <div>
                  <dt className="sr-only">{t('productSubtotalBeforeDelivery')}</dt>
                  <dd className="text-[11px] text-on-surface-variant">
                    {t('subtotalPendingVerification')}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant flex items-center gap-1">
                  <span>{t('shipping')}</span>
                  <span className="text-[11px] text-neutral-600 font-normal">{t('shippingDdpNote')}</span>
                </dt>
                <dd className="text-primary font-medium" dir="ltr">
                  {quote
                    ? formatCurrency(quote.shippingAndImportCents, { locale })
                    : t('ddpTotalPending')}
                </dd>
              </div>

              <div>
                <dt className="sr-only">{t('ddpQuoteReady')}</dt>
                <dd className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <StorefrontIcon name="verified" size={15} />
                  <span>{quote ? t('ddpQuoteReady') : t('ddpQuotePrompt')}</span>
                </div>
                {quote ? (
                  <>
                    <p className="text-neutral-700 leading-relaxed text-[11px]">
                      {t('ddpQuoteDetail', {
                        daysMax: quote.deliveryDays.max,
                        daysMin: quote.deliveryDays.min,
                        productionDaysMax: quote.productionDays.max,
                        productionDaysMin: quote.productionDays.min,
                        zone: quote.zone,
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-neutral-700 leading-relaxed text-[11px]">
                    {t('ddpQuotePromptDetail')}
                  </p>
                )}
                {isQuoting && <p className="text-[11px] text-on-surface-variant">{t('quoting')}</p>}
                {quoteError && (
                  <div className="space-y-2" id="quote-error-recovery" role="alert">
                    <p className="text-[11px] text-error">{quoteError}</p>
                    <p className="text-[11px] text-on-surface-variant">{t('quoteRecovery')}</p>
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <button
                        className="font-label-md uppercase tracking-wider text-primary underline"
                        onClick={() => setQuoteRetry((retry) => retry + 1)}
                        type="button"
                      >
                        {t('retryQuote')}
                      </button>
                      <a className="font-label-md uppercase tracking-wider text-primary underline" href={conciergeHref}>
                        {t('contactConcierge')}
                      </a>
                    </div>
                  </div>
                )}
                </dd>
              </div>

              {hasVoucherCandidate && (
                <div className="flex justify-between gap-4 items-center border border-primary/30 bg-primary-fixed/20 px-3 py-2 rounded" data-voucher-status="">
                  <dt className="text-on-surface">
                    {t('voucher')}
                    <span className="ms-2 text-xs text-on-surface-variant">
                      {isQuoting
                        ? t('promoPending')
                        : quote?.voucherApplied
                          ? t('promoVerified')
                          : quote
                            ? t('promoRejected')
                            : t('promoPending')}
                    </span>
                  </dt>
                  <dd className="flex items-center gap-3">
                    {quote?.voucherApplied && discount > 0 && (
                      <span className="text-primary font-medium" dir="ltr">
                        −{formatCurrency(discount, { locale })}
                      </span>
                    )}
                    <button
                      aria-label={t('removeVoucher')}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      onClick={handleRemoveVoucher}
                      type="button"
                    >
                      <StorefrontIcon name="close" size={18} />
                    </button>
                  </dd>
                </div>
              )}

              {checkoutStep === 'cart' && (
                <div>
                  <dt className="sr-only">{t('promoLabel')}</dt>
                  <dd className="pt-3 border-t border-outline-variant/30" id="promo-code-section">
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
                  </dd>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4 border-t border-outline-variant/40 text-lg">
                <dt className="font-medium text-on-surface">
                  {quote ? t('total') : t('ddpQuotePrompt')}
                </dt>
                <dd className="font-headline-sm text-headline-sm text-on-surface" dir="ltr" id="sum-total">
                  {total === null ? t('ddpTotalPending') : formatCurrency(total, { locale })}
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
                  aria-describedby={quoteError ? 'quote-error-recovery' : undefined}
                  className={`mt-8 w-full ${ctaClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={checkoutDisabled}
                  id="checkout-btn"
                  onClick={() => setCheckoutStep('address')}
                  type="button"
                >
                  {t('checkout')}
                  <StorefrontIcon className="ms-2" name={isRtl ? 'arrow_back' : 'arrow_forward'} size={18} />
                </button>
                {checkoutUnavailable && (
                  <div className="mt-4 rounded-xl bg-surface-container p-4" role="status">
                    <p className="font-label-md text-sm text-on-surface">{t('checkoutUnavailable')}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{t('checkoutUnavailableHelp')}</p>
                    <a
                      className="mt-3 inline-flex items-center gap-2 font-label-md text-sm text-primary underline underline-offset-4 hover:text-on-surface transition-colors"
                      href={conciergeHref}
                    >
                      {t('contactConcierge')}
                      <StorefrontIcon name={isRtl ? 'arrow_back' : 'arrow_forward'} size={16} />
                    </a>
                  </div>
                )}
                {!checkoutUnavailable && quote && (
                  <>
                    <p className="mt-4 font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                      <StorefrontIcon className="mt-0.5 text-primary" name="credit_card" size={16} />
                      {t('paymentMethodsNote')}
                    </p>
                    <p className="mt-2 font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                      <StorefrontIcon className="mt-0.5 text-primary" name="verified" size={16} />
                      {t('checkoutSecure')}
                    </p>
                  </>
                )}
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
                          {regionNames.of(c.value) || c.label}
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
                  disabled={
                    isPaying ||
                    !paymentCart ||
                    !quote ||
                    amountDueCents !== quote.totalCents
                  }
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
                    setAmountDueCents(null)
                    setPaymentCart(null)
                    setCheckoutStep('address')
                  }}
                  type="button"
                >
                  {t('backToAddress')}
                </button>
                <p className="font-body-md text-[13px] text-on-surface-variant flex items-start gap-2">
                  <StorefrontIcon className="mt-0.5 text-primary" name="credit_card" size={16} />
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
