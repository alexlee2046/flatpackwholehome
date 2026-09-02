import { adminOnly } from '@/access/adminOnly'
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
  fields: [
    { name: 'email', type: 'email', index: true, required: true, unique: true },
    { name: 'consent', type: 'checkbox', required: true },
    { name: 'source', type: 'text', defaultValue: 'storefront-footer' },
    { name: 'locale', type: 'text', defaultValue: 'en' },
  ],
}
