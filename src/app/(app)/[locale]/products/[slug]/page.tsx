import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo/JsonLd'
import { SiteFooter } from '@/components/moduliv/SiteFooter'
import { SiteHeader } from '@/components/moduliv/SiteHeader'
import { ProductDetail } from '@/components/moduliv/ProductDetail'
import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { buildPageMetadata } from '@/i18n/pageMetadata'
import { getMaterialsData, getProductData } from '@/lib/data/storefront'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const FALLBACK_PRODUCTS: Record<
  string,
  {
    assemblyMinutes: number
    boxBreakdown: Array<{
      boxId: string
      description: string
      dimensions: string
      title: string
      weight: string
    }>
    boxCount: number
    gallery: Array<{ image: { alt: string; url: string } }>
    id: string
    joineryType: string
    price: number
    slug: string
    specifications: Array<{ label: string; value: string }>
    subtitle: string
    title: string
  }
> = {
  modusofa: {
    assemblyMinutes: 15,
    boxBreakdown: [
      {
        boxId: 'b1',
        description: 'Solid oak perimeter rails and center support.',
        dimensions: '115 × 50 × 20 cm',
        title: 'Box 1: Oak Base & Joinery Rails',
        weight: '24 kg',
      },
      {
        boxId: 'b2',
        description: 'Down-blend seat cushions and modular backrests.',
        dimensions: '100 × 70 × 35 cm',
        title: 'Box 2: Cushions & Backrest Supports',
        weight: '18 kg',
      },
    ],
    boxCount: 2,
    gallery: [
      { image: { alt: 'ModuSofa 3-Seater', url: '/assets/modusofa-product-detail-page/e38c85e68d.png' } },
      { image: { alt: 'ModuSofa packaging and room split', url: '/screenshots/asset-boxes-to-room-split.png' } },
      { image: { alt: 'Snap-joint connector shown exploded between four oak beams', url: '/assets/modusofa-product-detail-page/b354f66f79.png' } },
      { image: { alt: 'ModuSofa upholstery and modular seam detail', url: '/assets/modusofa-product-detail-page/d3a3e93b3d.png' } },
    ],
    id: 'fallback-modusofa',
    joineryType: 'Tool-Free Japandi Mortise & Tenon',
    price: 69900,
    slug: 'modusofa',
    specifications: [
      { label: 'Dimensions', value: '220 cm W × 90 cm D × 78 cm H' },
      { label: 'Frame', value: 'Solid FSC European White Oak' },
      { label: 'Cushions', value: 'High-resilience foam core + down-blend wrap' },
      { label: 'Box Count', value: '2 Flat Boxes (Fits standard elevator)' },
    ],
    subtitle: 'Tool-free Japandi sofa engineered for deep comfort and tool-free disassembly.',
    title: 'ModuSofa 3-Seater',
  },
  snapbed: {
    assemblyMinutes: 20,
    boxBreakdown: [
      {
        boxId: 'b5',
        description: 'Long structural perimeter rails with embedded gravity locks.',
        dimensions: '215 × 25 × 18 cm',
        title: 'Box 5: Bed Frame Side Rails & Hardware',
        weight: '22 kg',
      },
      {
        boxId: 'b6',
        description: 'FSC birch roll-out slats and optional low headboard.',
        dimensions: '165 × 40 × 15 cm',
        title: 'Box 6: Slats & Headboard System',
        weight: '20 kg',
      },
    ],
    boxCount: 2,
    gallery: [
      { image: { alt: 'The SnapBed Queen', url: '/assets/1-bedroom-kit-builder/da48e93272.png' } },
      { image: { alt: 'The SnapBed frame detail', url: '/assets/1-bedroom-kit-builder/d4a4793ee2.png' } },
      { image: { alt: 'The SnapBed wood grain', url: '/assets/1-bedroom-kit-builder/d66ddc7ba1.png' } },
      { image: { alt: 'The SnapBed bedroom setting', url: '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png' } },
    ],
    id: 'fallback-snapbed',
    joineryType: 'Zero-Screw Gravity Lock',
    price: 89900,
    slug: 'snapbed',
    specifications: [
      { label: 'Dimensions (Queen)', value: '160 cm W × 210 cm L × 28 cm H' },
      { label: 'Frame', value: 'Solid FSC European White Oak' },
      { label: 'Slats', value: 'FSC Birch roll-out system (Zero Creak)' },
      { label: 'Box Count', value: '2 Flat Boxes' },
    ],
    subtitle: 'Solid oak platform bed frame with floating nightstand compatibility.',
    title: 'The SnapBed Queen',
  },
  '1-bedroom-kit': {
    assemblyMinutes: 60,
    boxBreakdown: [
      {
        boxId: 'b1',
        description: 'Living set base framework',
        dimensions: '115 × 50 × 20 cm',
        title: 'Box 1: ModuSofa Base Frame',
        weight: '24 kg',
      },
      {
        boxId: 'b2',
        description: 'Bouclé cushions and back pillows',
        dimensions: '100 × 70 × 35 cm',
        title: 'Box 2: ModuSofa Cushions & Backs',
        weight: '18 kg',
      },
      {
        boxId: 'b3',
        description: 'Solid oak organic coffee table',
        dimensions: '90 × 60 × 12 cm',
        title: 'Box 3: Low Coffee Table',
        weight: '14 kg',
      },
      {
        boxId: 'b4',
        description: 'Dual-purpose solid wood bench',
        dimensions: '120 × 35 × 15 cm',
        title: 'Box 4: Dining / Work Bench',
        weight: '16 kg',
      },
      {
        boxId: 'b5',
        description: 'Queen platform perimeter frame',
        dimensions: '215 × 25 × 18 cm',
        title: 'Box 5: SnapBed Frame Rails',
        weight: '22 kg',
      },
      {
        boxId: 'b6',
        description: 'Birch slats + two floating nightstands',
        dimensions: '165 × 40 × 15 cm',
        title: 'Box 6: SnapBed Slats & Nightstands',
        weight: '20 kg',
      },
    ],
    boxCount: 6,
    gallery: [
      { image: { alt: 'Move-In 1-Bedroom Kit', url: '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png' } },
      { image: { alt: 'ModuSofa in kit', url: '/assets/modusofa-product-detail-page/e38c85e68d.png' } },
      { image: { alt: 'The SnapBed in kit', url: '/assets/1-bedroom-kit-builder/da48e93272.png' } },
      { image: { alt: 'All 6 boxes delivered', url: '/screenshots/asset-boxes-to-room-split.png' } },
    ],
    id: 'fallback-1-bedroom-kit',
    joineryType: 'Full Japandi Tool-Free System',
    price: 159800,
    slug: '1-bedroom-kit',
    specifications: [
      { label: 'Coverage', value: 'Living, Bedroom, & Dining essentials' },
      { label: 'Total Boxes', value: '6 Boxes (DDP Delivered to Room of Choice)' },
      { label: 'Bundle Savings', value: '$350 vs buying pieces separately' },
      { label: 'Assembly Time', value: '60 minutes total (Zero tools required)' },
    ],
    subtitle: 'Complete whole-home furniture solution: Living, Dining, and Bedroom in 6 flat boxes.',
    title: 'Move-In 1-Bedroom Kit',
  },
}

