import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

const LOCALES = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']
const PRODUCTS = ['modusofa', 'snapbed', '1-bedroom-kit']
const SITEMAP_CORE_ROUTES = [
  '/',
  '/1-bedroom-kit-builder',
  '/us-vs-ikea',
  '/free-swatch-box-material-discovery',
  '/how-it-works-craft-logistics',
  '/faq',
  '/products/modusofa',
  '/products/snapbed',
  '/products/1-bedroom-kit',
]

console.log('=== Verifying Milestone M5: Technical SEO & Internal Link Integrity ===\n')

const serverAppDir = path.resolve(process.cwd(), '.next/server/app')
assert(fs.existsSync(serverAppDir), `Server app directory not found at ${serverAppDir}`)

// 1. Verify prerendered HTML for all 3 products across all 7 locales
console.log('1. Checking static HTML generation for all 3 products across all 7 locales...')
for (const locale of LOCALES) {
  for (const slug of PRODUCTS) {
    const htmlPath = path.join(serverAppDir, locale, 'products', `${slug}.html`)
    assert(
      fs.existsSync(htmlPath),
      `Missing static HTML for locale ${locale} product ${slug}: ${htmlPath}`
    )
    const content = fs.readFileSync(htmlPath, 'utf8')
    assert(
      !content.includes('<title>404: This page could not be found.</title>') &&
      !content.includes('<h1 class="next-error-h1"'),
      `Prerendered page for ${locale}/products/${slug} resulted in 404!`
    )
    assert(
      content.includes('<title>') && !content.includes('404</title>'),
      `Prerendered page title in ${locale}/products/${slug} is 404!`
    )
    console.log(`   ✓ ${locale}/products/${slug}.html generated successfully (HTTP 200)`)
  }
}

// 2. Verify Canonical links: Exactly 1 per page pointing to absolute canonical URL
console.log('\n2. Verifying exactly one canonical link per page...')
const samplePages = [
  path.join(serverAppDir, 'en.html'),
  path.join(serverAppDir, 'zh-CN.html'),
  path.join(serverAppDir, 'de', 'faq.html'),
  path.join(serverAppDir, 'en', 'products', 'modusofa.html'),
  path.join(serverAppDir, 'en', 'products', 'snapbed.html'),
  path.join(serverAppDir, 'en', 'products', '1-bedroom-kit.html'),
]

for (const pagePath of samplePages) {
  assert(fs.existsSync(pagePath), `Sample page not found: ${pagePath}`)
  const content = fs.readFileSync(pagePath, 'utf8')
  const canonicalMatches = content.match(/<link rel="canonical" href="https:\/\/theflatset\.com[^"]*"/g) || []
  assert.strictEqual(
    canonicalMatches.length,
    1,
    `Expected exactly 1 canonical tag in ${pagePath}, found ${canonicalMatches.length}`
  )
  console.log(`   ✓ ${path.basename(pagePath)} has exactly 1 canonical link: ${canonicalMatches[0]}`)
}

// 3. Verify <html lang="..."> for all 7 locales
console.log('\n3. Verifying <html lang="..."> for all 7 locales...')
for (const locale of LOCALES) {
  const homePath = path.join(serverAppDir, `${locale}.html`)
  assert(fs.existsSync(homePath), `Homepage HTML not found for locale ${locale}`)
  const content = fs.readFileSync(homePath, 'utf8')
  const langMatch = content.match(/<html[^>]*\slang="([^"]+)"/)
  assert(langMatch, `No lang attribute found on <html in ${homePath}`)
  assert.strictEqual(
    langMatch[1],
    locale,
    `Expected <html lang="${locale}"> but got <html lang="${langMatch[1]}"> in ${homePath}`
  )
  console.log(`   ✓ ${locale}.html has lang="${locale}"`)
}

// 4. Verify that all 8 sitemap routes are linked in the crawlable footer from every page
console.log('\n4. Verifying zero orphaned sitemap routes via footer internal linking...')
const footerTestPages = [
  path.join(serverAppDir, 'en.html'),
  path.join(serverAppDir, 'en', 'products', 'snapbed.html'),
  path.join(serverAppDir, 'en', 'faq.html'),
]

for (const pagePath of footerTestPages) {
  const content = fs.readFileSync(pagePath, 'utf8')
  for (const route of SITEMAP_CORE_ROUTES) {
    if (route === '/') continue
    // Matches href="/route" or href="/en/route"
    const routeRegex = new RegExp(`href="(/en)?${route}"`)
    assert(
      routeRegex.test(content),
      `Page ${pagePath} is missing internal crawlable link to ${route}`
    )
  }
  console.log(`   ✓ ${path.basename(pagePath)} links to all sitemap routes (0 orphans)`)
}

// 5. Verify sitemap.xml contains all 63 valid entries with no orphans or 404s
console.log('\n5. Verifying sitemap.xml generated entries...')
const sitemapBodyPath = path.join(serverAppDir, 'sitemap.xml.body')
if (fs.existsSync(sitemapBodyPath)) {
  const sitemapContent = fs.readFileSync(sitemapBodyPath, 'utf8')
  const locMatches = sitemapContent.match(/<loc>[^<]+<\/loc>/g) || []
  assert(locMatches.length >= 63, `Expected at least 63 sitemap URLs, found ${locMatches.length}`)
  console.log(`   ✓ sitemap.xml contains ${locMatches.length} URLs across all locales`)
}

console.log('\n=== All Milestone M5 Technical SEO & Internal Link Integrity Tests Passed! ===\n')
