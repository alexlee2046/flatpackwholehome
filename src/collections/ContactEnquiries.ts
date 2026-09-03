import { adminOnly } from '@/access/adminOnly'
import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

export const ContactEnquiries: CollectionConfig = {
  slug: 'contact-enquiries',
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
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    // honeypot: real users never fill this, bots often do
    { name: 'website', type: 'text', admin: { hidden: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'replied', 'closed'],
      required: true,
    },
  ],
}
