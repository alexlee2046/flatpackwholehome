import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { ProductDetail } from '@/components/moduliv/ProductDetail'
import { getPayloadLocale } from '@/i18n/getPayloadLocale'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getMaterialsData, getProductData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return [
    { slug: 'modusofa' },
    { slug: 'snapbed' },
    { slug: '1-bedroom-kit' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getPayloadLocale()
  let title = 'ModuSofa 3-Seater'
  let description = 'Shop flat-pack furniture from The Flat Set. Tool-free assembly.'

  const product = await getProductData(slug, locale)
  if (product?.title) title = product.title
  if (product?.subtitle) description = product.subtitle

  return buildPageMetadata({
    description,
    locale,
    pathname: `/products/${slug}`,
    title,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const locale = await getPayloadLocale()
  const [doc, materials] = await Promise.all([
    getProductData(slug, locale),
    getMaterialsData(locale),
  ])
  if (!doc && slug !== 'modusofa') {
    notFound()
  }

  const productData = doc
    ? {
        assemblyMinutes: doc.assemblyMinutes,
        boxBreakdown: doc.boxBreakdown as any,
        boxCount: doc.boxCount,
        gallery: doc.gallery as any,
        id: doc.id,
        joineryType: doc.joineryType,
        meta: doc.meta as any,
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
      <ProductJsonLd
        currency="USD"
        description={productData.subtitle || 'Whole-home flat-pack furniture piece engineered for tool-free assembly.'}
        image="/assets/modusofa-product-detail-page/e38c85e68d.png"
        inStock={true}
        name={productData.title}
        price={productData.price}
        sku={`TFS-${slug.toUpperCase()}`}
        url={`/products/${slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/1-bedroom-kit-builder' },
          { name: productData.title, url: `/products/${slug}` },
        ]}
      />
      <SiteHeader locale={locale} />
      <ProductDetail materials={materials as any} product={productData} />
      <SiteFooter locale={locale} />
    </>
  )
}
