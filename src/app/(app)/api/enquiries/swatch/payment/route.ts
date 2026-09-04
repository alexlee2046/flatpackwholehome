import { NextResponse } from 'next/server'

import {
  SWATCH_FULFILLMENT_UNAVAILABLE_CODE,
} from '@/lib/commerce/swatchFulfillment'

export const dynamic = 'force-dynamic'

/**
 * Fail closed: do not create a Stripe PaymentIntent until fulfillment and a
 * durable voucher entitlement can be recorded atomically after payment.
 */
export async function POST(_req: Request) {
  return NextResponse.json(
    {
      code: SWATCH_FULFILLMENT_UNAVAILABLE_CODE,
      error: 'Swatch fulfillment is temporarily unavailable.',
    },
    { headers: { 'Cache-Control': 'no-store' }, status: 503 },
  )
}
