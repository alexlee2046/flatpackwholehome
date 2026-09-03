import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

const BASE_DIR = process.cwd()
const SERVER_APP_DIR = path.join(BASE_DIR, '.next/server/app')
const ROBOTS_PATH = path.join(SERVER_APP_DIR, 'robots.txt.body')
const SITEMAP_PATH = path.join(SERVER_APP_DIR, 'sitemap.xml.body')

const LOCALES = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']
const PRODUCTS = ['modusofa', 'snapbed', '1-bedroom-kit']
const CORE_SUBPATHS = [
  'products/*',
  '1-bedroom-kit-builder',
  'us-vs-ikea',
  'free-swatch-box-material-discovery',
  'how-it-works-craft-logistics',
  'faq',
]

console.log('=================================================================')
console.log('   CHALLENGER 1: EMPIRICAL ADVERSARIAL VERIFICATION SUITE       ')
console.log('=================================================================\n')

const results = {
  passed: [],
  failed: [],
}

function runTest(suite, name, fn) {
  try {
    fn()
    results.passed.push({ suite, name })
    console.log(`[PASS] [${suite}] ${name}`)
  } catch (err) {
    results.failed.push({ suite, name, error: err.message })
    console.error(`[FAIL] [${suite}] ${name}: ${err.message}`)
  }
}

// -------------------------------------------------------------
// SUITE 1: ROBOTS.TXT VERIFICATION
// -------------------------------------------------------------
console.log('\n--- SUITE 1: ROBOTS.TXT ADVERSARIAL INSPECTION ---')

assert(fs.existsSync(ROBOTS_PATH), `robots.txt.body does not exist at ${ROBOTS_PATH}`)
const robotsContent = fs.readFileSync(ROBOTS_PATH, 'utf8')

runTest('Robots.txt', 'Host directive is exactly https://theflatset.com', () => {
  assert(
    robotsContent.includes('Host: https://theflatset.com'),
    'Missing Host: https://theflatset.com'
  )
})

runTest('Robots.txt', 'Strictly NO localhost, 127.0.0.1, or canbee.cn in robots.txt', () => {
  assert(!/localhost/i.test(robotsContent), 'Found forbidden "localhost" in robots.txt')
  assert(!/127\.0\.0\.1/.test(robotsContent), 'Found forbidden "127.0.0.1" in robots.txt')
  assert(!/canbee\.cn/i.test(robotsContent), 'Found forbidden "canbee.cn" in robots.txt')
})

runTest('Robots.txt', 'Sitemap directive is exactly https://theflatset.com/sitemap.xml', () => {
  assert(
    robotsContent.includes('Sitemap: https://theflatset.com/sitemap.xml'),
    'Missing Sitemap: https://theflatset.com/sitemap.xml'
  )
})

runTest('Robots.txt', 'Crawl-delay: 2 exists for Bytespider and CCBot', () => {
  const bytespiderSection = robotsContent.split(/User-Agent:\s*GPTBot/i)[0]
  assert(
    bytespiderSection.includes('User-Agent: Bytespider') &&
    bytespiderSection.includes('User-Agent: CCBot'),
    'Bytespider or CCBot user agent not found in designated section'
  )
  assert(
    bytespiderSection.includes('Crawl-delay: 2'),
    'Crawl-delay: 2 not found in Bytespider/CCBot section'
  )
})

runTest('Robots.txt', 'Allow rules exist for all 7 locales and core paths', () => {
  for (const locale of LOCALES) {
    assert(
      robotsContent.includes(`Allow: /${locale}`),
      `Missing Allow: /${locale} in robots.txt`
    )
    for (const subpath of CORE_SUBPATHS) {
      const fullRule = `Allow: /${locale}/${subpath}`
      assert(
        robotsContent.includes(fullRule),
        `Missing rule "${fullRule}" in robots.txt`
      )
    }
  }
})

// -------------------------------------------------------------
// SUITE 2: SITEMAP.XML VERIFICATION
// -------------------------------------------------------------
console.log('\n--- SUITE 2: SITEMAP.XML ADVERSARIAL INSPECTION ---')

assert(fs.existsSync(SITEMAP_PATH), `sitemap.xml.body does not exist at ${SITEMAP_PATH}`)
const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8')

