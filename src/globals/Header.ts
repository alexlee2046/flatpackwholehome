import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'showAnnouncement',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Toggle display of the top announcement banner across all pages',
      },
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
        {
          name: 'badge',
          type: 'text',
          localized: true,
        },
      ],
      maxRows: 8,
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
