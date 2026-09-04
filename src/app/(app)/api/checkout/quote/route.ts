import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import {
  createCheckoutQuote,
  resolveStorefrontItems,
} from '@/lib/commerce/checkoutQuote'
import { isODSaiDestination } from '@/lib/commerce/ddp'
import {
  checkoutQuoteErrorResponse,
  parseCheckoutQuoteJSON,
} from '@/lib/commerce/quoteErrors'

export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

export async function POST(req: Request) {
  try {
    const body = parseCheckoutQuoteJSON(await req.text())
    if (!isODSaiDestination(body.countryCode)) {
      return NextResponse.json({ code: 'UNSUPPORTED_DESTINATION' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const items = await resolveStorefrontItems({
      lines: body.lines.map((line) => ({
        productSlug: line.id,
        quantity: line.qty,
        ...(line.variantId ? { variant: line.variantId } : {}),
      })),
      payload,
    })
    const quote = await createCheckoutQuote({
      countryCode: body.countryCode,
      items,
      payload,
      voucherCode: body.voucherCode,
    })

    return NextResponse.json(quote, {
      headers: NO_STORE_HEADERS,
    })
  } catch (error) {
    const { code, status } = checkoutQuoteErrorResponse(error)
    return NextResponse.json({ code }, { headers: NO_STORE_HEADERS, status })
  }
}
