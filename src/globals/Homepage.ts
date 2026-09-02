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

