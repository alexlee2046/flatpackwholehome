import { adminOnly } from '@/access/adminOnly'
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
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', index: true, required: true },
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
