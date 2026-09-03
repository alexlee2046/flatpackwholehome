import React from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theflatset.com'

/**
 * Universal JSON-LD Injector
 */
export function JsonLdScript({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Organization & Brand Structured Data
 */
export function OrganizationJsonLd({ locale = 'en' }: { locale?: string }) {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'The Flat Set',
    alternateName: ['TheFlatSet', 'MODULIV', 'MODULIV Whole-Home'],
    url: baseUrl,
    logo: `${baseUrl}/assets/brand/lockup.svg`,
    image: `${baseUrl}/assets/homepage/hero-split.png`,
    inLanguage: locale,
    description:
      'The Flat Set furnishes your whole home from 6 flat boxes — 100% tool-free 60-minute assembly, fresh-pressed made-to-order craft, free swatch box, DDP duties included, and 100-night trial.',
    slogan: 'Your entire home. Delivered in 6 flat boxes.',
    brand: {
      '@type': 'Brand',
      name: 'The Flat Set',
      logo: `${baseUrl}/assets/brand/mark.svg`,
      slogan: '6 Boxes · 60 Minutes · 0 Screws · DDP Included',
    },
    sameAs: [
      'https://instagram.com/theflatset',
      'https://twitter.com/theflatset',
      'https://pinterest.com/theflatset',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'concierge@theflatset.com',
      availableLanguage: ['English', 'Chinese', 'German', 'Japanese', 'Arabic', 'Russian'],
    },
  }

  return <JsonLdScript data={data} />
}

/**
 * WebSite & SearchAction Structured Data
 */
export function WebSiteJsonLd({ locale = 'en' }: { locale?: string }) {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'The Flat Set',
    inLanguage: locale,
    description: 'Whole-Home Flat-Pack Living System delivered in 6 flat boxes with tool-free assembly.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    workTranslation: [
      { '@type': 'WebSite', inLanguage: 'en', url: `${baseUrl}/` },
      { '@type': 'WebSite', inLanguage: 'zh-CN', url: `${baseUrl}/zh-CN` },
      { '@type': 'WebSite', inLanguage: 'zh-TW', url: `${baseUrl}/zh-TW` },
      { '@type': 'WebSite', inLanguage: 'de', url: `${baseUrl}/de` },
      { '@type': 'WebSite', inLanguage: 'ja', url: `${baseUrl}/ja` },
      { '@type': 'WebSite', inLanguage: 'ar', url: `${baseUrl}/ar` },
      { '@type': 'WebSite', inLanguage: 'ru', url: `${baseUrl}/ru` },
    ],
  }

  return <JsonLdScript data={data} />
}

/**
 * FAQPage Structured Data (Generative AI Q&A & Search Rich Snippets)
 */
export function FaqJsonLd({
  items,
  locale = 'en',
}: {
  items: Array<{ q: string; a: string }>
  locale?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: Array.isArray(items)
      ? items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        }))
      : [],
  }

  return <JsonLdScript data={data} />
}

/**
 * HowTo Structured Data (Generative AI Guide Extraction & Google Rich Snippets)
 */
export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime = 'PT60M',
  locale = 'en',
}: {
  name: string
  description: string
  steps: Array<{ title: string; description: string; stepNumber?: string }>
  totalTime?: string
  locale?: string
}) {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    inLanguage: locale,
    totalTime,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: 0,
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'The Flat Set Compact Flat Boxes',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'None (100% Tool-Free Mechanical Snap-Lock Joint Assembly)',
      },
    ],
    step: Array.isArray(steps)
      ? steps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.title,
          text: s.description,
          url: `${baseUrl}/how-it-works-craft-logistics#step-${idx + 1}`,
        }))
      : [],
  }

  return <JsonLdScript data={data} />
}

/**
 * Product & Offer Structured Data (Google Merchant / Rich Snippets)
 */
export function ProductJsonLd({
  name,
  description,
  image,
  price,
  sku,
  url,
  currency = 'USD',
  inStock = true,
  locale = 'en',
}: {
  name: string
  description: string
  image: string
  price: number
  sku: string
  url: string
  currency?: string
  inStock?: boolean
  locale?: string
}) {
  const baseUrl = SITE_URL.replace(/\/$/, '')
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    inLanguage: locale,
    image: [imageUrl],
    sku,
    mpn: sku,
    brand: {
      '@type': 'Brand',
      name: 'The Flat Set',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: fullUrl,
      priceValidUntil: '2027-12-31',
      seller: {
        '@type': 'Organization',
        name: 'The Flat Set',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'AE'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 14,
            maxValue: 18,
            unitCode: 'd',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'AE'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 100,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  }

  return <JsonLdScript data={data} />
}

/**
 * BreadcrumbList Structured Data
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const baseUrl = SITE_URL.replace(/\/$/, '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  }

  return <JsonLdScript data={data} />
}
