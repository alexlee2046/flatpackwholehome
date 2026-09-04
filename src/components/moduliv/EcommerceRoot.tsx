'use client'

import { EcommerceProvider, USD } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

/**
 * Registers the ecommerce context the storefront's checkout runs on.
 *
 * `publishableKey` is resolved server-side in the locale layout from
 * readStripeServerConfig(), and is empty unless every Stripe variable is
 * present and consistent. An empty key registers no payment method, which is
 * what CartView reads to disable checkout — so a half-configured deployment
 * says so rather than failing at the payment step.
 */
export function EcommerceRoot({
  children,
  checkoutEnabled,
  publishableKey,
}: {
  checkoutEnabled: boolean
  children: React.ReactNode
  publishableKey: string
}) {
  const paymentMethods = React.useMemo(
    () => (checkoutEnabled && publishableKey ? [stripeAdapterClient({ publishableKey })] : []),
    [checkoutEnabled, publishableKey],
  )

  return (
    <EcommerceProvider
      currenciesConfig={{ defaultCurrency: 'USD', supportedCurrencies: [USD] }}
      enableVariants
      paymentMethods={paymentMethods}
    >
      {children}
    </EcommerceProvider>
  )
}
