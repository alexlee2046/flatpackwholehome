import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, Where } from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInUSD: true,
    inventory: true,
    meta: true,
    subtitle: true,
    productCollection: true,
    material: true,
    madeToOrder: true,
    packedVolumeCbm: true,
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes
                        .map((item: unknown) => {
                          if (item && typeof item === 'object' && 'id' in item) {
                            return (item as { id: DefaultDocumentIDType }).id
                          }
                          if (typeof item === 'number' || typeof item === 'string') return item
                          return null
                        })
                        .filter(
                          (id: DefaultDocumentIDType | null): id is DefaultDocumentIDType =>
                            id !== null,
                        )

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            ...defaultCollection.fields,
            {
              name: 'subtitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Short editorial line shown beneath the product name.',
              },
            },
            {
              name: 'supplierSKU',
              type: 'text',
              access: {
                read: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              admin: {
                description: 'Internal supplier reference. Never exposed on the storefront.',
              },
            },
            {
              name: 'sourceCatalogSlug',
              type: 'text',
              access: {
                read: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              admin: {
                description: 'Stable internal import key from the source catalogue.',
              },
              index: true,
              unique: true,
            },
            {
              name: 'catalogReviewNote',
              type: 'textarea',
              access: {
                read: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              admin: {
                description: 'Internal specification or merchandising review note.',
              },
            },
            {
              name: 'madeToOrder',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'packedVolumeCbm',
              type: 'number',
              admin: {
                description: 'Packed cubic metres used for destination-specific DDP pricing.',
              },
              min: 0,
            },
            {
              name: 'productCollection',
              type: 'relationship',
              relationTo: 'product-collections',
            },
            {
              name: 'spaces',
              type: 'relationship',
              hasMany: true,
              relationTo: 'spaces',
            },
            {
              name: 'material',
              type: 'relationship',
              relationTo: 'materials',
            },
            {
              name: 'specifications',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', localized: true, required: true },
                { name: 'value', type: 'text', localized: true, required: true },
              ],
            },
            {
              name: 'construction',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'careSummary',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'deliveryNote',
              type: 'textarea',
              localized: true,
              defaultValue:
                'Made to order. DDP freight, duties, and taxes are calculated for supported destinations before payment.',
            },
            {
              name: 'boxCount',
              type: 'number',
              defaultValue: 1,
              admin: {
                description: 'Total number of flat packaging boxes for this item or bundle.',
              },
            },
            {
              name: 'assemblyMinutes',
              type: 'number',
              defaultValue: 45,
              admin: {
                description: 'Estimated tool-free assembly duration in minutes.',
              },
            },
            {
              name: 'joineryType',
              type: 'text',
              defaultValue: 'Tool-Free Japandi Mortise & Tenon',
              localized: true,
            },
            {
              name: 'boxBreakdown',
              type: 'array',
              fields: [
                { name: 'boxId', type: 'text', required: true },
                { name: 'title', type: 'text', localized: true, required: true },
                { name: 'dimensions', type: 'text' },
                { name: 'weight', type: 'text' },
                { name: 'description', type: 'text', localized: true },
              ],
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
          label: 'Product Details',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
})
