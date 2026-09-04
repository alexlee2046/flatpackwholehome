import { adminOnly } from '@/access/adminOnly'
import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

const RESERVED_COMMERCE_ENQUIRY_SUBJECT_PREFIXES = [
  '[Paid Swatch Box]',
  '[Swatch Box]',
  '[Swatch Fulfillment]',
] as const

/** Generic public enquiries must never impersonate a paid fulfillment record. */
export function isReservedCommerceEnquirySubject(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const subject = value.trimStart().toLowerCase()
  return RESERVED_COMMERCE_ENQUIRY_SUBJECT_PREFIXES.some((prefix) =>
    subject.startsWith(prefix.toLowerCase()),
  )
}

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
        if (operation !== 'create') return
        if (data?.website || isReservedCommerceEnquirySubject(data?.subject)) {
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
