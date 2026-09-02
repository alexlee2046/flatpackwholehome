import { adminOnly } from '@/access/adminOnly'
import type { GlobalConfig } from 'payload'

export const DDPSettings: GlobalConfig = {
  slug: 'ddp-settings',
  access: { read: () => true, update: adminOnly },
  fields: [
    {
      name: 'definition',
      type: 'textarea',
      defaultValue:
        'Delivered Duty Paid means ODSai checkout brings together the furniture, international freight, import duty, and applicable taxes for a supported destination.',
      required: true,
    },
    { name: 'quoteExpiryHours', type: 'number', defaultValue: 72 },
    { name: 'supportEmail', type: 'email' },
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
}
