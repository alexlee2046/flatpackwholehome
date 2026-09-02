import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'

export const Media: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'source',
      type: 'text',
      access: { read: adminOnlyFieldAccess, update: adminOnlyFieldAccess },
      admin: {
        description:
          'Original source, photographer, supplier reference, or generated-asset record.',
      },
    },
    {
      name: 'rights',
      type: 'textarea',
      access: { read: adminOnlyFieldAccess, update: adminOnlyFieldAccess },
    },
    {
      name: 'productIdentityConfidence',
      type: 'select',
      access: { read: adminOnlyFieldAccess, update: adminOnlyFieldAccess },
      defaultValue: 'editorial-only',
      options: [
        { label: 'Exact SKU reviewed', value: 'exact-reviewed' },
        { label: 'Collection-level concept', value: 'collection-concept' },
        { label: 'Editorial use only', value: 'editorial-only' },
      ],
    },
    {
      name: 'reviewState',
      type: 'select',
      access: { read: adminOnlyFieldAccess, update: adminOnlyFieldAccess },
      defaultValue: 'needs-review',
      options: [
        { label: 'Needs merchandising review', value: 'needs-review' },
        { label: 'Approved for storefront', value: 'approved' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ],
  upload: {
    staticDir: process.env.PAYLOAD_MEDIA_DIR
      ? path.resolve(process.env.PAYLOAD_MEDIA_DIR)
      : path.resolve(process.cwd(), 'public/media'),
  },
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
