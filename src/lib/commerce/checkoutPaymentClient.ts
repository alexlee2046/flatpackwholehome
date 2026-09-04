import type { CanonicalCheckoutItem, CheckoutQuote } from './checkoutQuote'
import { isODSaiDestination } from './ddp'

/**
 * Browser-safe checkout preparation. The ecommerce provider updates its cart
 * state asynchronously, so payment never reads that potentially stale state.
 * Instead, this module writes the quote's canonical lines to /api/carts,
 * verifies the returned cart, then explicitly passes that cart ID to payment.
 */
export type CheckoutCartDocument = {
  id: number
  items: Array<{
    product?: unknown
    quantity?: unknown
    variant?: unknown
  }>
  secret?: string
  subtotal: number
}

export type PreparedCheckoutCart = {
  fingerprint: string
  id: number
  secret?: string
}

type FetchResponse = {
  json: () => Promise<unknown>
  ok: boolean
}

export type CheckoutFetch = (
  input: string,
  init: { body: string; headers: Record<string, string>; method: 'POST' },
) => Promise<FetchResponse>

export class CheckoutCartWriteError extends Error {
  constructor() {
    super('The verified checkout cart could not be prepared.')
    this.name = 'CheckoutCartWriteError'
  }
}

export class CheckoutPaymentStartError extends Error {
  constructor() {
    super('The payment session could not be started.')
    this.name = 'CheckoutPaymentStartError'
  }
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return relationshipID((value as { id?: unknown }).id)
  }
  return undefined
}

function canonicalLine(item: CanonicalCheckoutItem): string | null {
  if (
    !Number.isInteger(item.product) ||
    item.product < 1 ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    (item.variant !== undefined && (!Number.isInteger(item.variant) || item.variant < 1))
  ) {
    return null
  }
  return `${item.product}:${item.variant ?? 'parent'}:${item.quantity}`
}

/** An order-independent comparison key for the exact server-priced SKU set. */
export function canonicalCheckoutFingerprint(items: readonly CanonicalCheckoutItem[]): string | null {
  const lines = items.map(canonicalLine)
  return lines.every((line): line is string => line !== null) && lines.length > 0
    ? lines.sort().join('|')
    : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function parseDayRange(value: unknown): { min: number; max: number } | null {
  const range = asRecord(value)
  if (
    !range ||
    !nonNegativeInteger(range.min) ||
    !nonNegativeInteger(range.max) ||
    range.max < range.min
  ) {
    return null
  }
  return { min: range.min, max: range.max }
}

function parseCanonicalItems(value: unknown): CanonicalCheckoutItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const items: CanonicalCheckoutItem[] = []
  for (const candidate of value) {
    const item = asRecord(candidate)
    const product = relationshipID(item?.product)
    const variant = relationshipID(item?.variant)
    const hasVariant = item?.variant !== undefined && item.variant !== null
    const quantity = item?.quantity
    if (
      !product ||
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      (hasVariant && !variant)
    ) {
      return null
    }
    items.push({ product, quantity, ...(variant ? { variant } : {}) })
  }
  return canonicalCheckoutFingerprint(items) ? items : null
}

/** Strict browser-side validation before quote data reaches render or payment state. */
export function parseCheckoutQuoteResponse(value: unknown): CheckoutQuote | null {
  const quote = asRecord(value)
  if (!quote) return null

  const deliveryDays = parseDayRange(quote.deliveryDays)
  const productionDays = parseDayRange(quote.productionDays)
  const items = parseCanonicalItems(quote.items)
  const discountCents = quote.discountCents
  const freightCents = quote.freightCents
  const importChargesCents = quote.importChargesCents
  const shippingAndImportCents = quote.shippingAndImportCents
  const subtotalCents = quote.subtotalCents
  const totalCents = quote.totalCents
  if (
    !deliveryDays ||
    !productionDays ||
    !items ||
    !nonNegativeInteger(discountCents) ||
    !nonNegativeInteger(freightCents) ||
    !nonNegativeInteger(importChargesCents) ||
    !nonNegativeInteger(shippingAndImportCents) ||
    !nonNegativeInteger(subtotalCents) ||
    !nonNegativeInteger(totalCents) ||
    subtotalCents === 0 ||
    totalCents === 0 ||
    typeof quote.countryCode !== 'string' ||
    !isODSaiDestination(quote.countryCode) ||
    typeof quote.pricingVersion !== 'string' ||
    !quote.pricingVersion ||
    typeof quote.zone !== 'string' ||
    !quote.zone ||
    typeof quote.voucherApplied !== 'boolean' ||
    shippingAndImportCents !== freightCents + importChargesCents ||
    totalCents !== subtotalCents + shippingAndImportCents - discountCents ||
    quote.voucherApplied !== (discountCents > 0)
  ) {
    return null
  }

  return {
    countryCode: quote.countryCode,
    deliveryDays,
    discountCents,
    freightCents,
    importChargesCents,
    items,
    pricingVersion: quote.pricingVersion,
    productionDays,
    shippingAndImportCents,
    subtotalCents,
    totalCents,
    voucherApplied: quote.voucherApplied,
    zone: quote.zone,
  }
}

