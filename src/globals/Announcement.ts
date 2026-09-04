import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const Announcement: GlobalConfig = {
  slug: 'announcement',
  access: { read: () => true, update: adminOnly },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      name: 'message',
      type: 'text',
      localized: true,
      defaultValue: 'Material swatch checkout is currently unavailable. Contact our concierge for options.',
      required: true,
    },
    { name: 'linkLabel', type: 'text', localized: true, defaultValue: 'Explore 1-Bedroom Kit' },
    { name: 'linkURL', type: 'text', defaultValue: '/1-bedroom-kit-builder' },
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

