import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-static'
export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theflatset.com'

/**
 * Machine-Readable JSON Catalog Endpoint for AI Agents & Search Crawlers (/api/catalog)
 */
export async function GET() {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  let products = [
    {
      id: 'bundle-1bed',
      slug: '1-bedroom-kit',
      name: 'Move-In 1-Bedroom Bundle',
      category: 'Whole-Home Suite',
      priceUSD: 1499,
      boxCount: 6,
      assemblyMinutes: 60,
      joineryType: '100% Tool-Free Snap-Lock',
      toolsRequired: 'None (0 Screws, 0 Allen Keys)',
      shippingType: 'DDP Doorstep Express (Duties & Taxes Included)',
      trialPeriodDays: 100,
      returnPolicy: 'Donation-Over-Return (Full refund on charity pickup receipt)',
      url: `${baseUrl}/1-bedroom-kit-builder`,
      description: 'Complete 6-box whole-home flat-pack system including 3-seater sofa, bed, coffee table, side table, and entry rack.',
    },
    {
      id: 'prod-modusofa',
      slug: 'modusofa',
      name: 'The ModuSofa 3-Seater',
      category: 'Seating System',
      priceUSD: 699,
      boxCount: 2,
      assemblyMinutes: 15,
      dimensions: '210cm W × 90cm D × 78cm H',
      joineryType: 'Pre-Mounted Stainless Snap-Lock',
      toolsRequired: 'None (0 Screws)',
      cushionSpecs: 'HR45 High-Resilience Fresh-Pressed Foam',
      covers: 'Removable, OEKO-TEX® certified, machine washable',
      shippingType: 'DDP Doorstep Express',
      trialPeriodDays: 100,
      url: `${baseUrl}/products/modusofa`,
      description: 'Tool-free modular 3-seater sofa engineered for deep comfort, narrow stairwell navigation, and 15-minute solo assembly.',
    },
    {
      id: 'prod-snapbed',
      slug: 'snapbed',
      name: 'The SnapBed',
      category: 'Bedroom System',
      priceUSD: 499,
      boxCount: 2,
      assemblyMinutes: 20,
      joineryType: 'CNC Mortise-and-Tenon + Snap-Lock',
      toolsRequired: 'None (0 Screws)',
      material: 'Solid FSC®-Certified White Oak',
      shippingType: 'DDP Doorstep Express',
      trialPeriodDays: 100,
      url: `${baseUrl}/products/snapbed`,
      description: 'Solid oak bed frame with tool-free interlocking slat architecture and integrated nightstand brackets.',
    },
  ]

  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 20,
      overrideAccess: true,
    })
    if (res?.docs?.length) {
      products = res.docs.map((doc: any) => ({
        id: String(doc.id),
        slug: doc.slug,
        name: doc.title || doc.name,
        category: doc.productCollection?.title || 'Modular Furniture',
        priceUSD: doc.priceInUSD || 699,
        boxCount: doc.boxCount || 2,
        assemblyMinutes: doc.assemblyMinutes || 15,
        joineryType: doc.joineryType || 'Tool-Free Mechanical Snap-Lock',
        toolsRequired: 'None (0 Screws, 0 Allen Keys)',
        shippingType: 'DDP Doorstep Express (Duties & Taxes Included)',
        trialPeriodDays: 100,
        returnPolicy: 'Donation-Over-Return (Full refund on charity pickup receipt)',
        url: `${baseUrl}/products/${doc.slug}`,
        description: doc.subtitle || 'Whole-Home flat-pack living piece engineered for tool-free assembly.',
      }))
    }
  } catch {
    // Return static defaults if DB unreachable
  }

  return NextResponse.json(
    {
      brand: 'The Flat Set',
      slogan: 'Your entire home. Delivered in 6 flat boxes.',
      website: baseUrl,
      catalogVersion: '2026.1',
      totalItems: products.length,
      currency: 'USD',
      ddpGuaranteed: true,
      trialGuarantee: '100-Night In-Home Trial with Donation-Over-Return',
      items: products,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