export async function generateStaticParams() {
  const slugs = ['modusofa', 'snapbed', '1-bedroom-kit']
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)

  const fallback = FALLBACK_PRODUCTS[slug]
  let title = fallback?.title || 'ModuSofa 3-Seater'
  let description = fallback?.subtitle || 'Shop flat-pack furniture from The Flat Set. Tool-free assembly.'

  const product = await getProductData(slug, locale)
  if (product?.title) title = product.title
  if (product?.subtitle) description = product.subtitle

  const defaultProductImage = slug === 'snapbed'
    ? '/assets/1-bedroom-kit-builder/da48e93272.png'
    : slug === '1-bedroom-kit'
      ? '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png'
      : '/assets/modusofa-product-detail-page/e38c85e68d.png'

  const productImage = (product?.gallery as any)?.[0]?.image?.url || (fallback?.gallery as any)?.[0]?.image?.url || defaultProductImage

  return buildPageMetadata({
    description,
    image: productImage,
    locale,
    pathname: `/products/${slug}`,
    title,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale: rawLocale } = await params
  const locale = (hasLocale(locales, rawLocale) ? rawLocale : defaultLocale) as AppLocale
  setRequestLocale(locale)
  const [doc, materials, tCommon, tPdp] = await Promise.all([
    getProductData(slug, locale),
    getMaterialsData(locale),
    getTranslations({ locale, namespace: 'Common' }),
    getTranslations({ locale, namespace: 'PDP' }),
  ])

  const fallback = FALLBACK_PRODUCTS[slug]
  if (!doc && !fallback) {
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
        price: doc.priceInUSD || fallback?.price || 69900,
        slug: doc.slug,
        specifications: doc.specifications || fallback?.specifications,
        subtitle: doc.subtitle || fallback?.subtitle,
        title: doc.title || fallback?.title,
      }
    : fallback

  const categoryName = slug === 'modusofa'
    ? tPdp('categorySeating')
    : slug === 'snapbed'
      ? tPdp('categoryBedroom')
      : tPdp('categoryWholeHome')

  const defaultProductImage = slug === 'snapbed'
    ? '/assets/1-bedroom-kit-builder/da48e93272.png'
    : slug === '1-bedroom-kit'
      ? '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png'
      : '/assets/modusofa-product-detail-page/e38c85e68d.png'

  const productImage = (productData.gallery as any)?.[0]?.image?.url || defaultProductImage
  const reviewCount = slug === 'modusofa' ? '348' : slug === 'snapbed' ? '214' : '156'

  return (
    <>
      <ProductJsonLd
        category={`Furniture > ${categoryName}`}
        currency="USD"
        description={productData.subtitle || 'Whole-home flat-pack furniture piece engineered for tool-free assembly.'}
        image={productImage}
        inStock={true}
        locale={locale}
        name={productData.title}
        price={productData.price / 100}
        ratingValue="4.9"
        reviewCount={reviewCount}
        sku={`TFS-${slug.toUpperCase()}`}
        url={`/products/${slug}`}
      />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: tCommon('home'), url: '/' },
          { name: categoryName, url: '/1-bedroom-kit-builder' },
          { name: productData.title, url: `/products/${slug}` },
        ]}
      />
      <SiteHeader locale={locale} />
      <ProductDetail materials={materials as any} product={productData} />
      <SiteFooter locale={locale} />
    </>
  )
}
