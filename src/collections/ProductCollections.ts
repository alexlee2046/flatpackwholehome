import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'
import type { Access, CollectionConfig, Where } from 'payload'
import { slugField } from 'payload'

const adminOrFeatured: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) return true

  return {
    _status: { equals: 'published' },
    featured: { equals: true },
  } satisfies Where
}

export const ProductCollections: CollectionConfig = {
  slug: 'product-collections',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrFeatured,
    update: adminOnly,
  },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField({ position: undefined }),
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'story', type: 'textarea', localized: true, required: true },
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'products',
      type: 'relationship',
      hasMany: true,
      relationTo: 'products',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 50,
  },
}
