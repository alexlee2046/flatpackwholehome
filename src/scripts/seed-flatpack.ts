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
  payload.logger.info('Seeding The Flat Set whole-home commerce content…')

  const upsertBySlug = async (collection: any, slug: string, data: Record<string, unknown>, locale?: string) => {
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
        locale: locale as never,
        overrideAccess: true,
      })
    }

    return payload.create({
      collection,
      data: { ...data, slug } as never,
      locale: locale as never,
      overrideAccess: true,
    })
  }

  // 1. Seed Default Admin User
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@theflatset.com'
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'flatset_admin_2026'

  const existingAdmin = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      or: [
        { email: { equals: adminEmail } },
        { email: { equals: 'admin@moduliv.studio' } },
      ],
    },
  })

  if (!existingAdmin.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        name: 'The Flat Set Admin',
        password: adminPassword,
        roles: ['admin'],
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created default admin: ${adminEmail}`)
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

  // 5. Seed Globals (en)
  await Promise.all([
    payload.updateGlobal({
      slug: 'site-settings',
      data: {
        brandName: 'The Flat Set',
        defaultCurrency: 'USD',
        defaultLocale: 'en',
        descriptor: 'Whole-home flat-pack Japandi furniture delivered in 6 flat boxes worldwide.',
        tagline: 'Your entire home. Delivered in 6 flat boxes.',
        contactEmail: 'hello@theflatset.com',
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

  // 6. Seed Chinese Localization (zh-CN)
  await Promise.all([
    upsertBySlug('spaces', 'living-room', {
      title: '客厅空间',
      intro: '以模块化 ModuSofa 与实木橡木茶几为核心的日式极简客厅空间。',
    }, 'zh-CN'),
    upsertBySlug('spaces', 'bedroom', {
      title: '卧室空间',
      intro: '零螺丝组装 SnapBed 地台床打造的极简睡眠栖息地。',
    }, 'zh-CN'),
    upsertBySlug('spaces', 'whole-home', {
      title: '一居室全屋整装',
      intro: '仅需 6 个扁平包装箱，一次性送达客厅与卧室全套家具。',
    }, 'zh-CN'),

    upsertBySlug('materials', 'white-oak', {
      title: 'FSC 认证欧洲白橡木',
      intro: '可持续采伐的原木白橡木，表面采用天然哑光木蜡油与高精度榫卯工艺。',
      facts: [
        { label: '产地', body: 'FSC 认证欧洲可持续森林。' },
        { label: '涂装', body: '零 VOC 植物基哑光木蜡油。' },
        { label: '密度', body: '高密度慢生硬木，历久弥新。' },
      ],
    }, 'zh-CN'),
    upsertBySlug('materials', 'black-walnut', {
      title: '北美特级黑胡桃木',
      intro: '温润醇厚的深巧克力色泽，带有行云流水般的天然山形纹理。',
      facts: [
        { label: '产地', body: '北美阿巴拉契亚优质硬木林。' },
        { label: '纹理', body: '结构主梁采用连续山形拼花对称纹理。' },
      ],
    }, 'zh-CN'),
    upsertBySlug('materials', 'oatmeal-boucle', {
      title: '燕麦色肌理羊圈呢',
      intro: '富有质感、耐磨抗污的舒适触感织物，专为日常舒适起居设计。',
      facts: [
        { label: '马丁代尔耐磨度', body: '超过 60,000 次双摩擦，商业级耐磨标准。' },
        { label: '抗污防护', body: '无氟环保防泼水纱线工艺。' },
      ],
    }, 'zh-CN'),

    upsertBySlug('products', 'modusofa', {
      title: 'ModuSofa 模块化三人沙发',
      subtitle: '免工具榫卯组装的日式沙发，专为深舒适坐感与自由拆卸设计。',
      specifications: [
        { label: '尺寸', value: '220 cm 宽 × 92 cm 深 × 74 cm 高' },
        { label: '框架材质', value: 'FSC 认证欧洲特级白橡木原木' },
        { label: '坐垫填充', value: '高回弹海绵支撑层 + 羽绒柔弹包裹层' },
        { label: '包装规格', value: '2 个扁平纸箱（轻松进入标准客梯）' },
      ],
      boxBreakdown: [
        { boxId: 'b1', title: '1 号箱：实木底座与榫卯横梁', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '纯实木白橡木边框与中央承重梁。' },
        { boxId: 'b2', title: '2 号箱：坐垫与靠背支撑件', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羽绒混纺坐垫与模块化靠背组件。' },
      ],
    }, 'zh-CN'),
    upsertBySlug('products', 'snapbed', {
      title: 'SnapBed 极简地台床',
      subtitle: '纯实木橡木悬浮地台床架，兼容无缝悬浮床头柜。',
      specifications: [
        { label: '尺寸 (Queen 标准双人)', value: '160 cm 宽 × 210 cm 长 × 28 cm 高' },
        { label: '包装规格', value: '2 个扁平纸箱' },
      ],
      boxBreakdown: [
        { boxId: 'b5', title: '5 号箱：床架侧梁与五金锁扣', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: '内嵌自重锁止结构的实木长侧梁。' },
        { boxId: 'b6', title: '6 号箱：排骨架与床头模块', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC 桦木卷式排骨架与低矮床头板。' },
      ],
    }, 'zh-CN'),
    upsertBySlug('products', '1-bedroom-kit', {
      title: '一居室全套家具包 (6 箱整套)',
      subtitle: '全屋家具一站式解决方案：客厅、餐厅与卧室仅需 6 个包装箱。',
      specifications: [
        { label: '全套配置', value: 'ModuSofa 三人沙发 + 实木茶几 + SnapBed 地台床 + 餐厅长凳' },
        { label: '包装规格', value: '6 个扁平包装箱（一次性完整配送）' },
        { label: '组装时间', value: '双人约 60 分钟全程免螺丝组装' },
      ],
      boxBreakdown: [
        { boxId: 'b1', title: '1 号箱：ModuSofa 橡木底架', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '沙发实木框架与免工具卡扣' },
        { boxId: 'b2', title: '2 号箱：ModuSofa 坐垫靠包', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羊圈呢坐垫与靠枕组' },
        { boxId: 'b3', title: '3 号箱：低矮极简茶几', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: '纯实木橡木有机形态茶几' },
        { boxId: 'b4', title: '4 号箱：多功能长凳', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: '餐桌/玄关两用实木长凳' },
        { boxId: 'b5', title: '5 号箱：SnapBed 床架侧梁', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Queen 双人床边框与重力卡榫' },
        { boxId: 'b6', title: '6 号箱：SnapBed 床排骨架与悬浮床头柜', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: '桦木排骨架 + 两个悬浮置物床头柜' },
      ],
    }, 'zh-CN'),

    payload.updateGlobal({
      slug: 'announcement',
      data: {
        message: '免费面料色卡盒附赠 $50 抵用券 — 全球 DDP 包税专线配送',
        linkLabel: '探索一居室全套方案',
        linkURL: '/1-bedroom-kit-builder',
      },
      locale: 'zh-CN' as never,
      overrideAccess: true,
    }),
    payload.updateGlobal({
      slug: 'homepage',
      data: {
        hero: {
          eyebrow: '日式极简全屋系统',
          headline: '6 个扁平包装箱装下你的整套家',
          body: '精选 FSC 认证欧洲白橡木与北美黑胡桃木，无需螺丝工具即可组装。',
        },
      },
      locale: 'zh-CN' as never,
      overrideAccess: true,
    }),
  ])

  payload.logger.info('The Flat Set seed complete!')
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
