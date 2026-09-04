import type { Payload, PayloadRequest } from 'payload'

import {
  getStorefrontCheckoutEligibility,
  normalizeStorefrontCheckoutProduct,
  relationshipID,
} from './catalogEligibility'
import {
  calculateDDPQuote,
  MAX_ITEM_QUANTITY,
  type ODSaiDestinationCode,
} from './ddp'
import {
  CheckoutQuoteError,
  isCheckoutQuoteErrorCode,
  type CheckoutQuoteErrorCode,
} from './quoteErrors'
import { normalizeStorefrontVariants } from './storefrontCart'
import { voucherDiscountInUSD } from './voucherServer'

export type CanonicalCheckoutItem = {
  product: number
  quantity: number
  /** Canonical Payload variant ID when the product is configurable. */
  variant?: number
}

export type StorefrontCheckoutLine = {
  productSlug: string
  quantity: number
  /** Required only when the resolved product is variant-enabled. */
  variant?: number
}

export type CheckoutQuote = {
  countryCode: ODSaiDestinationCode
  deliveryDays: { min: number; max: number }
  discountCents: number
  freightCents: number
  importChargesCents: number
  items: CanonicalCheckoutItem[]
  pricingVersion: string
  productionDays: { min: number; max: number }
  shippingAndImportCents: number
  subtotalCents: number
  totalCents: number
  voucherApplied: boolean
  zone: string
}

export const DDP_PRICING_VERSION = 'provisional-cbm-v1'
export const MAX_CART_LINES = 50

/**
 * Preserved for the payment adapter's post-payment inventory recovery path,
 * while exposing only stable codes to the public quote endpoint.
 */
export class CheckoutItemUnavailableError extends CheckoutQuoteError {
  constructor(codeOrMessage: CheckoutQuoteErrorCode | string = 'CATALOG_UNAVAILABLE') {
    // Older payment-path callers retain their internal diagnostic strings, but
    // public callers receive the stable fail-closed catalog code.
    super(
      isCheckoutQuoteErrorCode(codeOrMessage)
        ? codeOrMessage
        : 'CATALOG_UNAVAILABLE',
    )
    this.name = 'CheckoutItemUnavailableError'
  }
}

function quoteCodeForEligibility(code: string | null): CheckoutQuoteErrorCode {
  switch (code) {
    case 'VARIANT_REQUIRED':
      return 'VARIANT_REQUIRED'
    case 'VARIANT_UNAVAILABLE':
    case 'VARIANT_PRICE_INVALID':
    case 'VARIANT_INVENTORY_INVALID':
    case 'VARIANT_OUT_OF_STOCK':
      return 'VARIANT_UNAVAILABLE'
    default:
      return 'CATALOG_UNAVAILABLE'
  }
}

function canonicalItemKey(item: CanonicalCheckoutItem): string {
  return `${item.product}::${item.variant ?? 'parent'}`
}

/**
 * Aggregate by server-side canonical product/variant identity before pricing or
 * stock checks. This is used by both the quote route and Stripe adapter.
 */
export function aggregateCanonicalCheckoutItems(
  items: readonly CanonicalCheckoutItem[],
): CanonicalCheckoutItem[] {
  const aggregated = new Map<string, CanonicalCheckoutItem>()

  for (const item of items) {
    if (!Number.isInteger(item.product) || item.product < 1) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
      throw new CheckoutQuoteError('QUANTITY_INVALID')
    }
    if (item.variant !== undefined && (!Number.isInteger(item.variant) || item.variant < 1)) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }

    const key = canonicalItemKey(item)
    const existing = aggregated.get(key)
    const quantity = (existing?.quantity ?? 0) + item.quantity
    if (quantity > MAX_ITEM_QUANTITY) throw new CheckoutQuoteError('QUANTITY_INVALID')
    aggregated.set(key, { ...item, quantity })
  }

  if (aggregated.size === 0) throw new CheckoutQuoteError('CART_EMPTY')
  if (aggregated.size > MAX_CART_LINES) throw new CheckoutQuoteError('INVALID_REQUEST')
  return [...aggregated.values()]
}

