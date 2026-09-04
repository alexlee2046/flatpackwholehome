import {
  matchesExactStorefrontVariant,
  relationshipID,
  type StorefrontVariantLike,
} from './catalogEligibility'

export const CART_ITEMS_KEY = 'moduliv-cart-items-v3'
export const LEGACY_CART_ITEMS_KEY = 'moduliv-cart-items-v2'
export const VOUCHER_CODE_KEY = 'moduliv-voucher-code'
export const DELIVERY_DESTINATION_KEY = 'moduliv-delivery-destination'
export const MAX_CART_ITEM_QUANTITY = 20

/** Stable option values allow the cart to localize configuration labels later. */
export type StorefrontCartVariantOptions = {
  bedSize?: 'king' | 'queen'
  upholstery?: 'boucle' | 'chenille' | 'corduroy' | 'techGrey'
  woodFinish?: 'oak' | 'walnut'
}

export type StorefrontCartItem = {
  boxCount?: number
  id: string
  image?: string
  imageIsRepresentative?: boolean
  name: string
  price: number
  qty: number
  shippingWeightKg?: number
  /** Legacy display text; canonical option values take precedence when present. */
  variant?: string
  variantOptions?: StorefrontCartVariantOptions
  /** Canonical Payload variant ID when the product is configurable. */
  variantId?: number
}

export type StorefrontVariantOption = {
  id: number
  label: string
  type: string
  value: string
}

export type StorefrontVariant = StorefrontVariantLike & {
  options: StorefrontVariantOption[]
}

export function normalizeCartQuantity(value: unknown, fallback = 1): number {
  const quantity =
    typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
  return Math.min(MAX_CART_ITEM_QUANTITY, Math.max(1, quantity))
}

export function storefrontCartLineKey(item: Pick<StorefrontCartItem, 'id' | 'variantId'>): string {
  return `${item.id}::${item.variantId ?? 'parent'}`
}

function normalizeVariantOptions(value: unknown): StorefrontCartVariantOptions | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const options = value as Record<string, unknown>
  const upholstery = ['boucle', 'chenille', 'corduroy', 'techGrey'].includes(String(options.upholstery))
    ? (options.upholstery as StorefrontCartVariantOptions['upholstery'])
    : undefined
  const woodFinish = ['oak', 'walnut'].includes(String(options.woodFinish))
    ? (options.woodFinish as StorefrontCartVariantOptions['woodFinish'])
    : undefined
  const bedSize = ['king', 'queen'].includes(String(options.bedSize))
    ? (options.bedSize as StorefrontCartVariantOptions['bedSize'])
    : undefined
  return upholstery || woodFinish || bedSize
    ? { ...(upholstery ? { upholstery } : {}), ...(woodFinish ? { woodFinish } : {}), ...(bedSize ? { bedSize } : {}) }
    : undefined
}

function normalizeCartItem(
  candidate: unknown,
  { allowParentItems = true }: { allowParentItems?: boolean } = {},
): StorefrontCartItem | null {
  if (!candidate || typeof candidate !== 'object') return null
  const item = candidate as Partial<StorefrontCartItem>
  const canonicalID = item.id === 'bundle-1bed' ? '1-bedroom-kit' : item.id
  const price = item.price
  const variantID = item.variantId
  if (
    typeof canonicalID !== 'string' ||
    !canonicalID ||
    typeof item.name !== 'string' ||
    !item.name ||
    typeof price !== 'number' ||
    !Number.isInteger(price) ||
    price < 1 ||
    (variantID !== undefined && (!Number.isInteger(variantID) || variantID < 1)) ||
    (!allowParentItems && variantID === undefined)
  ) {
    return null
  }

  return {
    ...(typeof item.boxCount === 'number' ? { boxCount: item.boxCount } : {}),
    ...(typeof item.image === 'string' ? { image: item.image } : {}),
    // The product gallery has no exact multi-option SKU association. Preserve
    // this disclosure across storage repairs instead of implying a match.
    imageIsRepresentative: true,
    ...(typeof item.shippingWeightKg === 'number' ? { shippingWeightKg: item.shippingWeightKg } : {}),
    ...(typeof item.variant === 'string' ? { variant: item.variant } : {}),
    ...(normalizeVariantOptions(item.variantOptions)
      ? { variantOptions: normalizeVariantOptions(item.variantOptions) }
      : {}),
    id: canonicalID,
    name: item.name,
    price,
    qty: normalizeCartQuantity(item.qty),
    ...(variantID === undefined ? {} : { variantId: variantID }),
  }
}

