import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

const filename = fileURLToPath(import.meta.url)

const paragraph = (text: string) => ({
  children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  type: 'paragraph',
  version: 1,
})

const richText = (...paragraphs: string[]) => ({
  root: {
    children: paragraphs.map(paragraph),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

export async function seedFlatpack(payload: Payload) {
  payload.logger.info('Seeding MODULIV / The Flat Set whole-home commerce content…')

  const upsertBySlug = async (collection: any, slug: string, data: Record<string, unknown>) => {
    const existing = await payload.find({
      collection,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })

    if (existing.docs[0]) {
      return payload.update({
        collection,
        data: data as never,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    }

    return payload.create({
      collection,
      data: { ...data, slug } as never,
      overrideAccess: true,
    })
  }

  // 1. Seed Default Admin User
  const existingAdmin = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: 'admin@moduliv.studio' } },
  })

  if (!existingAdmin.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@moduliv.studio',
        name: 'MODULIV Admin',
        password: 'moduliv_admin_2026',
        roles: ['admin'],
      },
      overrideAccess: true,
    })
    payload.logger.info('Created default admin: admin@moduliv.studio')
  }

  // 2. Seed Spaces
  const [spaceLiving, spaceBedroom, spaceWholeHome] = await Promise.all([
    upsertBySlug('spaces', 'living-room', {
      title: 'Living Room',
      intro: 'Calm Japandi living spaces centered around the modular ModuSofa and solid oak coffee tables.',
      _status: 'published',
    }),
    upsertBySlug('spaces', 'bedroom', {
      title: 'Bedroom',
      intro: 'Minimalist platform sleeping sanctuary featuring the zero-screw SnapBed.',
      _status: 'published',
    }),
    upsertBySlug('spaces', 'whole-home', {
      title: 'Whole Home 1-Bedroom',
      intro: 'All 6 boxes for complete living and sleeping zones in one seamless delivery.',
      _status: 'published',
    }),
  ])

  // 3. Seed Materials
  const [matOak, matWalnut, matBoucle] = await Promise.all([
    upsertBySlug('materials', 'white-oak', {
      title: 'FSC European White Oak',
      intro: 'Sustainably harvested solid white oak with natural matte wax finish and precision joinery.',
      facts: [
        { label: 'Origin', body: 'FSC-Certified European sustainable forestry.' },
        { label: 'Finish', body: 'Zero-VOC plant-based protective matte wax oil.' },
        { label: 'Density', body: 'High-density slow-grown hardwood built for decades.' },
      ],
      _status: 'published',
    }),
    upsertBySlug('materials', 'black-walnut', {
      title: 'American Black Walnut',
      intro: 'Deep rich chocolate tones with fluid natural grain patterns.',
      facts: [
        { label: 'Origin', body: 'North American Appalachian hardwoods.' },
        { label: 'Grain', body: 'Bookmatched continuous grain along structural rails.' },
      ],
      _status: 'published',
    }),
    upsertBySlug('materials', 'oatmeal-boucle', {
      title: 'Oatmeal Bouclé Weave',
      intro: 'Textured, durable, stain-resistant tactile upholstery designed for daily relaxation.',
      facts: [
        { label: 'Martindale', body: 'Over 60,000 double rubs for commercial-grade durability.' },
        { label: 'Stain Repel', body: 'PFC-free eco water-repellent yarn treatment.' },
      ],
      _status: 'published',
    }),
  ])

  // 4. Seed Products
  const [productSofa, productBed, productKit] = await Promise.all([
    upsertBySlug('products', 'modusofa', {
      title: 'ModuSofa Modular 3-Seater',
      subtitle: 'Tool-free Japandi sofa engineered for deep comfort and tool-free disassembly.',
      priceInUSD: 699,
      boxCount: 2,
      assemblyMinutes: 25,
      joineryType: 'Snap-Lock Mortise & Tenon',
      material: matOak.id,
      spaces: [spaceLiving.id],
      description: richText(
        'The ModuSofa rethinks large living room seating. Shipped flat in two manageable boxes, the kiln-dried solid oak frame connects via hidden interlocking mortise-and-tenon tenons in under 25 minutes without a single screw.',
      ),
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
      _status: 'published',
    }),
    upsertBySlug('products', 'snapbed', {
      title: 'SnapBed Minimal Platform Bed',
      subtitle: 'Solid oak platform bed frame with floating nightstand compatibility.',
      priceInUSD: 800,
      boxCount: 2,
      assemblyMinutes: 20,
      joineryType: 'Zero-Screw Gravity Lock',
      material: matOak.id,
      spaces: [spaceBedroom.id],
      description: richText(
        'Designed for effortless moves and peaceful nights. The SnapBed frame locks securely using gravity wedge joints that get sturdier with weight. No creaking, no loose hardware.',
      ),
      specifications: [
        { label: 'Dimensions (Queen)', value: '160 cm W × 210 cm L × 28 cm H' },
        { label: 'Box Count', value: '2 Flat Boxes' },
      ],
      boxBreakdown: [
        { boxId: 'b5', title: 'Box 5: Bed Frame Side Rails & Hardware', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Long structural perimeter rails with embedded gravity locks.' },
        { boxId: 'b6', title: 'Box 6: Slats & Headboard System', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC birch roll-out slats and optional low headboard.' },
      ],
      _status: 'published',
    }),
    upsertBySlug('products', '1-bedroom-kit', {
      title: '1-Bedroom Whole Home Kit',
      subtitle: 'Complete whole-home furniture solution: Living, Dining, and Bedroom in 6 flat boxes.',
      priceInUSD: 1499,
      boxCount: 6,
      assemblyMinutes: 60,
      joineryType: 'Full Japandi Tool-Free System',
      material: matOak.id,
      spaces: [spaceWholeHome.id, spaceLiving.id, spaceBedroom.id],
      description: richText(
        'Your entire apartment furnished in one delivery. Includes the 3-seater ModuSofa, Oak Coffee Table, SnapBed frame with nightstands, and dining bench. All engineered to assemble in 60 minutes tool-free.',
      ),
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
      _status: 'published',
    }),
  ])

  // 5. Seed Globals
  await Promise.all([
    payload.updateGlobal({
      slug: 'site-settings',
      data: {
        brandName: 'MODULIV',
        defaultCurrency: 'USD',
        defaultLocale: 'en',
        descriptor: 'Whole-home flat-pack Japandi furniture delivered in 6 flat boxes worldwide.',
        tagline: 'Your entire home. Delivered in 6 flat boxes.',
        contactEmail: 'hello@moduliv.studio',
      },
      overrideAccess: true,
    }),
    payload.updateGlobal({
      slug: 'announcement',
      data: {
        enabled: true,
        message: 'Free Swatch Box with $50 Voucher — Worldwide DDP Delivery & Duties Included',
        linkLabel: 'Explore 1-Bedroom Kit',
        linkURL: '/1-bedroom-kit-builder',
      },
      overrideAccess: true,
    }),
    payload.updateGlobal({
      slug: 'homepage',
      data: {
        hero: {
          eyebrow: 'JAPANDI WHOLE-HOME SYSTEM',
          headline: 'Your entire home. Delivered in 6 flat boxes.',
          body: 'Solid FSC-certified oak and walnut furniture engineered for tool-free assembly, zero-hassle shipping, and lifetime modularity.',
        },
        featuredProducts: [productKit.id, productSofa.id, productBed.id],
      },
      overrideAccess: true,
    }),
  ])

  payload.logger.info('MODULIV seed complete!')
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const main = async () => {
    const [{ default: config }, { getPayload }] = await Promise.all([
      import('@payload-config'),
      import('payload'),
    ])
    const payload = await getPayload({ config })
    await seedFlatpack(payload)
    process.exit(0)
  }

  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
