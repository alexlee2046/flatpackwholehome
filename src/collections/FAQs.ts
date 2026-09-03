import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: 'Editorial',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order', 'isFeatured', 'updatedAt'],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General / Overview', value: 'general' },
        { label: 'Craft & Assembly', value: 'assembly' },
        { label: 'DDP Shipping & Delivery', value: 'shipping' },
        { label: 'Materials & Sustainability', value: 'materials' },
        { label: '100-Night Trial & Returns', value: 'returns' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower number appears first',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show in featured lists or homepage search',
      },
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('faqs')
      },
    ],
  },
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
