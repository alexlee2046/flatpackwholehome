import { NextResponse } from 'next/server'

import {
  SWATCH_FULFILLMENT_UNAVAILABLE_CODE,
} from '@/lib/commerce/swatchFulfillment'

export const dynamic = 'force-dynamic'

/**
 * This route intentionally does not accept, store, or fulfill a paid swatch
 * request. Generic contact enquiries remain separate from paid fulfillment.
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
