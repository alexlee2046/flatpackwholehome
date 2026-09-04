import { MAX_ITEM_QUANTITY } from './ddp'

export const MAX_CHECKOUT_QUOTE_LINES = 50

export const CHECKOUT_QUOTE_ERROR_CODES = [
  'INVALID_REQUEST',
  'CART_EMPTY',
  'UNSUPPORTED_DESTINATION',
  'QUANTITY_INVALID',
  'CATALOG_UNAVAILABLE',
  'VARIANT_REQUIRED',
  'VARIANT_UNAVAILABLE',
  'QUOTE_UNAVAILABLE',
] as const

export type CheckoutQuoteErrorCode = (typeof CHECKOUT_QUOTE_ERROR_CODES)[number]

export class CheckoutQuoteError extends Error {
  code: CheckoutQuoteErrorCode

  constructor(code: CheckoutQuoteErrorCode) {
    super(code)
    this.name = 'CheckoutQuoteError'
    this.code = code
  }
}

export type ParsedCheckoutQuoteLine = {
  id: string
  qty: number
  /** Omitted for parent-priced products that do not use variants. */
  variantId?: number
}

export type ParsedCheckoutQuoteRequest = {
  countryCode: string
  lines: ParsedCheckoutQuoteLine[]
  voucherCode: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeVoucherCode(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

/**
 * Pure request boundary used by the route and contract tests. It intentionally
 * accepts no client-supplied money, prices, labels, or shipment facts.
 */
export function parseCheckoutQuoteRequest(value: unknown): ParsedCheckoutQuoteRequest {
  if (!isRecord(value)) throw new CheckoutQuoteError('INVALID_REQUEST')
  if (typeof value.countryCode !== 'string' || !/^[A-Za-z]{2}$/.test(value.countryCode.trim())) {
    throw new CheckoutQuoteError('UNSUPPORTED_DESTINATION')
  }
  if (!Array.isArray(value.lines) || value.lines.length === 0) {
    throw new CheckoutQuoteError('CART_EMPTY')
  }
  if (value.lines.length > MAX_CHECKOUT_QUOTE_LINES) {
    throw new CheckoutQuoteError('INVALID_REQUEST')
  }

  const lines = value.lines.map((line): ParsedCheckoutQuoteLine => {
    if (!isRecord(line) || typeof line.id !== 'string' || !line.id.trim()) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    const quantity = line.qty
    const variantID = line.variantId
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    if (quantity > MAX_ITEM_QUANTITY) throw new CheckoutQuoteError('QUANTITY_INVALID')
    if (
      variantID !== undefined &&
      (typeof variantID !== 'number' || !Number.isInteger(variantID) || variantID < 1)
    ) {
      throw new CheckoutQuoteError('INVALID_REQUEST')
    }
    return {
      id: line.id.trim(),
      qty: quantity,
      ...(variantID === undefined ? {} : { variantId: variantID }),
    }
  })

  return {
    countryCode: value.countryCode.trim().toUpperCase(),
    lines,
    voucherCode: normalizeVoucherCode(value.voucherCode),
  }
}

export function parseCheckoutQuoteJSON(text: string): ParsedCheckoutQuoteRequest {
  try {
    return parseCheckoutQuoteRequest(JSON.parse(text))
  } catch (error) {
    if (error instanceof CheckoutQuoteError) throw error
    throw new CheckoutQuoteError('INVALID_REQUEST')
  }
}

export function isCheckoutQuoteErrorCode(value: unknown): value is CheckoutQuoteErrorCode {
  return typeof value === 'string' && (CHECKOUT_QUOTE_ERROR_CODES as readonly string[]).includes(value)
}

export function checkoutQuoteErrorStatus(code: CheckoutQuoteErrorCode): number {
  switch (code) {
    case 'QUOTE_UNAVAILABLE':
      return 503
    case 'CATALOG_UNAVAILABLE':
    case 'VARIANT_REQUIRED':
    case 'VARIANT_UNAVAILABLE':
      return 409
    default:
      return 400
  }
}

export function checkoutQuoteErrorResponse(error: unknown): {
  code: CheckoutQuoteErrorCode
  status: number
} {
  if (error instanceof CheckoutQuoteError) {
    return { code: error.code, status: checkoutQuoteErrorStatus(error.code) }
  }
  return { code: 'QUOTE_UNAVAILABLE', status: 503 }
}

/** Extract an intentionally small, stable error payload from fetch responses. */
export function checkoutQuoteErrorCodeFromResponse(value: unknown): CheckoutQuoteErrorCode {
  if (isRecord(value) && isCheckoutQuoteErrorCode(value.code)) return value.code
  return 'QUOTE_UNAVAILABLE'
}
