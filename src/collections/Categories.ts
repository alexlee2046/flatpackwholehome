import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      position: undefined,
    }),
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
