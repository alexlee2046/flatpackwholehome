import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const count = await payload.count({ collection: 'products', overrideAccess: true }).catch(() => null)
    return NextResponse.json({
      database: count !== null ? 'connected' : 'initializing',
      service: 'theflatset-storefront',
      status: 'ready',
    })
  } catch {
    return NextResponse.json({
      database: 'pending',
      service: 'theflatset-storefront',
      status: 'ready',
    })
  }
}
