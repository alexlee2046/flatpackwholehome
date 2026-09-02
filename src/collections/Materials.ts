import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
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
    {
      name: 'facts',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'body', type: 'textarea', localized: true, required: true },
      ],
    },
    { name: 'body', type: 'richText', localized: true },
    {
      name: 'sourceReviewStatus',
      type: 'select',
      defaultValue: 'reviewed',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Source reviewed', value: 'reviewed' },
        { label: 'Legal review required', value: 'legal-review' },
      ],
    },
  ],
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
