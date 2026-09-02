import { adminOnly } from '@/access/adminOnly'
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: adminOnly },
  fields: [
    { name: 'brandName', type: 'text', defaultValue: 'The Flat Set', required: true },
    {
      name: 'descriptor',
      type: 'text',
      localized: true,
      defaultValue: 'Whole-home flat-pack Japandi furniture delivered in 6 flat boxes worldwide.',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      defaultValue: 'Your entire home. Delivered in 6 flat boxes.',
      required: true,
    },
    { name: 'defaultLocale', type: 'text', defaultValue: 'en', required: true },
    {
      name: 'defaultCurrency',
      type: 'select',
      defaultValue: 'USD',
      options: ['USD', 'EUR', 'GBP', 'CNY', 'CAD', 'AUD'],
    },
    { name: 'contactEmail', type: 'email', defaultValue: 'hello@theflatset.com' },
  ],
  versions: {
    drafts: { autosave: true },
    max: 50,
  },
}
