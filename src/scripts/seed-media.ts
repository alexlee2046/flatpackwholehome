import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rootDir = process.cwd()

export const ALT_MAP: Record<string, string> = {
  // Screenshots & Key Visuals
  'asset-snap-joint-exploded.png': 'Exploded view of The Flat Set oak snap joints and hardware-free assembly',
  'asset-boxes-to-room-split.png': 'Six The Flat Set flat-pack boxes beside the same room fully furnished',
  'asset-swatch-box-hero.png': 'The Flat Set swatch box open on an oak coffee table in natural light',
  'asset-swatch-box-closeup.png': 'Close-up editorial view of tactile fabric swatches and wood chips in kraft box',
  'homepage.png': 'The Flat Set whole home flat pack furniture storefront preview',
  'modusofa-product-detail-page.png': 'ModuSofa 3-seater modular sofa product detail page preview',
  '1-bedroom-kit-builder.png': '1-Bedroom whole home flat pack kit builder preview',
  'free-swatch-box-material-discovery.png': 'Free swatch box and material discovery page preview',
  'how-it-works-craft-logistics.png': 'Craft joinery and global DDP logistics preview',

  // ModuSofa PDP Assets
  'e38c85e68d.png': 'ModuSofa three-seater modular sofa in terracotta fabric with matching ottoman',
  'b354f66f79.png': 'Close up detail of stainless steel snap bracket connecting solid oak beams',
  'd3a3e93b3d.png': 'Close detail of the ModuSofa upholstery weave and the seam between two modular seat units',

  // Kit Builder / Whole Home Assets
  'da48e93272.png': 'Japandi whole-home living room featuring ModuSofa and oak coffee table',
  'b4e5f4d8a0.png': 'SnapBed minimal platform bed in solid oak bedroom setting',
  '188581c175.png': 'American Black Walnut solid hardwood finish sample',
  'ebd8892f4c.png': 'FSC European White Oak solid hardwood finish sample',
  'ec621fdd7b.png': 'Cream Bouclé tactile upholstery fabric swatch',
  '42c66f93ee.png': 'Caramel Corduroy textured upholstery fabric swatch',
  '359e11ad79.png': 'Olive Chenille plush upholstery fabric swatch',
  '13266a8714.png': 'Tech Grey durable upholstery fabric swatch',
  '5ce35b6043.png': 'Box 1: ModuSofa oak base and joinery rails packaging',
  'b23c77bfdd.png': 'Box 2: ModuSofa cushions and modular backrest packaging',
  '5c675ca5bd.png': 'Box 3: Low solid oak coffee table packaging',
  'b0bf525a54.png': 'Box 4: TV console and solid wood media bench packaging',
  'd4a4793ee2.png': 'Box 5: SnapBed frame perimeter side rails packaging',
  'd66ddc7ba1.png': 'Box 6: Birch slats and floating nightstands packaging',

  // Homepage & Logistics Assets
  'hero-split.png': 'Six flat-pack The Flat Set boxes beside the same room fully furnished in warm minimalist style',
  'dac92d496c.svg': 'The Flat Set architectural modular system diagram',
  '64099eb7b3.png': 'Material discovery tactile fabric and wood chips display',
  '83b98d3f9e.png': 'Vacuum press compressing a sealed foam and fabric cushion core in the workshop',
  'b99895568b.png': 'Global DDP door-to-door delivery in standard apartment elevator-ready boxes',

  // Brand SVGs
  'wordmark.svg': 'The Flat Set wordmark logo',
  'icon-tile.svg': 'The Flat Set icon tile',
  'lockup.svg': 'The Flat Set brand lockup',
  'mark-mono-kraft.svg': 'The Flat Set kraft monochrome mark',
  'mark.svg': 'The Flat Set brand mark',
  'wordmark-on-dark.svg': 'The Flat Set wordmark on dark background',
  'wordmark-stacked.svg': 'The Flat Set stacked wordmark',
  'mark-on-dark.svg': 'The Flat Set brand mark on dark background',
  'favicon.svg': 'The Flat Set favicon',
}

function collectImageFiles(dirPath: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dirPath)) return results

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectImageFiles(full))
    } else if (/\.(png|jpg|jpeg|svg|webp)$/i.test(entry.name)) {
      results.push(full)
    }
  }
  return results
}

