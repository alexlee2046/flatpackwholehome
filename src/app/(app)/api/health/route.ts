import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.count({ collection: 'products', overrideAccess: true })
    return NextResponse.json({ service: 'moduliv-storefront', status: 'ready' })
  } catch (error) {
    return NextResponse.json(
      {
        service: 'moduliv-storefront',
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    )
  }
}
