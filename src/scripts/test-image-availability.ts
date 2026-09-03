import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(dirname, '../..')
const BASE_URL = 'http://localhost:3000'

async function checkUrl(url: string, description: string): Promise<{ success: boolean; status: number; url: string }> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    const res = await fetch(fullUrl, { method: 'GET' })
    const success = res.status === 200
    if (!success) {
      console.error(`✗ [HTTP ${res.status}] ${description}: ${fullUrl}`)
    } else {
      console.log(`✓ [HTTP 200] ${description}: ${url}`)
    }
    return { success, status: res.status, url }
  } catch (err: any) {
    console.error(`✗ [FETCH ERROR] ${description}: ${url} -> ${err.message}`)
    return { success: false, status: 0, url }
  }
}

async function run() {
  console.log('=== Image Availability & Storefront HTTP 200 Verification ===\n')

  let failures = 0
  let totalChecked = 0

  // 1. Check Storefront Pages
  console.log('--- 1. Storefront Pages ---')
  const pages = [
    { url: '/en', desc: 'Homepage (en)' },
    { url: '/en/products/modusofa', desc: 'ModuSofa PDP (en)' },
    { url: '/en/1-bedroom-kit-builder', desc: 'Kit Builder (en)' },
    { url: '/en/free-swatch-box-material-discovery', desc: 'Swatch Discovery (en)' },
    { url: '/en/cart', desc: 'Cart View (en)' },
  ]
  for (const page of pages) {
    totalChecked++
    const res = await checkUrl(page.url, page.desc)
    if (!res.success) failures++
  }

  // 2. Check Static Public Assets in components
  console.log('\n--- 2. Static Assets Referenced in Components ---')
  const staticAssets = [
    // Swatches in ProductDetail & KitBuilder
    '/assets/1-bedroom-kit-builder/wood-walnut.png',
    '/assets/1-bedroom-kit-builder/42c66f93ee.png',
    '/assets/1-bedroom-kit-builder/ec621fdd7b.png',
    '/assets/1-bedroom-kit-builder/359e11ad79.png',
    '/assets/1-bedroom-kit-builder/13266a8714.png',
    '/assets/1-bedroom-kit-builder/ebd8892f4c.png',
    '/assets/1-bedroom-kit-builder/188581c175.png',
    // ModuSofa PDP fallback visuals
    '/assets/modusofa-product-detail-page/e38c85e68d.png',
    '/assets/modusofa-product-detail-page/b354f66f79.png',
    '/assets/modusofa-product-detail-page/d3a3e93b3d.png',
    // Screenshots
    '/screenshots/asset-boxes-to-room-split.png',
    '/screenshots/asset-snap-joint-exploded.png',
    '/screenshots/asset-swatch-box-hero.png',
    '/screenshots/asset-swatch-box-closeup.png',
    '/screenshots/modusofa-product-detail-page.png',
    '/screenshots/1-bedroom-kit-builder.png',
    '/screenshots/free-swatch-box-material-discovery.png',
    '/screenshots/homepage.png',
    '/screenshots/how-it-works-craft-logistics.png',
    // Homepage & Boxes
    '/assets/homepage/hero-split.png',
    '/assets/1-bedroom-kit-builder/da48e93272.png',
    '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
    '/assets/1-bedroom-kit-builder/5ce35b6043.png',
    '/assets/1-bedroom-kit-builder/b23c77bfdd.png',
    '/assets/1-bedroom-kit-builder/5c675ca5bd.png',
    '/assets/1-bedroom-kit-builder/b0bf525a54.png',
    '/assets/1-bedroom-kit-builder/d4a4793ee2.png',
    '/assets/1-bedroom-kit-builder/d66ddc7ba1.png',
    '/assets/how-it-works-craft-logistics/83b98d3f9e.png',
    '/assets/how-it-works-craft-logistics/b99895568b.png',
    '/assets/brand/favicon.svg',
  ]

  for (const asset of staticAssets) {
    totalChecked++
    const res = await checkUrl(asset, `Static asset ${path.basename(asset)}`)
    if (!res.success) failures++
  }

  // 3. Check Payload Media API Endpoints
  console.log('\n--- 3. Payload Media API Records ---')
  const payload = await getPayload({ config })
  const mediaDocs = await payload.find({
    collection: 'media',
    limit: 100,
    overrideAccess: true,
  })

  for (const doc of mediaDocs.docs) {
    if (doc.url) {
      totalChecked++
      const res = await checkUrl(doc.url, `Media doc [${doc.id}] ${doc.filename}`)
      if (!res.success) failures++
    }
  }

  console.log(`\n==============================================`)
  console.log(`Summary: Checked ${totalChecked} endpoints, ${failures} failures.`)
  console.log(`==============================================`)

  if (failures > 0) {
    process.exit(1)
  }
  process.exit(0)
}

run().catch((err) => {
  console.error('Fatal testing error:', err)
  process.exit(1)
})
