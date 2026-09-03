import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'
import { seedMedia } from './seed-media'
import { seedTranslations } from './seed-translations'

const filename = fileURLToPath(import.meta.url)

const richTextLocale = (locale: string, ...paragraphs: string[]) => {
  const isRtl = locale === 'ar'
  const direction = isRtl ? ('rtl' as const) : ('ltr' as const)
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
        direction,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export async function seedFlatpack(payload: Payload) {
  payload.logger.info('Seeding The Flat Set whole-home commerce content across all 7 locales…')

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

  if (existingAdmin.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existingAdmin.docs[0].id,
      data: {
        email: adminEmail,
        name: 'The Flat Set Admin',
        password: adminPassword,
        roles: ['admin'],
      },
      overrideAccess: true,
    })
    payload.logger.info(`Updated admin credentials for: ${adminEmail}`)
  } else {
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

  // 2. Seed Base Entities in Default Locale (en)
  const en = seedTranslations.en

  const [spaceLiving, spaceBedroom, spaceWholeHome] = await Promise.all([
    upsertBySlug('spaces', 'living-room', {
      title: en.spaces['living-room'].title,
      intro: en.spaces['living-room'].intro,
      _status: 'published',
    }, 'en'),
    upsertBySlug('spaces', 'bedroom', {
      title: en.spaces.bedroom.title,
      intro: en.spaces.bedroom.intro,
      _status: 'published',
    }, 'en'),
    upsertBySlug('spaces', 'whole-home', {
      title: en.spaces['whole-home'].title,
      intro: en.spaces['whole-home'].intro,
      _status: 'published',
    }, 'en'),
  ])

  const [matOak, matWalnut, matBoucle] = await Promise.all([
    upsertBySlug('materials', 'white-oak', {
      title: en.materials['white-oak'].title,
      intro: en.materials['white-oak'].intro,
      facts: en.materials['white-oak'].facts,
      _status: 'published',
    }, 'en'),
    upsertBySlug('materials', 'black-walnut', {
      title: en.materials['black-walnut'].title,
      intro: en.materials['black-walnut'].intro,
      facts: en.materials['black-walnut'].facts,
      _status: 'published',
    }, 'en'),
    upsertBySlug('materials', 'oatmeal-boucle', {
      title: en.materials['oatmeal-boucle'].title,
      intro: en.materials['oatmeal-boucle'].intro,
      facts: en.materials['oatmeal-boucle'].facts,
      _status: 'published',
    }, 'en'),
  ])

  const [productSofa, productBed, productKit] = await Promise.all([
    upsertBySlug('products', 'modusofa', {
      title: en.products.modusofa.title,
      subtitle: en.products.modusofa.subtitle,
      priceInUSD: 69900,
      boxCount: 2,
      assemblyMinutes: 25,
      joineryType: en.products.modusofa.joineryType,
      material: matOak.id,
      spaces: [spaceLiving.id],
      description: richTextLocale('en', en.products.modusofa.description),
      specifications: en.products.modusofa.specifications,
      boxBreakdown: en.products.modusofa.boxBreakdown,
      priceInUSDEnabled: true,
      // ~0.2 cbm per flat box; DDP freight is charged by volume.
      packedVolumeCbm: 0.4,
      shippingWeightKg: 34,
      inventory: 100,
      _status: 'published',
    }, 'en'),
    upsertBySlug('products', 'snapbed', {
      title: en.products.snapbed.title,
      subtitle: en.products.snapbed.subtitle,
      priceInUSD: 80000,
      boxCount: 2,
      assemblyMinutes: 20,
      joineryType: en.products.snapbed.joineryType,
      material: matOak.id,
      spaces: [spaceBedroom.id],
      description: richTextLocale('en', en.products.snapbed.description),
      specifications: en.products.snapbed.specifications,
      boxBreakdown: en.products.snapbed.boxBreakdown,
      priceInUSDEnabled: true,
      // ~0.2 cbm per flat box; DDP freight is charged by volume.
      packedVolumeCbm: 0.4,
      shippingWeightKg: 34,
      inventory: 100,
      _status: 'published',
    }, 'en'),
    upsertBySlug('products', '1-bedroom-kit', {
      title: en.products['1-bedroom-kit'].title,
      subtitle: en.products['1-bedroom-kit'].subtitle,
      priceInUSD: 149900,
      boxCount: 6,
      assemblyMinutes: 60,
      joineryType: en.products['1-bedroom-kit'].joineryType,
      material: matOak.id,
      spaces: [spaceWholeHome.id, spaceLiving.id, spaceBedroom.id],
      description: richTextLocale('en', en.products['1-bedroom-kit'].description),
      specifications: en.products['1-bedroom-kit'].specifications,
      boxBreakdown: en.products['1-bedroom-kit'].boxBreakdown,
      priceInUSDEnabled: true,
      // ~0.2 cbm per flat box; DDP freight is charged by volume.
      packedVolumeCbm: 1.2,
      shippingWeightKg: 102,
      inventory: 100,
      _status: 'published',
    }, 'en'),
  ])

  // Add-ons the KitBuilder can put in a cart. They exist as products because the
  // checkout prices every line from the catalog — a surcharge that only lives in
  // the browser is displayed to the shopper but never charged.
  await Promise.all([
    upsertBySlug('products', 'king-bed-upgrade', {
      title: 'King Bed Upgrade',
      subtitle: 'Upgrades the SnapBed frame from Queen to King.',
      priceInUSD: 15000,
      boxCount: 1,
      assemblyMinutes: 0,
      material: matOak.id,
      spaces: [spaceBedroom.id],
      priceInUSDEnabled: true,
      // Only the volume a King frame adds over a Queen.
      packedVolumeCbm: 0.1,
      shippingWeightKg: 9,
      inventory: 100,
      _status: 'published',
    }, 'en'),
    upsertBySlug('products', 'mattress', {
      title: 'Foam Mattress',
      subtitle: 'Roll-packed foam mattress, sized to the selected bed.',
      priceInUSD: 39900,
      boxCount: 1,
      assemblyMinutes: 0,
      material: matOak.id,
      spaces: [spaceBedroom.id],
      priceInUSDEnabled: true,
      packedVolumeCbm: 0.35,
      shippingWeightKg: 24,
      inventory: 100,
      _status: 'published',
    }, 'en'),
  ])

  // Update space-to-product relationships
  await Promise.all([
    payload.update({
      collection: 'spaces',
      id: spaceLiving.id,
      data: { relatedProducts: [productSofa.id] } as never,
      overrideAccess: true,
    }),
    payload.update({
      collection: 'spaces',
      id: spaceBedroom.id,
      data: { relatedProducts: [productBed.id] } as never,
      overrideAccess: true,
    }),
    payload.update({
      collection: 'spaces',
      id: spaceWholeHome.id,
      data: { relatedProducts: [productKit.id, productSofa.id, productBed.id] } as never,
      overrideAccess: true,
    }),
  ])

  // 3. Seed All 7 Locales
  const locales = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru'] as const

  for (const locale of locales) {
    payload.logger.info(`Seeding localized content for locale: [${locale}]…`)
    const t = seedTranslations[locale]
    if (!t) {
      payload.logger.warn(`No translation data found for locale: ${locale}`)
      continue
    }

    // Spaces localization
    await Promise.all([
      upsertBySlug('spaces', 'living-room', {
        title: t.spaces['living-room'].title,
        intro: t.spaces['living-room'].intro,
        _status: 'published',
      }, locale),
      upsertBySlug('spaces', 'bedroom', {
        title: t.spaces.bedroom.title,
        intro: t.spaces.bedroom.intro,
        _status: 'published',
      }, locale),
      upsertBySlug('spaces', 'whole-home', {
        title: t.spaces['whole-home'].title,
        intro: t.spaces['whole-home'].intro,
        _status: 'published',
      }, locale),
    ])

    // Materials localization
    await Promise.all([
      upsertBySlug('materials', 'white-oak', {
        title: t.materials['white-oak'].title,
        intro: t.materials['white-oak'].intro,
        facts: t.materials['white-oak'].facts,
        _status: 'published',
      }, locale),
      upsertBySlug('materials', 'black-walnut', {
        title: t.materials['black-walnut'].title,
        intro: t.materials['black-walnut'].intro,
        facts: t.materials['black-walnut'].facts,
        _status: 'published',
      }, locale),
      upsertBySlug('materials', 'oatmeal-boucle', {
        title: t.materials['oatmeal-boucle'].title,
        intro: t.materials['oatmeal-boucle'].intro,
        facts: t.materials['oatmeal-boucle'].facts,
        _status: 'published',
      }, locale),
    ])

    // Products localization
    await Promise.all([
      upsertBySlug('products', 'modusofa', {
        title: t.products.modusofa.title,
        subtitle: t.products.modusofa.subtitle,
        joineryType: t.products.modusofa.joineryType,
        description: richTextLocale(locale, t.products.modusofa.description),
        specifications: t.products.modusofa.specifications,
        boxBreakdown: t.products.modusofa.boxBreakdown,
        _status: 'published',
      }, locale),
      upsertBySlug('products', 'snapbed', {
        title: t.products.snapbed.title,
        subtitle: t.products.snapbed.subtitle,
        joineryType: t.products.snapbed.joineryType,
        description: richTextLocale(locale, t.products.snapbed.description),
        specifications: t.products.snapbed.specifications,
        boxBreakdown: t.products.snapbed.boxBreakdown,
        _status: 'published',
      }, locale),
      upsertBySlug('products', '1-bedroom-kit', {
        title: t.products['1-bedroom-kit'].title,
        subtitle: t.products['1-bedroom-kit'].subtitle,
        joineryType: t.products['1-bedroom-kit'].joineryType,
        description: richTextLocale(locale, t.products['1-bedroom-kit'].description),
        specifications: t.products['1-bedroom-kit'].specifications,
        boxBreakdown: t.products['1-bedroom-kit'].boxBreakdown,
        _status: 'published',
      }, locale),
    ])

    // Globals localization
    await Promise.all([
      payload.updateGlobal({
        slug: 'announcement',
        data: {
          enabled: true,
          message: t.globals.announcement.message,
          linkLabel: t.globals.announcement.linkLabel,
          linkURL: '/1-bedroom-kit-builder',
        },
        locale: locale as never,
        overrideAccess: true,
      }),
      payload.updateGlobal({
        slug: 'homepage',
        data: {
          hero: {
            eyebrow: t.globals.homepage.hero.eyebrow,
            headline: t.globals.homepage.hero.headline,
            body: t.globals.homepage.hero.body,
          },
          ...(locale === 'en'
            ? { featuredProducts: [productKit.id, productSofa.id, productBed.id] }
            : {}),
        },
        locale: locale as never,
        overrideAccess: true,
      }),
      payload.updateGlobal({
        slug: 'site-settings',
        data: {
          descriptor: t.globals.siteSettings.descriptor,
          tagline: t.globals.siteSettings.tagline,
          ...(locale === 'en'
            ? {
                brandName: 'The Flat Set',
                defaultCurrency: 'USD',
                defaultLocale: 'en',
                contactEmail: 'hello@theflatset.com',
              }
            : {}),
        },
        locale: locale as never,
        overrideAccess: true,
      }),
    ])
  }

  await seedMedia(payload)

  payload.logger.info('The Flat Set multi-locale seed complete across all 7 locales!')
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
