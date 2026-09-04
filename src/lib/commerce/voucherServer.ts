import { normalizeVoucherCode } from './vouchers'

/**
 * Server-side voucher boundary. HMAC-only vouchers were replayable and had no
 * durable expiry or redemption record, so every code is rejected until a
 * transactional entitlement model is introduced.
 */
export function isVerifiedVoucherCode(_code: unknown): boolean {
  return false
}

export function voucherDiscountInUSD(_code: unknown, _orderTotalInUSD: number): number {
  return 0
}

/** Retained only for safely normalizing historical values in diagnostics. */
export function normalizeHistoricalVoucherCode(code: unknown): string {
  return normalizeVoucherCode(code)
}
