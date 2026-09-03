import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const DDPSettings: GlobalConfig = {
  slug: 'ddp-settings',
  access: { read: () => true, update: adminOnly },
  fields: [
    {
      name: 'definition',
      type: 'textarea',
      localized: true,
      defaultValue:
        'Delivered Duty Paid (DDP) means The Flat Set checkout includes all international freight, customs clearance, import duties, and applicable local taxes. Zero surprise fees upon doorstep delivery.',
      required: true,
    },
    { name: 'quoteExpiryHours', type: 'number', defaultValue: 72 },
    { name: 'supportEmail', type: 'email', defaultValue: 'concierge@theflatset.com' },
    {
      name: 'fallbackMode',
      type: 'select',
      defaultValue: 'tailored',
      options: [
        { label: 'Tailored review', value: 'tailored' },
        { label: 'Unsupported', value: 'unsupported' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('ddp-settings')
      },
    ],
  },
}
