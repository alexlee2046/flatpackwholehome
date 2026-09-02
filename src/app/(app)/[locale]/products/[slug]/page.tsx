import { ModulivFooter } from '@/components/moduliv/ModulivFooter'
import { ModulivHeader } from '@/components/moduliv/ModulivHeader'
import { ProductDetail } from '@/components/moduliv/ProductDetail'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import React from 'react'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getPayloadLocale()
  let title = 'ModuSofa 3-Seater'

  try {
    const payload = await getPayload({ config: configPromise })
    const productResult = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 1,
      locale,
      overrideAccess: true,
      where: {
        slug: { equals: slug },
      },
    })
    const product = productResult.docs[0]
    if (product?.title) title = product.title
  } catch {
    // fallback
  }

  return buildPageMetadata({
    description: `Shop the ${title} from The Flat Set. Tool-free assembly flat-pack furniture.`,
    locale,
    pathname: `/products/${slug}`,
    title,
  })
}

export default async function ProductPage({ params }: Props) {
  await connection()
  const { slug } = await params
  const locale = await getPayloadLocale()
  let doc: any = null

  try {
    const payload = await getPayload({ config: configPromise })
    const productResult = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 1,
      locale,
      overrideAccess: true,
      where: {
        slug: { equals: slug },
      },
    })
    doc = productResult.docs[0]
  } catch {
    // fallback
  }
  if (!doc && slug !== 'modusofa') {
    notFound()
  }

  const productData = doc
    ? {
        assemblyMinutes: doc.assemblyMinutes,
        boxBreakdown: doc.boxBreakdown as any,
        boxCount: doc.boxCount,
        id: doc.id,
        joineryType: doc.joineryType,
        price: doc.priceInUSD || 699,
        slug: doc.slug,
        specifications: doc.specifications,
        subtitle: doc.subtitle,
        title: doc.title,
      }
    : {
        assemblyMinutes: 15,
        boxCount: 2,
        joineryType: 'Tool-Free Japandi Mortise & Tenon',
        price: 699,
        slug: 'modusofa',
        subtitle: 'Tool-free Japandi sofa engineered for deep comfort and tool-free disassembly.',
        title: 'ModuSofa 3-Seater',
      }

  return (
    <>
      <ModulivHeader />
      <ProductDetail product={productData} />
      <ModulivFooter />
    </>
  )
}