runTest('Sitemap.xml', 'Presence of image:loc entries pointing to https://theflatset.com/media/...', () => {
  const imageLocMatches = sitemapContent.match(/<image:loc>(https:\/\/theflatset\.com\/media\/[^<]+)<\/image:loc>/g) || []
  assert(imageLocMatches.length > 0, 'No valid image:loc entries found pointing to https://theflatset.com/media/...')
  console.log(`       (Found ${imageLocMatches.length} valid https://theflatset.com/media/... image:loc entries)`)
})

runTest('Sitemap.xml', 'NO /cart URL is present in sitemap (<loc> or hreflang)', () => {
  const cartMatches = sitemapContent.match(/<loc>[^<]*\/cart[^<]*<\/loc>/g) || []
  assert.strictEqual(
    cartMatches.length,
    0,
    `Found forbidden /cart in sitemap <loc>: ${cartMatches.join(', ')}`
  )
  const cartHreflangMatches = sitemapContent.match(/href="[^"]*\/cart[^"]*"/g) || []
  assert.strictEqual(
    cartHreflangMatches.length,
    0,
    `Found forbidden /cart in sitemap hreflang: ${cartHreflangMatches.join(', ')}`
  )
})

runTest('Sitemap.xml', '0 duplicate <loc> elements exist across the entire sitemap', () => {
  const locRegex = /<loc>([^<]+)<\/loc>/g
  const locs = []
  let match
  while ((match = locRegex.exec(sitemapContent)) !== null) {
    locs.push(match[1].trim())
  }
  assert(locs.length > 0, 'No <loc> elements extracted from sitemap')

  const seen = new Map()
  const duplicates = []
  for (const loc of locs) {
    const count = (seen.get(loc) || 0) + 1
    seen.set(loc, count)
    if (count === 2) {
      duplicates.push(loc)
    }
  }

  assert.strictEqual(
    duplicates.length,
    0,
    `Found ${duplicates.length} duplicate <loc> entries: ${duplicates.slice(0, 5).join(', ')}`
  )
  console.log(`       (Verified ${locs.length} unique <loc> entries with 0 duplicates)`)
})

runTest('Sitemap.xml (Adversarial)', 'Zero localhost or dummy dev URLs in image:loc tags', () => {
  const localhostImageMatches = sitemapContent.match(/<image:loc>http:\/\/localhost:[0-9]+[^<]*<\/image:loc>/g) || []
  assert.strictEqual(
    localhostImageMatches.length,
    0,
    `CRITICAL BUG: Found ${localhostImageMatches.length} localhost URLs in <image:loc>: ${localhostImageMatches.slice(0, 3).join(', ')}`
  )
})

// -------------------------------------------------------------
// SUITE 3: STATIC HTML PRODUCT PAGES & CANONICAL TAGS
// -------------------------------------------------------------
console.log('\n--- SUITE 3: STATIC HTML PRODUCT PAGES & CANONICAL TAGS ---')

runTest('Static HTML', 'All 21 product static files exist and contain valid HTTP 200 content', () => {
  let count = 0
  for (const locale of LOCALES) {
    for (const prod of PRODUCTS) {
      const htmlPath = path.join(SERVER_APP_DIR, locale, 'products', `${prod}.html`)
      assert(fs.existsSync(htmlPath), `Missing static HTML file: ${htmlPath}`)
      const stat = fs.statSync(htmlPath)
      assert(stat.size > 2000, `File ${htmlPath} is abnormally small (${stat.size} bytes)`)

      const html = fs.readFileSync(htmlPath, 'utf8')
      
      // Check that it is NOT a 404 page
      assert(!html.includes('<title>404: This page could not be found.</title>'), `404 title detected in ${htmlPath}`)
      assert(!html.includes('<h1 class="next-error-h1"'), `404 next-error-h1 heading detected in ${htmlPath}`)
      assert(!html.includes('<meta name="robots" content="noindex"'), `noindex meta detected in ${htmlPath}`)
      
      // Check that it contains valid product content
      assert(html.includes('<title>'), `Missing <title> tag in ${htmlPath}`)
      assert(html.includes('<h1'), `Missing <h1> tag in ${htmlPath}`)
      count++
    }
  }
  assert.strictEqual(count, 21, `Expected 21 product pages, verified ${count}`)
  console.log(`       (All ${count} product static files verified with valid HTTP 200 content)`)
})

