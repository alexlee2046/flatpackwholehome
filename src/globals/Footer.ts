import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'brandSlogan',
      type: 'text',
      localized: true,
      defaultValue: '6 Boxes · 60 Minutes · 0 Screws · DDP Duties Included',
    },
    {
      name: 'copyrightText',
      type: 'text',
      localized: true,
      defaultValue: 'The Flat Set. All rights reserved.',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      maxRows: 12,
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      maxRows: 6,
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('layout')
      },
    ],
  },
  versions: {
    drafts: { autosave: true },
    max: 50,
  },
}