export function verifyCanonicalCheckoutCart(
  value: unknown,
  expectedItems: readonly CanonicalCheckoutItem[],
  expectedSubtotalCents: number,
): PreparedCheckoutCart | null {
  if (
    !value ||
    typeof value !== 'object' ||
    !Number.isInteger(expectedSubtotalCents) ||
    expectedSubtotalCents < 1
  ) {
    return null
  }

  const cart = value as Partial<CheckoutCartDocument>
  const id = relationshipID(cart.id)
  if (!id || cart.subtotal !== expectedSubtotalCents || !Array.isArray(cart.items)) return null

  const returnedItems = parseCanonicalItems(cart.items)
  if (!returnedItems) return null

  const expectedFingerprint = canonicalCheckoutFingerprint(expectedItems)
  const returnedFingerprint = canonicalCheckoutFingerprint(returnedItems)
  if (!expectedFingerprint || expectedFingerprint !== returnedFingerprint) return null

  return {
    fingerprint: expectedFingerprint,
    id,
    ...(typeof cart.secret === 'string' && cart.secret ? { secret: cart.secret } : {}),
  }
}

async function responseJSON(response: FetchResponse): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function createVerifiedCheckoutCart({
  expectedItems,
  expectedSubtotalCents,
  fetcher,
}: {
  expectedItems: readonly CanonicalCheckoutItem[]
  expectedSubtotalCents: number
  fetcher?: CheckoutFetch
}): Promise<PreparedCheckoutCart> {
  const request = fetcher ?? (fetch as unknown as CheckoutFetch)
  const response = await request('/api/carts', {
    body: JSON.stringify({
      currency: 'USD',
      items: expectedItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        ...(item.variant ? { variant: item.variant } : {}),
      })),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const result = await responseJSON(response)
  const cart = result && typeof result === 'object' && 'doc' in result
    ? (result as { doc?: unknown }).doc
    : result
  const verified = response.ok
    ? verifyCanonicalCheckoutCart(cart, expectedItems, expectedSubtotalCents)
    : null
  if (!verified) throw new CheckoutCartWriteError()
  return verified
}

export async function initiateVerifiedCheckoutPayment({
  additionalData,
  cart,
  expectedAmountCents,
  fetcher,
}: {
  additionalData: Record<string, unknown>
  cart: PreparedCheckoutCart
  expectedAmountCents: number
  fetcher?: CheckoutFetch
}): Promise<{ amountInUSD: number; clientSecret: string }> {
  const request = fetcher ?? (fetch as unknown as CheckoutFetch)
  const response = await request('/api/payments/stripe/initiate', {
    body: JSON.stringify({
      ...additionalData,
      cartID: cart.id,
      ...(cart.secret ? { secret: cart.secret } : {}),
      currency: 'USD',
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const result = await responseJSON(response)
  if (
    !response.ok ||
    !result ||
    typeof result !== 'object' ||
    typeof (result as { clientSecret?: unknown }).clientSecret !== 'string' ||
    !(result as { clientSecret: string }).clientSecret ||
    (result as { amountInUSD?: unknown }).amountInUSD !== expectedAmountCents
  ) {
    throw new CheckoutPaymentStartError()
  }

  return {
    amountInUSD: expectedAmountCents,
    clientSecret: (result as { clientSecret: string }).clientSecret,
  }
}

export async function confirmVerifiedCheckoutOrder({
  cart,
  customerEmail,
  paymentIntentID,
  fetcher,
}: {
  cart: PreparedCheckoutCart
  customerEmail: string
  paymentIntentID: string
  fetcher?: CheckoutFetch
}): Promise<{ orderID: number | string }> {
  const request = fetcher ?? (fetch as unknown as CheckoutFetch)
  const response = await request('/api/payments/stripe/confirm-order', {
    body: JSON.stringify({
      cartID: cart.id,
      ...(cart.secret ? { secret: cart.secret } : {}),
      customerEmail,
      paymentIntentID,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const result = await responseJSON(response)
  if (
    !response.ok ||
    !result ||
    typeof result !== 'object' ||
    (typeof (result as { orderID?: unknown }).orderID !== 'number' &&
      typeof (result as { orderID?: unknown }).orderID !== 'string')
  ) {
    throw new CheckoutPaymentStartError()
  }
  return { orderID: (result as { orderID: number | string }).orderID }
}
