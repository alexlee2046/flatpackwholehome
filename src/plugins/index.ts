import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { stripeDDPAdapter } from '@/lib/commerce/stripeDDPAdapter'
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

const payloadAddressCountries = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Austria', value: 'AT' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Bulgaria', value: 'BG' },
  { label: 'Cyprus', value: 'CY' },
  { label: 'Czech Republic', value: 'CZ' },
  { label: 'Denmark', value: 'DK' },
  { label: 'Estonia', value: 'EE' },
  { label: 'Finland', value: 'FI' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Greece', value: 'GR' },
  { label: 'Hong Kong', value: 'HK' },
  { label: 'Hungary', value: 'HU' },
  { label: 'India', value: 'IN' },
  { label: 'Ireland', value: 'IE' },
  { label: 'Italy', value: 'IT' },
  { label: 'Japan', value: 'JP' },
  { label: 'Latvia', value: 'LV' },
  { label: 'Lithuania', value: 'LT' },
  { label: 'Luxembourg', value: 'LU' },
  { label: 'Malaysia', value: 'MY' },
  { label: 'Malta', value: 'MT' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Norway', value: 'NO' },
  { label: 'Poland', value: 'PL' },
  { label: 'Portugal', value: 'PT' },
  { label: 'Romania', value: 'RO' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Slovakia', value: 'SK' },
  { label: 'Slovenia', value: 'SI' },
  { label: 'Spain', value: 'ES' },
  { label: 'Sweden', value: 'SE' },
  { label: 'Switzerland', value: 'CH' },
  { label: 'China', value: 'CN' },
  { label: 'United Arab Emirates', value: 'AE' },
]

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
        ],
      }),
    },
  }),
]
