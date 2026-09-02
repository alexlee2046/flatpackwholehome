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
import { SiteSettings } from '@/globals/SiteSettings'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const publicServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'admin@theflatset.com',
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
  ],
  cors: [publicServerURL, siteURL],
  csrf: [publicServerURL, siteURL],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://127.0.0.1:5432/flatpackwholehome',
    },
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
  globals: [Header, Footer, SiteSettings, Announcement, Homepage, DDPSettings],
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
        payload.logger.info(`[onInit] Admin credentials verified for: ${adminEmail}`)
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
        payload.logger.info(`[onInit] Admin user created: ${adminEmail}`)
      }

      const existingMedia = await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })

      if (existingMedia.totalDocs === 0) {
        payload.logger.info('[onInit] Media collection empty, auto-seeding media records...')
        const { seedMedia } = await import('./scripts/seed-media')
        await seedMedia(payload)
        payload.logger.info('[onInit] Media auto-seeding complete!')
      }
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