/**
 * Repairs old browser storage without preserving unsafe lines. Duplicate
 * product/variant keys are deliberately coalesced so a Buy Now intent cannot
 * create a second copy of the same canonical configuration.
 */
export function migrateLegacyCartItems(
  value: unknown,
  { allowParentItems = true }: { allowParentItems?: boolean } = {},
): StorefrontCartItem[] {
  if (!Array.isArray(value)) return []

  const lines = new Map<string, StorefrontCartItem>()
  for (const candidate of value) {
    const item = normalizeCartItem(candidate, { allowParentItems })
    if (!item) continue
    const key = storefrontCartLineKey(item)
    const existing = lines.get(key)
    if (existing) {
      existing.qty = normalizeCartQuantity(existing.qty + item.qty)
    } else {
      lines.set(key, item)
    }
  }
  return [...lines.values()]
}

/** Upsert a selected SKU, honoring the shared per-line 20-item ceiling. */
export function upsertStorefrontCartItem(
  items: readonly StorefrontCartItem[],
  candidate: StorefrontCartItem,
  quantity = candidate.qty,
): StorefrontCartItem[] {
  const normalizedCandidate = normalizeCartItem({ ...candidate, qty: quantity })
  if (!normalizedCandidate) return migrateLegacyCartItems(items)

  const normalizedItems = migrateLegacyCartItems(items)
  const key = storefrontCartLineKey(normalizedCandidate)
  const index = normalizedItems.findIndex((item) => storefrontCartLineKey(item) === key)
  if (index === -1) return [...normalizedItems, normalizedCandidate]

  const next = [...normalizedItems]
  next[index] = {
    ...next[index],
    ...normalizedCandidate,
    qty: normalizeCartQuantity(normalizedCandidate.qty),
  }
  return next
}

export function findStorefrontVariant(
  variants: StorefrontVariant[] | null | undefined,
  selection: Record<string, string>,
): StorefrontVariant | undefined {
  if (!variants?.length || Object.keys(selection).length === 0) return undefined
  return variants.find((variant) => matchesExactStorefrontVariant(variant, selection))
}

export function normalizeStorefrontVariants(value: unknown): StorefrontVariant[] {
  const docs = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && 'docs' in value && Array.isArray(value.docs)
      ? value.docs
      : []

  return docs.flatMap((candidate): StorefrontVariant[] => {
    if (!candidate || typeof candidate !== 'object') return []
    const source = candidate as Record<string, unknown>
    const id = relationshipID(source.id)
    if (!id) return []

    const rawOptions = Array.isArray(source.options) ? source.options : []
    const options = rawOptions.flatMap((rawOption): StorefrontVariantOption[] => {
      if (!rawOption || typeof rawOption !== 'object') return []
      const option = rawOption as Record<string, unknown>
      const optionID = relationshipID(option.id)
      const variantType = option.variantType
      const type =
        variantType && typeof variantType === 'object' && 'name' in variantType
          ? String(variantType.name)
          : typeof option.type === 'string'
            ? option.type
            : ''
      if (!optionID || !type || typeof option.value !== 'string' || !option.value) return []
      return [{
        id: optionID,
        label: typeof option.label === 'string' ? option.label : option.value,
        type,
        value: option.value,
      }]
    })

    return [{
      id,
      inventory: typeof source.inventory === 'number' ? source.inventory : undefined,
      options,
      price: typeof source.priceInUSD === 'number' ? source.priceInUSD : undefined,
      priceInUSDEnabled: source.priceInUSDEnabled === true,
      productId: relationshipID(source.product),
      published: source._status === 'published',
    }]
  })
}
