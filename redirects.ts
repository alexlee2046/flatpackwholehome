import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  return [
    { destination: '/', permanent: true, source: '/index.html' },
    { destination: '/1-bedroom-kit-builder', permanent: true, source: '/1-bedroom-kit-builder.html' },
    { destination: '/products/modusofa', permanent: true, source: '/modusofa-product-detail-page.html' },
    { destination: '/cart', permanent: true, source: '/cart.html' },
    { destination: '/faq', permanent: true, source: '/faq.html' },
    { destination: '/free-swatch-box-material-discovery', permanent: true, source: '/free-swatch-box-material-discovery.html' },
    { destination: '/how-it-works-craft-logistics', permanent: true, source: '/how-it-works-craft-logistics.html' },
    { destination: '/gallery', permanent: true, source: '/gallery.html' },
  ]
}
