import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Spaces: CollectionConfig = {
  slug: 'spaces',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: { group: 'Editorial', useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField({ position: undefined }),
    { name: 'intro', type: 'textarea', localized: true, required: true },
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'buyingGuidance', type: 'richText', localized: true },
    { name: 'relatedProducts', type: 'relationship', hasMany: true, relationTo: 'products' },
    { name: 'relatedPosts', type: 'relationship', hasMany: true, relationTo: 'journal-posts' },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('spaces')
      },
    ],
  },
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
