import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: { read: () => true, update: adminOnly },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          defaultValue: 'JAPANDI WHOLE-HOME SYSTEM',
        },
        {
          name: 'headline',
          type: 'text',
          localized: true,
          defaultValue: 'Your entire home. Delivered in 6 flat boxes.',
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Solid FSC-certified oak and walnut furniture engineered for tool-free assembly, zero-hassle shipping, and lifetime modularity.',
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'trustPillars',
      type: 'array',
      fields: [
        { name: 'metric', type: 'text', required: true },
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'icon', type: 'text', defaultValue: 'check_circle' },
      ],
    },
    {
      name: 'comparisonMatrix',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          defaultValue: 'THE DIFFERENCE',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          defaultValue: 'Flat Set Engineering vs. Traditional Retail',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Why shipping flat boxes directly from modern workshops beats traditional furniture showrooms and complex flat-packs.',
        },
        {
          name: 'rows',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', localized: true, required: true },
            { name: 'flatSetValue', type: 'text', localized: true, required: true },
            { name: 'traditionalValue', type: 'text', localized: true, required: true },
          ],
        },
      ],
    },
    {
      name: 'bundlePromo',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          defaultValue: 'COMPLETE LIVING SYSTEM',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          defaultValue: 'Move-In 1-Bedroom Bundle',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
          defaultValue:
            'ModuSofa 3-Seater + SnapBed Frame + FlatCoffee Table + SnapSide Table + EntryRack. 6 boxes delivered together.',
        },
        {
          name: 'discountCallout',
          type: 'text',
          localized: true,
          defaultValue: 'Save $300 vs individual pieces',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          defaultValue: 'Configure Your Move-In Kit',
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', localized: true, required: true },
        { name: 'author', type: 'text', required: true },
        { name: 'apartmentType', type: 'text', localized: true },
        { name: 'location', type: 'text' },
        { name: 'rating', type: 'number', defaultValue: 5 },
      ],
    },
    { name: 'featuredProducts', type: 'relationship', hasMany: true, relationTo: 'products' },
    { name: 'featuredCollection', type: 'relationship', relationTo: 'product-collections' },
    { name: 'featuredPosts', type: 'relationship', hasMany: true, relationTo: 'journal-posts' },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('homepage')
      },
    ],
  },
  versions: {
    drafts: { autosave: true },
    max: 50,
  },
}
