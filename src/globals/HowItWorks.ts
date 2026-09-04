import { adminOnly } from '@/access/adminOnly'
import { revalidateStorefrontTag } from '@/utilities/revalidate'
import type { GlobalConfig } from 'payload'

export const HowItWorks: GlobalConfig = {
  slug: 'how-it-works',
  access: {
    read: () => true,
    update: adminOnly,
  },
  admin: {
    group: 'Editorial',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          defaultValue: 'CRAFT & LOGISTICS',
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          defaultValue: 'From Workshop to Living Room in 6 Flat Boxes.',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
          defaultValue:
            'Production and delivery details are confirmed for supported destinations in a destination-specific quote.',
        },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        {
          name: 'stepNumber',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          required: true,
        },
        {
          name: 'badge',
          type: 'text',
          localized: true,
        },
        {
          name: 'metric',
          type: 'text',
          admin: {
            description: 'Key quantifiable metric (e.g. "48 Hrs", "6 Boxes", "15 Min")',
          },
        },
        {
          name: 'icon',
          type: 'text',
          defaultValue: 'check_circle',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateStorefrontTag('how-it-works')
      },
    ],
  },
  versions: {
    drafts: { autosave: true },
    max: 50,
  },
}
