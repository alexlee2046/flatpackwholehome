import { adminOnly } from '@/access/adminOnly'
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
      defaultValue: 'Free Swatch Box with $50 Voucher — Worldwide DDP Delivery & Duties Included',
      required: true,
    },
    { name: 'linkLabel', type: 'text', localized: true, defaultValue: 'Explore 1-Bedroom Kit' },
    { name: 'linkURL', type: 'text', defaultValue: '/1-bedroom-kit-builder' },
  ],
  versions: {
    drafts: { autosave: true },
    max: 50,
  },
}
