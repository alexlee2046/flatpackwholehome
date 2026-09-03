import { adminOnly } from '@/access/adminOnly'
import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

export const NewsletterSignups: CollectionConfig = {
  slug: 'newsletter-signups',
  access: {
    create: () => true,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: { group: 'Leads', useAsTitle: 'email' },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.website) {
          throw new APIError('Invalid submission.', 400)
        }
      },
    ],
  },
  fields: [
    { name: 'email', type: 'email', index: true, required: true, unique: true },
    { name: 'consent', type: 'checkbox', required: true },
    { name: 'source', type: 'text', defaultValue: 'storefront-footer' },
    { name: 'locale', type: 'text', defaultValue: 'en' },
    // honeypot: real users never fill this, bots often do
    { name: 'website', type: 'text', admin: { hidden: true } },
  ],
}
