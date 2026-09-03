import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import type { CollectionConfig } from 'payload'

/**
 * NOT wired to checkout pricing. DDP freight/duty rates are hardcoded in
 * `src/lib/commerce/ddp.ts` (DDP_ZONES) — that is the single source of truth; editing
 * records here has zero effect on quotes (confirmed zero business-logic references, no
 * seed data). This collection is intentionally locked read-only and hidden from the admin
 * nav so it can't be mistaken for a working "edit shipping rates" control. Deleting it
 * outright would also require removing its registration from `payload.config.ts`, which is
 * outside this file's ownership for this change — see task notes.
 */
export const ShippingZones: CollectionConfig = {
  slug: 'shipping-zones',
  access: {
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: () => false,
  },
  admin: { group: 'Commerce', hidden: true, useAsTitle: 'countryName' },
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
