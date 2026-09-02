import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const JournalPosts: CollectionConfig = {
  slug: 'journal-posts',
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
    { name: 'deck', type: 'textarea', localized: true, required: true },
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'byline', type: 'text', defaultValue: 'ODSai' },
    { name: 'body', type: 'richText', localized: true },
    { name: 'relatedProducts', type: 'relationship', hasMany: true, relationTo: 'products' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