export async function resolveSellableItems({
  checkInventory,
  items,
  payload,
  req,
}: {
  checkInventory: boolean
  items: CanonicalCheckoutItem[]
  payload: Payload
  req?: PayloadRequest
}) {
  const canonicalItems = aggregateCanonicalCheckoutItems(items)
  let packedCbm = 0
  let subtotalInUSD = 0
  const requestedInventory = new Map<string, { available: number; quantity: number }>()

  for (const item of canonicalItems) {
    const product = await payload.findByID({
      collection: 'products',
      depth: 2,
      id: item.product,
      overrideAccess: true,
      ...(req ? { req } : {}),
      select: {
        _status: true,
        enableVariants: true,
        inventory: true,
        packedVolumeCbm: true,
        priceInUSD: true,
        priceInUSDEnabled: true,
        slug: true,
        variantTypes: true,
      },
    })

    const checkoutProduct = normalizeStorefrontCheckoutProduct(product, 'catalog')
    if (!checkoutProduct.enableVariants && item.variant !== undefined) {
      throw new CheckoutItemUnavailableError('VARIANT_UNAVAILABLE')
    }

    let unitPrice = checkoutProduct.priceInUSD
    let available = checkoutProduct.inventory
    let inventoryKey = `product:${item.product}`

    if (checkoutProduct.enableVariants) {
      if (!item.variant) throw new CheckoutItemUnavailableError('VARIANT_REQUIRED')

      const variant = await payload.findByID({
        collection: 'variants',
        depth: 2,
        id: item.variant,
        overrideAccess: true,
        ...(req ? { req } : {}),
        select: {
          _status: true,
          inventory: true,
          options: true,
          priceInUSD: true,
          priceInUSDEnabled: true,
          product: true,
        },
      })
      const normalizedVariant = normalizeStorefrontVariants([variant])[0]
      const selection = normalizedVariant
        ? Object.fromEntries(normalizedVariant.options.map((option) => [option.type, option.value]))
        : undefined
      const eligibility = getStorefrontCheckoutEligibility(
        checkoutProduct,
        normalizedVariant ? [normalizedVariant] : [],
        selection,
      )
      if (!eligibility.available || eligibility.selectedVariantId !== item.variant) {
        throw new CheckoutItemUnavailableError(quoteCodeForEligibility(eligibility.code))
      }

      unitPrice = normalizedVariant?.price
      available = normalizedVariant?.inventory
      inventoryKey = `variant:${item.variant}`
    } else {
      const eligibility = getStorefrontCheckoutEligibility(checkoutProduct, [])
      if (!eligibility.available) {
        throw new CheckoutItemUnavailableError(quoteCodeForEligibility(eligibility.code))
      }
    }

    const packedVolumeCbm = checkoutProduct.packedVolumeCbm
    if (
      typeof unitPrice !== 'number' ||
      !Number.isInteger(unitPrice) ||
      unitPrice < 1 ||
      typeof packedVolumeCbm !== 'number' ||
      !Number.isFinite(packedVolumeCbm) ||
      packedVolumeCbm <= 0
    ) {
      throw new CheckoutItemUnavailableError('CATALOG_UNAVAILABLE')
    }
    if (checkInventory) {
      if (typeof available !== 'number' || !Number.isInteger(available)) {
        throw new CheckoutItemUnavailableError('CATALOG_UNAVAILABLE')
      }
      const current = requestedInventory.get(inventoryKey)
      requestedInventory.set(inventoryKey, {
        available,
        quantity: (current?.quantity ?? 0) + item.quantity,
      })
    }

    subtotalInUSD += unitPrice * item.quantity
    packedCbm += packedVolumeCbm * item.quantity
  }

  if ([...requestedInventory.values()].some((stock) => stock.quantity > stock.available)) {
    throw new CheckoutItemUnavailableError('VARIANT_UNAVAILABLE')
  }

  return { packedCbm, subtotalInUSD }
}

export async function resolveStorefrontItems({
  lines,
  payload,
}: {
  lines: StorefrontCheckoutLine[]
  payload: Payload
}): Promise<CanonicalCheckoutItem[]> {
  if (!Array.isArray(lines) || lines.length === 0) throw new CheckoutQuoteError('CART_EMPTY')
  if (lines.length > MAX_CART_LINES) throw new CheckoutQuoteError('INVALID_REQUEST')

  const normalizedLines = lines.map((line) => {
    const productSlug = typeof line?.productSlug === 'string' ? line.productSlug.trim() : ''
    const quantity = line?.quantity
    const variant = relationshipID(line?.variant)

    if (!/^[a-z0-9][a-z0-9-]*$/.test(productSlug)) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    if (line?.variant !== undefined && !variant) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
      throw new CheckoutQuoteError('QUANTITY_INVALID')
    }

    return { productSlug, quantity, ...(variant ? { variant } : {}) }
  })

  const slugs = [...new Set(normalizedLines.map((line) => line.productSlug))]
  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: slugs.length,
    overrideAccess: true,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { slug: { in: slugs } },
      ],
    },
    select: { id: true, slug: true },
  })
  const bySlug = new Map(products.docs.map((product) => [product.slug, product.id]))

  return aggregateCanonicalCheckoutItems(
    normalizedLines.map((line) => {
      const product = bySlug.get(line.productSlug)
      if (!product) throw new CheckoutItemUnavailableError('CATALOG_UNAVAILABLE')
      return {
        product,
        quantity: line.quantity,
        ...(line.variant ? { variant: line.variant } : {}),
      }
    }),
  )
}

export async function createCheckoutQuote({
  countryCode,
  items,
  payload,
  req,
  voucherCode,
}: {
  countryCode: ODSaiDestinationCode
  items: CanonicalCheckoutItem[]
  payload: Payload
  req?: PayloadRequest
  voucherCode?: unknown
}): Promise<CheckoutQuote> {
  const canonicalItems = aggregateCanonicalCheckoutItems(items)
  const { packedCbm, subtotalInUSD } = await resolveSellableItems({
    checkInventory: true,
    items: canonicalItems,
    payload,
    req,
  })
  const quote = calculateDDPQuote({ countryCode, packedCbm, subtotalInUSD })
  const discountCents = voucherDiscountInUSD(voucherCode, quote.landedTotalInUSD)

  return {
    countryCode,
    deliveryDays: quote.deliveryDays,
    discountCents,
    freightCents: quote.freightInUSD,
    importChargesCents: quote.importChargesInUSD,
    items: canonicalItems,
    pricingVersion: DDP_PRICING_VERSION,
    productionDays: quote.productionDays,
    shippingAndImportCents: quote.shippingAndImportInUSD,
    subtotalCents: subtotalInUSD,
    totalCents: quote.landedTotalInUSD - discountCents,
    voucherApplied: discountCents > 0,
    zone: quote.zone,
  }
}
