import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { ContactEnquiries } from '@/collections/ContactEnquiries'
import { DDPQuotes } from '@/collections/DDPQuotes'
import { JournalPosts } from '@/collections/JournalPosts'
import { Materials } from '@/collections/Materials'
import { Media } from '@/collections/Media'
import { NewsletterSignups } from '@/collections/NewsletterSignups'
import { Pages } from '@/collections/Pages'
import { FAQs } from '@/collections/FAQs'
import { ProductCollections } from '@/collections/ProductCollections'
import { ShippingZones } from '@/collections/ShippingZones'
import { Spaces } from '@/collections/Spaces'
import { TradeEnquiries } from '@/collections/TradeEnquiries'
import { Users } from '@/collections/Users'
import { Announcement } from '@/globals/Announcement'
import { DDPSettings } from '@/globals/DDPSettings'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { Homepage } from '@/globals/Homepage'
import { HowItWorks } from '@/globals/HowItWorks'
import { SiteSettings } from '@/globals/SiteSettings'
import { seedFlatpack } from '@/scripts/seed-flatpack'
import { seedInitialContent } from '@/utilities/seedContent'
import { seedI18nContent } from '@/utilities/seedI18nContent'
import { migrations } from './migrations'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const publicServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

export default buildConfig({
  admin: {
    autoLogin: isProduction
      ? false
      : {
          email: process.env.INITIAL_ADMIN_EMAIL || 'admin@theflatset.com',
          prefillOnly: true,
        },
    components: {
      graphics: {
        Icon: '@/components/admin/AdminIcon#AdminIcon',
        Logo: '@/components/admin/AdminLogo#AdminLogo',
      },
    },
    meta: {
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/assets/brand/favicon.svg',
        },
      ],
      titleSuffix: ' — The Flat Set Admin',
    },
    theme: 'light',
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    Categories,
    Media,
    ProductCollections,
    Spaces,
    Materials,
    JournalPosts,
    ShippingZones,
    DDPQuotes,
    TradeEnquiries,
    NewsletterSignups,
    ContactEnquiries,
    FAQs,
  ],
  cors: [publicServerURL, siteURL],
  csrf: [publicServerURL, siteURL],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://127.0.0.1:5432/flatpackwholehome',
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 15,
    },
    // Payload runs these at boot in production. The bundled migration is a
    // baseline — it CREATEs the whole schema — so it only applies to a database
    // that is empty. Pointing it at an existing deployment would fail on the
    // first CREATE TABLE and take the boot down with it, so it is opt-in per
    // environment: set PAYLOAD_RUN_MIGRATIONS=true on a fresh database, and
    // leave it unset for one that was built by dev push and still needs
    // baselining by hand.
    ...(process.env.PAYLOAD_RUN_MIGRATIONS === 'true' ? { prodMigrations: migrations } : {}),
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  endpoints: [],
  globals: [Header, Footer, SiteSettings, Announcement, Homepage, HowItWorks, DDPSettings],
  localization: {
    defaultLocale: 'en',
    defaultLocalePublishOption: 'active',
    fallback: true,
    locales: [
      { code: 'en', label: 'English' },
      { code: 'zh-CN', label: '简体中文' },
      { code: 'zh-TW', label: '繁體中文' },
      { code: 'de', label: 'Deutsch' },
      { code: 'ja', label: '日本語' },
      { code: 'ar', label: 'العربية', rtl: true },
      { code: 'ru', label: 'Русский' },
    ],
  },
  onInit: async (payload) => {
    try {
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@theflatset.com'

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
        // Never touch the password field for an existing admin — a process restart
        // must not revert credentials an operator has since changed.
        await payload.update({
          collection: 'users',
          id: existingAdmin.docs[0].id,
          data: {
            email: adminEmail,
            name: 'The Flat Set Admin',
            roles: ['admin'],
          },
          overrideAccess: true,
        })
        payload.logger.info(`[onInit] Admin account verified for: ${adminEmail}`)
      } else if (!process.env.INITIAL_ADMIN_PASSWORD) {
        // No fallback password exists by design: without one there is no code path
        // that can produce an admin with credentials anybody could read from the repo.
        payload.logger.error(
          `[onInit] INITIAL_ADMIN_PASSWORD is not set — admin user ${adminEmail} was NOT created. Set it and restart.`,
        )
      } else {
        await payload.create({
          collection: 'users',
          data: {
            email: adminEmail,
            name: 'The Flat Set Admin',
            password: process.env.INITIAL_ADMIN_PASSWORD,
            roles: ['admin'],
          },
          overrideAccess: true,
        })
        payload.logger.info(`[onInit] Admin user created: ${adminEmail}`)
      }

      // Automatically seed initial CMS content (FAQs, HowItWorks, Homepage blocks, Navigation)
      await seedInitialContent(payload)

      // The catalogue lives in a separate script because it also copies media,
      // which made it too heavy to run on every boot. On a database that has no
      // products at all it has to run, though: without it the storefront falls
      // back to static copy and checkout cannot resolve a single line item. This
      // is what makes pointing DATABASE_URL at an empty database a complete
      // provisioning step rather than one that leaves the store unsellable.
      const { totalDocs: productCount } = await payload.count({
        collection: 'products',
        overrideAccess: true,
      })
      if (productCount === 0) {
        payload.logger.info('[onInit] No products found — seeding the catalogue.')
        await seedFlatpack(payload)
      }

      // Automatically seed professional multilingual translations (zh-CN, zh-TW, de, ja, ar, ru)
      await seedI18nContent(payload)
    } catch (err: any) {
      payload.logger.warn(`[onInit] Initialization error: ${err.message}`)
    }
  },
  plugins,
  secret: (() => {
    const isProduction = process.env.NODE_ENV === 'production'
    const secret = process.env.PAYLOAD_SECRET
    if (isProduction && !secret) {
      throw new Error('FATAL: PAYLOAD_SECRET environment variable is required in production.')
    }
    return secret || 'flatpack_dev_secret_84f93c0a21d58e3b1c97ef04'
  })(),
  serverURL: publicServerURL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
