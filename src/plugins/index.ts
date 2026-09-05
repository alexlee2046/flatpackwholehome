import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { s3Storage } from '@payloadcms/storage-s3'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { stripeDDPAdapter } from '@/lib/commerce/stripeDDPAdapter'
import { ODSAI_DESTINATIONS } from '@/lib/commerce/ddp'
import { readStripeServerConfig } from '@/lib/commerce/stripeConfig'
import { getLocalePathname } from '@/i18n/metadata'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'

const stripeConfig = readStripeServerConfig()

const checkoutLocaleField = () => ({
  name: 'checkoutLocale',
  type: 'select' as const,
  defaultValue: defaultLocale,
  options: locales.map((locale) => ({ label: locale, value: locale })),
  required: true,
})

const voucherFields = () => [
  { name: 'voucherCode', type: 'text' as const },
  { name: 'voucherDiscountInUSD', type: 'number' as const },
]

const ddpFields = () => [
  { name: 'shippingAmountInUSD', type: 'number' as const },
  { name: 'freightInUSD', type: 'number' as const },
  { name: 'importChargesInUSD', type: 'number' as const },
  { name: 'shippingZone', type: 'text' as const },
  { name: 'deliveryEstimateMinDays', type: 'number' as const },
  { name: 'deliveryEstimateMaxDays', type: 'number' as const },
  { name: 'ddpPricingVersion', type: 'text' as const },
]

const transactionShippingAddressField = () => ({
  name: 'shippingAddress',
  type: 'group' as const,
  fields: [
    { name: 'title', type: 'text' as const },
    { name: 'firstName', type: 'text' as const },
    { name: 'lastName', type: 'text' as const },
    { name: 'company', type: 'text' as const },
    { name: 'addressLine1', type: 'text' as const },
    { name: 'addressLine2', type: 'text' as const },
    { name: 'city', type: 'text' as const },
    { name: 'state', type: 'text' as const },
    { name: 'postalCode', type: 'text' as const },
    { name: 'country', type: 'text' as const },
    { name: 'phone', type: 'text' as const },
  ],
})

// Keep Payload's accepted address countries exactly aligned with the quote
// endpoint and cart selector. An unsupported address must not get as far as a
// payment route.
const payloadAddressCountries = ODSAI_DESTINATIONS.map(({ label, value }) => ({ label, value }))

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | The Flat Set` : 'The Flat Set — Your Entire Home. Delivered in 6 Flat Boxes.'
}

const generateURL: GenerateURL<Product | Page> = ({ collectionSlug, doc, locale }) => {
  const url = getServerSideURL()

  if (!doc?.slug) return url

  const resolvedLocale = locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : defaultLocale
  const pathname = collectionSlug === 'products' ? `/products/${doc.slug}` : `/${doc.slug}`

  return new URL(getLocalePathname(resolvedLocale, pathname), url).toString()
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    // Checkout creates and verifies a fresh guest cart immediately before
    // payment. The cart secret is returned only on creation and is passed back
    // to the plugin's guest-cart access checks.
    carts: { allowGuestCarts: true },
    addresses: {
      // Preserve every previously accepted address while adding all ODSai checkout destinations.
      supportedCountries: payloadAddressCountries,
    },
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          defaultColumns: ['id', 'status', 'amount', 'shippingZone', 'createdAt'],
        },
        fields: [
          ...defaultCollection.fields,
          checkoutLocaleField(),
          ...ddpFields(),
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    payments: {
      // Keep the Stripe transaction schema and routes deterministic even when
      // checkout is disabled or credentials are absent. The adapter itself
      // refuses to initialize Stripe until readStripeServerConfig is complete;
      // this avoids a schema/type split while preserving fail-closed checkout.
      paymentMethods: [
        stripeDDPAdapter({
          groupOverrides: {
            fields: ({ defaultFields }) =>
              defaultFields.map((field) =>
                field.type === 'text' && field.name === 'paymentIntentID'
                  ? { ...field, index: true, unique: true }
                  : field,
              ),
          },
          secretKey: stripeConfig.secretKey,
          publishableKey: stripeConfig.publishableKey,
          webhookSecret: stripeConfig.webhookSecret,
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantOptionsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          fields: defaultCollection.fields.map((field) =>
            'name' in field && field.name === 'label' ? { ...field, localized: true } : field,
          ),
        }),
        variantTypesCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          fields: defaultCollection.fields.map((field) =>
            'name' in field && field.name === 'label' ? { ...field, localized: true } : field,
          ),
        }),
      },
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          checkoutLocaleField(),
          transactionShippingAddressField(),
          ...ddpFields(),
          ...voucherFields(),
        ],
      }),
    },
  }),
  // S3-backed media storage (workspace-minio bucket flatpackwholehome). Only
  // enabled when S3_BUCKET is set, so local dev and the Dockerfile's
  // no-env build keep writing to public/media on local disk.
  ...(process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || 'us-east-1',
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
          },
        }),
      ]
    : []),
]
