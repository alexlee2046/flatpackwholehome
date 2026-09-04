/**
 * Swatch fulfillment and voucher redemption intentionally remain disabled until
 * a durable, atomic entitlement store exists. A signed code by itself cannot
 * prove expiry, one-time use, or delivery eligibility under concurrent orders.
 *
 * This is deliberately a code-level false rather than an environment switch:
 * enabling a charge/fulfillment flow without its required persistence would be
 * an unsafe partial rollout.
 */
export const SWATCH_FULFILLMENT_ENABLED = false
export const SWATCH_FULFILLMENT_UNAVAILABLE_CODE = 'SWATCH_FULFILLMENT_UNAVAILABLE'