export async function seedMedia(payload: Payload): Promise<Map<string, number>> {
  payload.logger.info('Seeding Payload Media Collection…')

  const mediaDir = path.resolve(rootDir, 'public/media')
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true })
  }

  // Collect all images from public/assets and public/screenshots
  const assetsDir = path.resolve(rootDir, 'public/assets')
  const screenshotsDir = path.resolve(rootDir, 'public/screenshots')

  const allFiles = [
    ...collectImageFiles(assetsDir),
    ...collectImageFiles(screenshotsDir),
  ]

  payload.logger.info(`Found ${allFiles.length} source images across public/assets and public/screenshots.`)

  const mediaMap = new Map<string, number>()

  for (const filePath of allFiles) {
    const base = path.basename(filePath)
    const alt = ALT_MAP[base] || `The Flat Set - ${base.replace(/\.[^.]+$/, '')}`

    try {
      const existing = await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          filename: { equals: base },
        },
      })

      if (existing.docs[0]) {
        const docId = Number(existing.docs[0].id)
        mediaMap.set(base, docId)

        // Ensure published and approved
        if (existing.docs[0]._status !== 'published') {
          await payload.update({
            collection: 'media',
            id: docId,
            data: {
              _status: 'published',
              reviewState: 'approved',
            },
            overrideAccess: true,
          })
        }
        continue
      }

      // Create new media record
      const created = await payload.create({
        collection: 'media',
        filePath,
        data: {
          alt,
          productIdentityConfidence: 'exact-reviewed',
          reviewState: 'approved',
          _status: 'published',
        },
        overrideAccess: true,
      })

      const docId = Number(created.id)
      mediaMap.set(base, docId)
      payload.logger.info(`Created Media [${docId}]: ${base}`)
    } catch (err: any) {
      payload.logger.error(`Failed to register media file ${base}: ${err?.message || err}`)
    }
  }

  payload.logger.info(`Seeded ${mediaMap.size} media records into Payload Media collection.`)

  // Link Media to Products, Spaces, Materials, and Homepage
  payload.logger.info('Linking Media to Products, Spaces, Materials, and Homepage…')

  const getMediaId = (filename: string): number | undefined => mediaMap.get(filename)

  // 1. Link Products
  const productsToUpdate = [
    {
      slug: 'modusofa',
      gallery: [
        'e38c85e68d.png',
        'asset-boxes-to-room-split.png',
        'b354f66f79.png',
        'd3a3e93b3d.png',
      ],
      metaImage: 'e38c85e68d.png',
    },
    {
      slug: 'snapbed',
      gallery: [
        'b4e5f4d8a0.png',
        'd4a4793ee2.png',
        'd66ddc7ba1.png',
      ],
      metaImage: 'b4e5f4d8a0.png',
    },
    {
      slug: '1-bedroom-kit',
      gallery: [
        'da48e93272.png',
        'b4e5f4d8a0.png',
        'asset-boxes-to-room-split.png',
        '188581c175.png',
      ],
      metaImage: 'da48e93272.png',
    },
  ]

  const PRODUCT_SPECS: Record<string, any> = {
    modusofa: {
      specifications: [
        { label: 'Dimensions', value: '220 cm W × 92 cm D × 74 cm H' },
        { label: 'Frame', value: 'Solid FSC European White Oak' },
        { label: 'Cushions', value: 'High-resilience foam core + down-blend wrap' },
        { label: 'Box Count', value: '2 Flat Boxes (Fits standard elevator)' },
      ],
      boxBreakdown: [
        { boxId: 'b1', title: 'Box 1: Oak Base & Joinery Rails', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Solid oak perimeter rails and center support.' },
        { boxId: 'b2', title: 'Box 2: Cushions & Backrest Supports', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Down-blend seat cushions and modular backrests.' },
      ],
    },
    snapbed: {
      specifications: [
        { label: 'Dimensions (Queen)', value: '160 cm W × 210 cm L × 28 cm H' },
        { label: 'Box Count', value: '2 Flat Boxes' },
      ],
      boxBreakdown: [
        { boxId: 'b5', title: 'Box 5: Bed Frame Side Rails & Hardware', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Long structural perimeter rails with embedded gravity locks.' },
        { boxId: 'b6', title: 'Box 6: Slats & Headboard System', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC birch roll-out slats and optional low headboard.' },
      ],
    },
    '1-bedroom-kit': {
      specifications: [
        { label: 'Coverage', value: 'Living, Bedroom, & Dining essentials' },
        { label: 'Total Boxes', value: '6 Boxes (DDP Delivered to Room of Choice)' },
        { label: 'Bundle Savings', value: '$350 vs buying pieces separately' },
      ],
      boxBreakdown: [
        { boxId: 'b1', title: 'Box 1: ModuSofa Base Frame', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Living set base framework' },
        { boxId: 'b2', title: 'Box 2: ModuSofa Cushions & Backs', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Bouclé cushions and back pillows' },
        { boxId: 'b3', title: 'Box 3: Low Coffee Table', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: 'Solid oak organic coffee table' },
        { boxId: 'b4', title: 'Box 4: Dining / Work Bench', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: 'Dual-purpose solid wood bench' },
        { boxId: 'b5', title: 'Box 5: SnapBed Frame Rails', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Queen platform perimeter frame' },
        { boxId: 'b6', title: 'Box 6: SnapBed Slats & Nightstands', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'Birch slats + two floating nightstands' },
      ],
    },
  }

  for (const p of productsToUpdate) {
    const existing = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      where: { slug: { equals: p.slug } },
    })

    if (existing.docs[0]) {
      const doc = existing.docs[0]
      const gallery = p.gallery
        .map((img) => getMediaId(img))
        .filter((id): id is number => typeof id === 'number')
        .map((id) => ({ image: id }))

      const metaMediaId = getMediaId(p.metaImage)
      const extra = PRODUCT_SPECS[p.slug] || {}

      await payload.update({
        collection: 'products',
        id: doc.id,
        data: {
          gallery,
          ...(metaMediaId ? { meta: { ...(doc.meta || {}), image: metaMediaId } } : {}),
          ...(extra.specifications ? { specifications: extra.specifications } : {}),
          ...(extra.boxBreakdown ? { boxBreakdown: extra.boxBreakdown } : {}),
          _status: 'published',
        },
        locale: 'en' as never,
        overrideAccess: true,
      })
      payload.logger.info(`Linked Media to product '${p.slug}' (${gallery.length} gallery images)`)
    }
  }

  // 2. Link Spaces
  const spacesToUpdate = [
    { slug: 'living-room', heroImage: 'da48e93272.png' },
    { slug: 'bedroom', heroImage: 'b4e5f4d8a0.png' },
    { slug: 'whole-home', heroImage: 'asset-boxes-to-room-split.png' },
  ]

  for (const s of spacesToUpdate) {
    const existing = await payload.find({
      collection: 'spaces',
      depth: 0,
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      where: { slug: { equals: s.slug } },
    })

    if (existing.docs[0]) {
      const doc = existing.docs[0]
      const heroId = getMediaId(s.heroImage)
      if (heroId) {
        await payload.update({
          collection: 'spaces',
          id: doc.id,
          data: {
            hero: heroId,
            intro: doc.intro,
            title: doc.title,
            _status: 'published',
          },
          locale: 'en' as never,
          overrideAccess: true,
        })
        payload.logger.info(`Linked Media hero to space '${s.slug}'`)
      }
    }
  }

  // 3. Link Materials
  const MATERIAL_FACTS: Record<string, any[]> = {
    'white-oak': [
      { label: 'Origin', body: 'FSC-Certified European sustainable forestry.' },
      { label: 'Finish', body: 'Zero-VOC plant-based protective matte wax oil.' },
      { label: 'Density', body: 'High-density slow-grown hardwood built for decades.' },
    ],
    'black-walnut': [
      { label: 'Origin', body: 'North American Appalachian hardwoods.' },
      { label: 'Grain', body: 'Bookmatched continuous grain along structural rails.' },
    ],
    'oatmeal-boucle': [
      { label: 'Martindale', body: 'Over 60,000 double rubs for commercial-grade durability.' },
      { label: 'Stain Repel', body: 'PFC-free eco water-repellent yarn treatment.' },
    ],
  }

  const materialsToUpdate = [
    { slug: 'white-oak', heroImage: 'ebd8892f4c.png' },
    { slug: 'black-walnut', heroImage: '188581c175.png' },
    { slug: 'oatmeal-boucle', heroImage: 'ec621fdd7b.png' },
  ]

  for (const m of materialsToUpdate) {
    const existing = await payload.find({
      collection: 'materials',
      depth: 0,
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      where: { slug: { equals: m.slug } },
    })

    if (existing.docs[0]) {
      const doc = existing.docs[0]
      const heroId = getMediaId(m.heroImage)
      if (heroId) {
        await payload.update({
          collection: 'materials',
          id: doc.id,
          data: {
            hero: heroId,
            intro: doc.intro,
            title: doc.title,
            facts: MATERIAL_FACTS[m.slug] || doc.facts,
            _status: 'published',
          },
          locale: 'en' as never,
          overrideAccess: true,
        })
        payload.logger.info(`Linked Media hero to material '${m.slug}'`)
      }
    }
  }

  // 4. Link Homepage Hero Image
  const homeHeroId = getMediaId('hero-split.png') || getMediaId('asset-boxes-to-room-split.png')
  if (homeHeroId) {
    try {
      await payload.updateGlobal({
        slug: 'homepage',
        data: {
          hero: {
            image: homeHeroId,
          },
        },
        locale: 'en' as never,
        overrideAccess: true,
      })
      payload.logger.info(`Linked Media [${homeHeroId}] to Homepage hero image`)
    } catch (err: any) {
      payload.logger.error(`Failed to link Homepage hero image: ${err?.message || err}`)
    }
  }

  payload.logger.info('Media seeding and linking complete!')
  return mediaMap
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const main = async () => {
    const [{ default: config }, { getPayload }] = await Promise.all([
      import('@payload-config'),
      import('payload'),
    ])
    const payload = await getPayload({ config })
    await seedMedia(payload)
    process.exit(0)
  }

  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
