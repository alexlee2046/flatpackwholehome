import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import type { CollectionConfig } from 'payload'

export const ShippingZones: CollectionConfig = {
  slug: 'shipping-zones',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: { group: 'Commerce', useAsTitle: 'countryName' },
  fields: [
    { name: 'countryName', type: 'text', required: true },
    { name: 'countryCode', type: 'text', index: true, required: true, unique: true },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      name: 'quoteMode',
      type: 'select',
      defaultValue: 'tailored',
      options: [
        { label: 'Instant provider quote', value: 'instant' },
        { label: 'Tailored review', value: 'tailored' },
        { label: 'Unsupported', value: 'unsupported' },
      ],
      required: true,
    },
    {
      name: 'currencies',
      type: 'select',
      hasMany: true,
      options: ['USD', 'EUR', 'GBP'],
      required: true,
    },
    { name: 'serviceLevel', type: 'text' },
    { name: 'exclusions', type: 'textarea' },
    {
      name: 'providerConfiguration',
      type: 'json',
      access: { read: adminOnlyFieldAccess, update: adminOnlyFieldAccess },
    },
  ],
}
