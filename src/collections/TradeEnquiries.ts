import { adminOnly } from '@/access/adminOnly'
import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

export const TradeEnquiries: CollectionConfig = {
  slug: 'trade-enquiries',
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
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', index: true, required: true },
    // honeypot: real users never fill this, bots often do
    { name: 'website', type: 'text', admin: { hidden: true } },
    { name: 'company', type: 'text' },
    { name: 'projectType', type: 'text', required: true },
    { name: 'destination', type: 'text', required: true },
    { name: 'targetDate', type: 'date' },
    { name: 'estimatedQuantities', type: 'text' },
    { name: 'productsOrCollections', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    { name: 'consent', type: 'checkbox', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'replied', 'closed'],
      required: true,
    },
  ],
}
