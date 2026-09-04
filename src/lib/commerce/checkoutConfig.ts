import 'server-only'

import { isCheckoutReleaseEnabled } from './checkoutRelease'
import { readStripeServerConfig } from './stripeConfig'

export function readCheckoutConfig() {
  const stripe = readStripeServerConfig()
  const explicitlyEnabled = isCheckoutReleaseEnabled()

  return {
    enabled: explicitlyEnabled && stripe.status === 'configured',
    publishableKey:
      explicitlyEnabled && stripe.status === 'configured' ? stripe.publishableKey : '',
    stripe,
  }
}
