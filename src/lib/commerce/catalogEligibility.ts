/**
 * Client-safe storefront eligibility contract.
 *
 * This is an affordance only: checkoutQuote.ts re-reads and verifies every
 * product and variant before a quote or payment can proceed. Keeping the same
 * rules here prevents an obviously incomplete catalog record from becoming an
 * unquotable local-cart line in the first place.
 */

export const MODUSOFA_OPTION_TYPES = ['upholstery', 'wood-finish'] as const

const PRODUCT_OPTION_SCHEMAS: Record<string, readonly string[]> = {
  '1-bedroom-kit': ['upholstery', 'wood-finish', 'bed-size'],
  modusofa: MODUSOFA_OPTION_TYPES,
  snapbed: ['wood-finish', 'bed-size'],
}

export type CatalogEligibilityCode =
  | 'CATALOG_UNAVAILABLE'
  | 'PRODUCT_UNPUBLISHED'
  | 'USD_CHECKOUT_DISABLED'
  | 'PRODUCT_PRICE_INVALID'
  | 'DELIVERY_DIMENSIONS_MISSING'
  | 'PRODUCT_INVENTORY_INVALID'
  | 'PRODUCT_OUT_OF_STOCK'
  | 'VARIANTS_NOT_CONFIGURED'
  | 'VARIANT_SCHEMA_INVALID'
  | 'VARIANT_REQUIRED'
  | 'VARIANT_UNAVAILABLE'
  | 'VARIANT_PRICE_INVALID'
  | 'VARIANT_INVENTORY_INVALID'
  | 'VARIANT_OUT_OF_STOCK'

export type StorefrontVariantOptionLike = {
  id: number
  label: string
  type: string
  value: string
}

export type StorefrontVariantLike = {
  id: number
  inventory?: number
  options: StorefrontVariantOptionLike[]
  price?: number
  priceInUSDEnabled?: boolean
  productId?: number
  published?: boolean
}

export type StorefrontCheckoutProduct = {
  enableVariants: boolean
  id?: number
  inventory?: number
  packedVolumeCbm?: number
  priceInUSD?: number
  priceInUSDEnabled: boolean
  published: boolean
  slug?: string
  source: 'catalog' | 'fallback'
  variantTypes: string[]
}

export type StorefrontCheckoutEligibility = {
  available: boolean
  code: CatalogEligibilityCode | null
  requiresVariant: boolean
  selectedVariantId?: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  const record = asRecord(value)
  return record ? relationshipID(record.id) : undefined
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function normalizeVariantTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const names = value.flatMap((candidate) => {
    if (typeof candidate === 'string') return candidate.trim() ? [candidate.trim()] : []
    const record = asRecord(candidate)
    const name = record?.name
    return typeof name === 'string' && name.trim() ? [name.trim()] : []
  })
  return [...new Set(names)]
}

/**
 * Serialize only the checkout facts a Client Component is allowed to use.
 * `source` must be supplied by the server page so static fallback copy can
 * never accidentally acquire a purchasable state.
 */
export function normalizeStorefrontCheckoutProduct(
  value: unknown,
  source: StorefrontCheckoutProduct['source'],
): StorefrontCheckoutProduct {
  const product = asRecord(value)
  return {
    enableVariants: product?.enableVariants === true,
    id: relationshipID(product?.id),
    inventory: typeof product?.inventory === 'number' ? product.inventory : undefined,
    packedVolumeCbm:
      typeof product?.packedVolumeCbm === 'number' ? product.packedVolumeCbm : undefined,
    priceInUSD: typeof product?.priceInUSD === 'number' ? product.priceInUSD : undefined,
    priceInUSDEnabled: product?.priceInUSDEnabled === true,
    published: product?._status === 'published',
    slug: typeof product?.slug === 'string' ? product.slug : undefined,
    source,
    variantTypes: normalizeVariantTypes(product?.variantTypes),
  }
}

export function expectedOptionTypesForProduct(
  product: Pick<StorefrontCheckoutProduct, 'slug' | 'variantTypes'>,
): readonly string[] {
  if (product.slug && PRODUCT_OPTION_SCHEMAS[product.slug]) {
    return PRODUCT_OPTION_SCHEMAS[product.slug]
  }
  return product.variantTypes
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  const leftSet = new Set(left)
  const rightSet = new Set(right)
  return leftSet.size === left.length && rightSet.size === right.length &&
    [...leftSet].every((value) => rightSet.has(value))
}

function exactOptionMap(
  variant: StorefrontVariantLike,
  expectedTypes: readonly string[],
): Map<string, string> | null {
  if (!Array.isArray(variant.options) || !sameStringSet(expectedTypes, variant.options.map((option) => option.type))) {
    return null
  }

  const options = new Map<string, string>()
  for (const option of variant.options) {
    if (!isPositiveInteger(option.id) || !option.type || !option.value || options.has(option.type)) {
      return null
    }
    options.set(option.type, option.value)
  }
  return options
}

/**
 * Exact option matching is intentional. A partial match could select a
 * malformed variant with a duplicate or extra option type.
 */
