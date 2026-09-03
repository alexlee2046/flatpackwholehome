import { NextResponse } from 'next/server'

import { getPublicStripeConfig } from '@/lib/commerce/stripeConfig'

export const dynamic = 'force-dynamic'

/**
 * Public, secret-free checkout availability check for the client cart/checkout UI.
 * Never expose the Stripe secret key or webhook secret here — only the
 * publishable key (when configured) and a status the UI can branch on.
 */
export async function GET() {
  return NextResponse.json(getPublicStripeConfig())
}
