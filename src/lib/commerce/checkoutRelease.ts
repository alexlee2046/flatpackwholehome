type CheckoutReleaseEnvironment = Record<string, string | undefined>

/**
 * Online payment is a deliberate release action, not a side effect of Stripe
 * credentials being present. Keep this tiny predicate separate so every
 * server-side payment entry point can share the same fail-closed gate.
 */
export function isCheckoutReleaseEnabled(
  environment: CheckoutReleaseEnvironment = process.env,
): boolean {
  return environment.CHECKOUT_ENABLED === 'true'
}