export function matchesExactStorefrontVariant(
  variant: StorefrontVariantLike,
  selection: Record<string, string>,
  expectedTypes: readonly string[] = Object.keys(selection),
): boolean {
  const selectionEntries = Object.entries(selection).filter(
    ([type, value]) => Boolean(type) && typeof value === 'string' && Boolean(value),
  )
  const selectionTypes = selectionEntries.map(([type]) => type)
  if (!sameStringSet(expectedTypes, selectionTypes)) return false

  const options = exactOptionMap(variant, expectedTypes)
  if (!options) return false

  return selectionEntries.every(([type, value]) => options.get(type) === value)
}

function unavailable(
  code: CatalogEligibilityCode,
  requiresVariant: boolean,
): StorefrontCheckoutEligibility {
  return { available: false, code, requiresVariant }
}

function baseEligibility(
  product: StorefrontCheckoutProduct,
): StorefrontCheckoutEligibility | null {
  const expectedTypes = expectedOptionTypesForProduct(product)
  const requiresVariant = product.enableVariants || expectedTypes.length > 0

  if (product.source !== 'catalog' || !isPositiveInteger(product.id)) {
    return unavailable('CATALOG_UNAVAILABLE', requiresVariant)
  }
  if (!product.published) return unavailable('PRODUCT_UNPUBLISHED', requiresVariant)
  if (!product.priceInUSDEnabled) return unavailable('USD_CHECKOUT_DISABLED', requiresVariant)
  if (!isPositiveInteger(product.priceInUSD)) return unavailable('PRODUCT_PRICE_INVALID', requiresVariant)
  if (!Number.isFinite(product.packedVolumeCbm) || (product.packedVolumeCbm ?? 0) <= 0) {
    return unavailable('DELIVERY_DIMENSIONS_MISSING', requiresVariant)
  }
  if (expectedTypes.length > 0 && !product.enableVariants) {
    return unavailable('VARIANTS_NOT_CONFIGURED', true)
  }
  if (product.enableVariants && expectedTypes.length === 0) {
    return unavailable('VARIANT_SCHEMA_INVALID', true)
  }
  if (!product.enableVariants) {
    if (!Number.isInteger(product.inventory)) return unavailable('PRODUCT_INVENTORY_INVALID', false)
    if ((product.inventory ?? 0) < 1) return unavailable('PRODUCT_OUT_OF_STOCK', false)
  }

  return null
}

/**
 * Resolve client-side sale eligibility for one chosen configuration. This must
 * use a canonical variant ID; display labels are deliberately ignored.
 */
export function getStorefrontCheckoutEligibility(
  product: StorefrontCheckoutProduct,
  variants: readonly StorefrontVariantLike[] | null | undefined,
  selection?: Record<string, string>,
): StorefrontCheckoutEligibility {
  const base = baseEligibility(product)
  if (base) return base

  const expectedTypes = expectedOptionTypesForProduct(product)
  if (!product.enableVariants) {
    return { available: true, code: null, requiresVariant: false }
  }

  if (!selection) return unavailable('VARIANT_REQUIRED', true)
  const selectedVariant = variants?.find((variant) =>
    matchesExactStorefrontVariant(variant, selection, expectedTypes),
  )
  if (!selectedVariant) return unavailable('VARIANT_REQUIRED', true)
  if (selectedVariant.productId !== product.id || !selectedVariant.published) {
    return unavailable('VARIANT_UNAVAILABLE', true)
  }
  if (!selectedVariant.priceInUSDEnabled || !isPositiveInteger(selectedVariant.price)) {
    return unavailable('VARIANT_PRICE_INVALID', true)
  }
  if (!Number.isInteger(selectedVariant.inventory)) {
    return unavailable('VARIANT_INVENTORY_INVALID', true)
  }
  if ((selectedVariant.inventory ?? 0) < 1) return unavailable('VARIANT_OUT_OF_STOCK', true)

  return {
    available: true,
    code: null,
    requiresVariant: true,
    selectedVariantId: selectedVariant.id,
  }
}

/** Whether a Product JSON-LD Offer may be emitted at all. */
export function hasSellableStorefrontVariant(
  product: StorefrontCheckoutProduct,
  variants: readonly StorefrontVariantLike[] | null | undefined,
): boolean {
  return getStorefrontOfferPrice(product, variants) !== undefined
}

/**
 * The only product amount that may be exposed as an Offer. For configured
 * products this is the lowest currently eligible SKU price, never a parent
 * placeholder or an unvalidated client-side selection.
 */
export function getStorefrontOfferPrice(
  product: StorefrontCheckoutProduct,
  variants: readonly StorefrontVariantLike[] | null | undefined,
): number | undefined {
  const base = baseEligibility(product)
  if (base) return undefined
  if (!product.enableVariants) return product.priceInUSD

  const expectedTypes = expectedOptionTypesForProduct(product)
  const prices = (variants || []).flatMap((variant) => {
    const optionMap = exactOptionMap(variant, expectedTypes)
    if (!optionMap) return []
    const eligibility = getStorefrontCheckoutEligibility(
      product,
      [variant],
      Object.fromEntries(optionMap),
    )
    return eligibility.available && isPositiveInteger(variant.price) ? [variant.price] : []
  })

  return prices.length > 0 ? Math.min(...prices) : undefined
}
