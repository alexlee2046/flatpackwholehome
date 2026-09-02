import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

export const DDPQuotes: CollectionConfig = {
  slug: 'ddp-quotes',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: { group: 'Commerce', useAsTitle: 'requestID' },
  fields: [
    { name: 'requestID', type: 'text', index: true, required: true, unique: true },
    { name: 'countryCode', type: 'text', index: true, required: true },
    { name: 'postcode', type: 'text', required: true },
    { name: 'currency', type: 'select', defaultValue: 'USD', options: ['USD', 'EUR', 'GBP'] },
    { name: 'cartFingerprint', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Needs review', value: 'needs-review' },
        { label: 'Ready', value: 'ready' },
        { label: 'Unsupported', value: 'unsupported' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'breakdown',
      type: 'group',
      fields: [
        { name: 'product', type: 'number' },
        { name: 'freight', type: 'number' },
        { name: 'duty', type: 'number' },
        { name: 'tax', type: 'number' },
        { name: 'accessCharges', type: 'number' },
        { name: 'total', type: 'number' },
      ],
    },
    { name: 'serviceLevel', type: 'text' },
    { name: 'providerReference', type: 'text' },
    { name: 'schemaVersion', type: 'number', defaultValue: 1, required: true },
    { name: 'expiresAt', type: 'date' },
  ],
  timestamps: true,
}
