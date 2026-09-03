/**
 * Server-side truth for the swatch-box voucher.
 *
 * The cart may preview a discount, but the amount that reaches Stripe is only
 * ever computed from here — a code arriving from the browser is validated, not
 * trusted, and the discount is applied where the order total is calculated
 * rather than subtracted in the UI.
 *
 * Amounts are cents, like every other money value in this codebase.
 */

const VOUCHER_CODES = new Set(['SWATCH50', 'MODULIV-SWATCH-50', 'FLATSET50'])

export const VOUCHER_DISCOUNT_IN_USD = 5000

export function normalizeVoucherCode(code: unknown): string {
  return typeof code === 'string' ? code.trim().toUpperCase() : ''
}

export function isValidVoucherCode(code: unknown): boolean {
  return VOUCHER_CODES.has(normalizeVoucherCode(code))
}

/**
 * Discount in cents for a code, or 0 when it is unknown. `orderTotalInUSD` caps
 * the discount so a voucher can never drive an order to zero or below — Stripe
 * rejects a non-positive amount, and an order that costs nothing is a bug
 * rather than a promotion.
 */
export function voucherDiscountInUSD(code: unknown, orderTotalInUSD: number): number {
  if (!isValidVoucherCode(code)) return 0
  if (!Number.isInteger(orderTotalInUSD) || orderTotalInUSD <= 0) return 0
  return Math.min(VOUCHER_DISCOUNT_IN_USD, Math.max(0, orderTotalInUSD - 1))
}