runTest('Static HTML', 'Every product page (all 21) contains exactly one canonical link to https://theflatset.com/...', () => {
  for (const locale of LOCALES) {
    for (const prod of PRODUCTS) {
      const htmlPath = path.join(SERVER_APP_DIR, locale, 'products', `${prod}.html`)
      const html = fs.readFileSync(htmlPath, 'utf8')
      const canonicalMatches = html.match(/<link rel="canonical" href="([^"]+)"/g) || []
      assert.strictEqual(
        canonicalMatches.length,
        1,
        `Expected exactly 1 canonical link in ${locale}/products/${prod}.html, but found ${canonicalMatches.length}`
      )
      
      const hrefMatch = /href="([^"]+)"/.exec(canonicalMatches[0])
      assert(hrefMatch, `Malformed canonical link: ${canonicalMatches[0]}`)
      const href = hrefMatch[1]
      
      // Expected canonical URL (English default locale has no prefix under as-needed routing)
      const expectedCanonical = locale === 'en'
        ? `https://theflatset.com/products/${prod}`
        : `https://theflatset.com/${locale}/products/${prod}`
        
      assert.strictEqual(
        href,
        expectedCanonical,
        `Canonical URL mismatch in ${locale}/products/${prod}.html: expected ${expectedCanonical}, got ${href}`
      )
    }
  }
  console.log('       (All 21 product pages verified to have exactly 1 canonical link)')
})

runTest('Static HTML', 'Sample core non-product pages contain exactly one canonical link', () => {
  const samplePages = [
    { file: path.join(SERVER_APP_DIR, 'en.html'), expected: 'https://theflatset.com' },
    { file: path.join(SERVER_APP_DIR, 'zh-CN.html'), expected: 'https://theflatset.com/zh-CN' },
    { file: path.join(SERVER_APP_DIR, 'de', 'faq.html'), expected: 'https://theflatset.com/de/faq' },
    { file: path.join(SERVER_APP_DIR, 'ja', '1-bedroom-kit-builder.html'), expected: 'https://theflatset.com/ja/1-bedroom-kit-builder' },
    { file: path.join(SERVER_APP_DIR, 'ar', 'us-vs-ikea.html'), expected: 'https://theflatset.com/ar/us-vs-ikea' },
    { file: path.join(SERVER_APP_DIR, 'ru', 'how-it-works-craft-logistics.html'), expected: 'https://theflatset.com/ru/how-it-works-craft-logistics' },
    { file: path.join(SERVER_APP_DIR, 'zh-TW', 'free-swatch-box-material-discovery.html'), expected: 'https://theflatset.com/zh-TW/free-swatch-box-material-discovery' },
  ]

  for (const { file, expected } of samplePages) {
    assert(fs.existsSync(file), `Sample page not found: ${file}`)
    const html = fs.readFileSync(file, 'utf8')
    const canonicalMatches = html.match(/<link rel="canonical" href="([^"]+)"/g) || []
    assert.strictEqual(
      canonicalMatches.length,
      1,
      `Expected exactly 1 canonical link in ${path.relative(SERVER_APP_DIR, file)}, got ${canonicalMatches.length}`
    )
    const hrefMatch = /href="([^"]+)"/.exec(canonicalMatches[0])
    assert.strictEqual(
      hrefMatch[1],
      expected,
      `Canonical URL mismatch in ${path.relative(SERVER_APP_DIR, file)}: expected ${expected}, got ${hrefMatch[1]}`
    )
  }
  console.log(`       (All ${samplePages.length} sampled core pages verified with exactly 1 canonical link)`)
})

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=================================================================')
console.log(`SUMMARY: ${results.passed.length} PASSED, ${results.failed.length} FAILED`)
console.log('=================================================================\n')

if (results.failed.length > 0) {
  console.log('FAILURES ENCOUNTERED:')
  for (const f of results.failed) {
    console.log(`  - [${f.suite}] ${f.name}: ${f.error}`)
  }
}
