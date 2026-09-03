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
  publishableKey,
}: {
  children: React.ReactNode
  publishableKey: string
}) {
  const paymentMethods = React.useMemo(
    () => (publishableKey ? [stripeAdapterClient({ publishableKey })] : []),
    [publishableKey],
  )

  return (
    <EcommerceProvider
      currenciesConfig={{ defaultCurrency: 'USD', supportedCurrencies: [USD] }}
      paymentMethods={paymentMethods}
    >
      {children}
    </EcommerceProvider>
  )
}
