/**
 * Browser-safe voucher normalization and format checks. Cryptographic issuance
 * and verification live in voucherServer.ts and never enter a client bundle.
 */

export const VOUCHER_DISCOUNT_IN_USD = 5000

// See swatchFulfillment.ts: redemption stays fail-closed until a durable,
// atomic entitlement store can enforce expiry and one-time consumption.
export const VOUCHER_REDEMPTION_ENABLED = false

export function normalizeVoucherCode(code: unknown): string {
  return typeof code === 'string' ? code.trim().toUpperCase() : ''
}

// Client-side shape check only. The HMAC is verified on the server before any
// discount reaches a quote or PaymentIntent.
export function isValidVoucherCode(code: unknown): boolean {
  return (
    VOUCHER_REDEMPTION_ENABLED &&
    /^SWATCH50-[A-F0-9]{10}-[A-F0-9]{10}$/.test(normalizeVoucherCode(code))
  )
}
