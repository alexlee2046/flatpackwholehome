const SEEDED_ASSETS: Record<string, string> = {
  '13266a8714.png': '/assets/1-bedroom-kit-builder/13266a8714.png',
  '188581c175.png': '/assets/1-bedroom-kit-builder/188581c175.png',
  '359e11ad79.png': '/assets/1-bedroom-kit-builder/359e11ad79.png',
  '42c66f93ee.png': '/assets/1-bedroom-kit-builder/42c66f93ee.png',
  '5c675ca5bd.png': '/assets/1-bedroom-kit-builder/5c675ca5bd.png',
  '5ce35b6043.png': '/assets/1-bedroom-kit-builder/5ce35b6043.png',
  'b0bf525a54.png': '/assets/1-bedroom-kit-builder/b0bf525a54.png',
  'b23c77bfdd.png': '/assets/1-bedroom-kit-builder/b23c77bfdd.png',
  'b4e5f4d8a0.png': '/assets/1-bedroom-kit-builder/b4e5f4d8a0.png',
  'd4a4793ee2.png': '/assets/1-bedroom-kit-builder/d4a4793ee2.png',
  'd66ddc7ba1.png': '/assets/1-bedroom-kit-builder/d66ddc7ba1.png',
  'da48e93272.png': '/assets/1-bedroom-kit-builder/da48e93272.png',
  'ebd8892f4c.png': '/assets/1-bedroom-kit-builder/ebd8892f4c.png',
  'ec621fdd7b.png': '/assets/1-bedroom-kit-builder/ec621fdd7b.png',
  'b354f66f79.png': '/assets/modusofa-product-detail-page/b354f66f79.png',
  'd3a3e93b3d.png': '/assets/modusofa-product-detail-page/d3a3e93b3d.png',
  'e38c85e68d.png': '/assets/modusofa-product-detail-page/e38c85e68d.png',
  'asset-boxes-to-room-split.png': '/assets/homepage/hero-split.png',
  'hero-split.png': '/assets/homepage/hero-split.png',
}

export function resolveStorefrontMedia(url?: unknown): string | null {
  if (!url || typeof url !== 'string') return null
  const normalized = url
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/api\/media\/file\//, '/media/')
    .replace(/-\d+(\.[a-zA-Z0-9]+)$/, '$1')
  const filename = normalized.split('?')[0]?.split('/').pop()
  return (filename && SEEDED_ASSETS[filename]) || normalized
}
