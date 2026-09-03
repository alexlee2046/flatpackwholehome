import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  let payload
  try {
    payload = await getPayload({ config: configPromise })
  } catch (error) {
    return NextResponse.json(
      {
        database: 'unreachable',
        error: error instanceof Error ? error.message : String(error),
        service: 'theflatset-storefront',
        stage: 'init',
        status: 'error',
      },
      { status: 503 },
    )
  }

  try {
    await payload.count({ collection: 'products', overrideAccess: true })
    return NextResponse.json({
      database: 'connected',
      service: 'theflatset-storefront',
      status: 'ready',
    })
  } catch (error) {
    return NextResponse.json(
      {
        database: 'unreachable',
        error: error instanceof Error ? error.message : String(error),
        service: 'theflatset-storefront',
        stage: 'query',
        status: 'error',
      },
      { status: 503 },
    )
  }
}
