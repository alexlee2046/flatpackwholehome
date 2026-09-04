import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

console.log('===================================================================')
console.log('  FINAL ADVERSARIAL CHALLENGER: EXHAUSTIVE STRESS-TEST SUITE')
console.log('===================================================================\n')

const BASE_DIR = process.cwd()
const SERVER_APP_DIR = path.join(BASE_DIR, '.next/server/app')
const SITEMAP_PATH = path.join(SERVER_APP_DIR, 'sitemap.xml.body')
const ROBOTS_PATH = path.join(SERVER_APP_DIR, 'robots.txt.body')

const LOCALES = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']
const PRODUCTS = ['modusofa', 'snapbed', '1-bedroom-kit']
const SECONDARY_PAGES = [
  'faq',
  'how-it-works-craft-logistics',
  'free-swatch-box-material-discovery',
  '1-bedroom-kit-builder',
  'us-vs-ikea',
  'cart',
]

const results = {
  totalPassed: 0,
  totalFailed: 0,
  errors: [],
}

function check(description, fn) {
  try {
    fn()
    results.totalPassed++
    console.log(`  ✓ [PASS] ${description}`)
  } catch (err) {
    results.totalFailed++
    results.errors.push({ description, error: err.message })
    console.error(`  ✗ [FAIL] ${description}: ${err.message}`)
  }
}

// =============================================================================
// 1. SITEMAP.XML.BODY ADVERSARIAL AUDIT
// =============================================================================
console.log('\n--- 1. SITEMAP.XML.BODY ADVERSARIAL AUDIT ---')

check('Sitemap file exists and is non-empty', () => {
  assert(fs.existsSync(SITEMAP_PATH), `Sitemap body not found at ${SITEMAP_PATH}`)
  const stat = fs.statSync(SITEMAP_PATH)
  assert(stat.size > 50000, `Sitemap body size suspiciously small: ${stat.size} bytes`)
})

const sitemapContent = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, 'utf8') : ''

check('Zero occurrences of "localhost" in entire sitemap.xml.body', () => {
  const matches = sitemapContent.match(/localhost/gi) || []
  assert.strictEqual(matches.length, 0, `Found ${matches.length} occurrences of "localhost" in sitemap`)
})

check('Zero occurrences of "127.0.0.1" in entire sitemap.xml.body', () => {
  const matches = sitemapContent.match(/127\.0\.0\.1/g) || []
  assert.strictEqual(matches.length, 0, `Found ${matches.length} occurrences of "127.0.0.1" in sitemap`)
})

check('Zero occurrences of "canbee.cn" in entire sitemap.xml.body', () => {
  const matches = sitemapContent.match(/canbee\.cn/gi) || []
  assert.strictEqual(matches.length, 0, `Found ${matches.length} occurrences of "canbee.cn" in sitemap`)
})

check('Zero occurrences of dev port 3000 (":3000") in entire sitemap.xml.body', () => {
  const matches = sitemapContent.match(/:3000/g) || []
  assert.strictEqual(matches.length, 0, `Found ${matches.length} occurrences of ":3000" in sitemap`)
})

check('Zero insecure "http://" content URLs in sitemap.xml.body (excluding standard XML schemas)', () => {
  const httpUrls = sitemapContent.match(/http:\/\/(?!www\.sitemaps\.org|www\.google\.com|www\.w3\.org)[^\s<"'>]+/g) || []
  assert.strictEqual(httpUrls.length, 0, `Found insecure http:// URLs: ${httpUrls.slice(0, 5).join(', ')}`)
})

const imageLocMatches = [...sitemapContent.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m => m[1])

check('Presence of production image:loc entries (> 50 entries)', () => {
  assert(imageLocMatches.length >= 50, `Found only ${imageLocMatches.length} image:loc entries, expected >= 50`)
  console.log(`     (Total image:loc entries parsed: ${imageLocMatches.length})`)
})

check('Presence of valid production image:loc entries matching https://theflatset.com/media/...', () => {
  const mediaMatches = imageLocMatches.filter(url => url.startsWith('https://theflatset.com/media/'))
  assert(mediaMatches.length > 0, 'No https://theflatset.com/media/... entries found')
  console.log(`     (Found ${mediaMatches.length} https://theflatset.com/media/... entries)`)
})

check('All image:loc entries strictly resolve to canonical production domain https://theflatset.com', () => {
  const nonProdImages = imageLocMatches.filter(url => !url.startsWith('https://theflatset.com/'))
  assert.strictEqual(
    nonProdImages.length,
    0,
    `Found ${nonProdImages.length} non-production image:loc entries: ${nonProdImages.slice(0, 5).join(', ')}`
  )
})

const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())

check('Strictly zero duplicate <loc> entries in sitemap', () => {
  const seen = new Set()
  const duplicates = []
  for (const loc of locMatches) {
    if (seen.has(loc)) {
      duplicates.push(loc)
    }
    seen.add(loc)
  }
  assert.strictEqual(duplicates.length, 0, `Found duplicate <loc> entries: ${duplicates.join(', ')}`)
  console.log(`     (Total unique <loc> entries: ${seen.size})`)
})

check('Disallowed /cart is completely absent from sitemap (<loc> and hreflang)', () => {
  const cartMatches = sitemapContent.match(/\/cart/g) || []
  assert.strictEqual(cartMatches.length, 0, `Found ${cartMatches.length} occurrences of "/cart" in sitemap`)
})

// =============================================================================
// 2. ROBOTS.TXT.BODY ADVERSARIAL AUDIT
// =============================================================================
console.log('\n--- 2. ROBOTS.TXT.BODY ADVERSARIAL AUDIT ---')

check('Robots file exists and is non-empty', () => {
  assert(fs.existsSync(ROBOTS_PATH), `Robots body not found at ${ROBOTS_PATH}`)
})

const robotsContent = fs.existsSync(ROBOTS_PATH) ? fs.readFileSync(ROBOTS_PATH, 'utf8') : ''

check('Zero dev hosts ("localhost", "127.0.0.1", "canbee.cn") in robots.txt.body', () => {
  assert(!/localhost/i.test(robotsContent), 'Found localhost in robots.txt')
  assert(!/127\.0\.0\.1/.test(robotsContent), 'Found 127.0.0.1 in robots.txt')
  assert(!/canbee\.cn/i.test(robotsContent), 'Found canbee.cn in robots.txt')
})

check('Exact directive "Host: https://theflatset.com" present', () => {
  assert(
    /^Host:\s*https:\/\/theflatset\.com$/m.test(robotsContent),
    'Directive "Host: https://theflatset.com" missing or malformed'
  )
})

check('Exact directive "Sitemap: https://theflatset.com/sitemap.xml" present', () => {
  assert(
    /^Sitemap:\s*https:\/\/theflatset\.com\/sitemap\.xml$/m.test(robotsContent),
    'Directive "Sitemap: https://theflatset.com/sitemap.xml" missing or malformed'
  )
})

check('Aggressive crawlers (Bytespider, CCBot) have Crawl-delay: 2', () => {
  const lines = robotsContent.split('\n')
  let inAggressiveSection = false
  let hasCrawlDelay = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === 'User-Agent: Bytespider' || trimmed === 'User-Agent: CCBot') {
      inAggressiveSection = true
    } else if (trimmed.startsWith('User-Agent:') && !trimmed.includes('Bytespider') && !trimmed.includes('CCBot')) {
      inAggressiveSection = false
    }
    if (inAggressiveSection && trimmed === 'Crawl-delay: 2') {
      hasCrawlDelay = true
    }
  }
  assert(hasCrawlDelay, 'Crawl-delay: 2 not found under Bytespider / CCBot section')
})

check('All 7 locales have Allow rules in robots.txt', () => {
  for (const locale of LOCALES) {
    const allowLocale = `Allow: /${locale}`
    const allowProducts = `Allow: /${locale}/products/*`
    assert(robotsContent.includes(allowLocale), `Missing "${allowLocale}" in robots.txt`)
    assert(robotsContent.includes(allowProducts), `Missing "${allowProducts}" in robots.txt`)
  }
})

// =============================================================================
// 3. PRERENDERED HTML FOR ALL 21 PRODUCT PAGES
// =============================================================================
console.log('\n--- 3. PRERENDERED HTML PRODUCT PAGES AUDIT (21 PAGES) ---')

function extractJsonLd(html, filePath) {
  const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || []
  return matches.map((tag, idx) => {
    const rawJson = tag
      .replace(/^<script type="application\/ld\+json">/i, '')
      .replace(/<\/script>$/i, '')
    try {
      return JSON.parse(rawJson)
    } catch (err) {
      throw new Error(`JSON-LD parse error in ${filePath} (#${idx}): ${err.message}\n${rawJson}`)
    }
  })
}

for (const locale of LOCALES) {
  for (const slug of PRODUCTS) {
    const relPath = `${locale}/products/${slug}.html`
    const htmlPath = path.join(SERVER_APP_DIR, locale, 'products', `${slug}.html`)
    const metaPath = path.join(SERVER_APP_DIR, locale, 'products', `${slug}.meta`)

    check(`[Product HTML] ${relPath} file existence and valid HTTP 200 prerender`, () => {
      assert(fs.existsSync(htmlPath), `Static file does not exist: ${htmlPath}`)
      const stat = fs.statSync(htmlPath)
      assert(stat.size > 2000, `File abnormally small (${stat.size} bytes): ${htmlPath}`)

      // Check meta indicates valid prerender
      assert(fs.existsSync(metaPath), `Meta file does not exist: ${metaPath}`)
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      assert.strictEqual(meta.headers?.['x-nextjs-prerender'], '1', 'Missing x-nextjs-prerender header')

      // Check HTML content is not a 404 error page
      const html = fs.readFileSync(htmlPath, 'utf8')
      assert(!html.includes('<title>404: This page could not be found.</title>'), `Contains 404 title in ${relPath}`)
      assert(!html.includes('<h1 class="next-error-h1"'), `Contains Next error heading in ${relPath}`)
      assert(!html.includes('<meta name="robots" content="noindex"'), `Contains noindex robots meta in ${relPath}`)
      assert(html.includes('<title>'), `Missing <title> in ${relPath}`)
      assert(html.includes('<h1'), `Missing <h1> in ${relPath}`)
    })

    check(`[Canonical] ${relPath} contains exactly 1 canonical tag pointing to correct URL`, () => {
      const html = fs.readFileSync(htmlPath, 'utf8')
      const canonicalTags = html.match(/<link rel="canonical" href="[^"]+"/g) || []
      assert.strictEqual(
        canonicalTags.length,
        1,
        `Expected exactly 1 canonical tag, found ${canonicalTags.length} in ${relPath}`
      )

      const expectedUrl = locale === 'en'
        ? `https://theflatset.com/products/${slug}`
        : `https://theflatset.com/${locale}/products/${slug}`

      const expectedTag = `<link rel="canonical" href="${expectedUrl}"`
      assert(
        canonicalTags[0] === expectedTag,
        `Canonical tag mismatch in ${relPath}: expected '${expectedTag}', got '${canonicalTags[0]}'`
      )
    })

    check(`[Schema.org] ${relPath} contains valid BreadcrumbList and Product Offer with itemCondition & doesNotApply`, () => {
      const html = fs.readFileSync(htmlPath, 'utf8')
      const blocks = extractJsonLd(html, relPath)

      // 1. BreadcrumbList check
      const breadcrumb = blocks.find(b => b['@type'] === 'BreadcrumbList')
      assert(breadcrumb, `BreadcrumbList missing in ${relPath}`)
      assert.strictEqual(breadcrumb['@context'], 'https://schema.org', 'BreadcrumbList @context must be https://schema.org')
      assert(Array.isArray(breadcrumb.itemListElement), 'itemListElement must be array')
      assert(breadcrumb.itemListElement.length >= 3, `Expected at least 3 breadcrumb items, got ${breadcrumb.itemListElement.length}`)

      // Verify breadcrumb item 1 is Home
      assert.strictEqual(breadcrumb.itemListElement[0].position, 1)
      assert(breadcrumb.itemListElement[0].item.startsWith('https://theflatset.com'))

      // 2. Product Offer check
      const product = blocks.find(b => b['@type'] === 'Product')
      assert(product, `Product schema missing in ${relPath}`)
      assert.strictEqual(product['@context'], 'https://schema.org', 'Product @context must be https://schema.org')
      assert(product.name, `Product name missing in ${relPath}`)
      assert(product.offers, `Product offers missing in ${relPath}`)

      const offer = product.offers
      assert.strictEqual(offer['@type'], 'Offer', `Offer @type must be "Offer" in ${relPath}`)
      assert.strictEqual(offer.priceCurrency, 'USD', `Offer priceCurrency must be USD in ${relPath}`)
      assert(Number(offer.price) > 0, `Offer price must be > 0 in ${relPath}`)
      assert.strictEqual(offer.availability, 'https://schema.org/InStock', `Offer availability must be InStock in ${relPath}`)

      // itemCondition: NewCondition
      assert(
        offer.itemCondition === 'https://schema.org/NewCondition' || offer.itemCondition === 'NewCondition',
        `Offer itemCondition must be NewCondition in ${relPath}, got: ${offer.itemCondition}`
      )

      // Shipping is quoted by destination at cart; no fabricated zero rate.
      assert.strictEqual(offer.shippingDetails, undefined, `Offer must not advertise a static shipping rate in ${relPath}`)

      // seller referencing Organization
      assert(offer.seller, `Offer seller missing in ${relPath}`)
      assert(
        offer.seller['@id']?.includes('#organization') || offer.seller['@id']?.includes('#org') || offer.seller.name,
        `Offer seller missing valid reference in ${relPath}`
      )
    })
  }
}

// =============================================================================
// 4. SECONDARY PAGES SANITY CHECK
// =============================================================================
console.log('\n--- 4. SECONDARY STOREFRONT PAGES AUDIT ---')

for (const sec of SECONDARY_PAGES) {
  const filePath = path.join(SERVER_APP_DIR, 'en', `${sec}.html`)
  if (fs.existsSync(filePath)) {
    check(`[Secondary] en/${sec}.html has exactly 1 canonical tag`, () => {
      const html = fs.readFileSync(filePath, 'utf8')
      const canonicalTags = html.match(/<link rel="canonical" href="[^"]+"/g) || []
      assert.strictEqual(canonicalTags.length, 1, `Expected 1 canonical tag in en/${sec}.html`)
    })
  }
}

// =============================================================================
// 5. AI KNOWLEDGE BASE AUDIT (llms.txt & llms-full.txt)
// =============================================================================
console.log('\n--- 5. AI KNOWLEDGE BASE AUDIT ---')

check('llms.txt contains material specifications (FSC count >= 2)', () => {
  const llmsPath = path.join(BASE_DIR, 'public/llms.txt')
  assert(fs.existsSync(llmsPath), 'public/llms.txt not found')
  const content = fs.readFileSync(llmsPath, 'utf8')
  const fscCount = (content.match(/FSC/gi) || []).length
  assert(fscCount >= 2, `FSC count in llms.txt is ${fscCount}, expected >= 2`)
  console.log(`     (FSC count: ${fscCount})`)
})

check('llms-full.txt line count expanded by >= 50% from original ~91 lines', () => {
  const llmsFullPath = path.join(BASE_DIR, 'public/llms-full.txt')
  assert(fs.existsSync(llmsFullPath), 'public/llms-full.txt not found')
  const content = fs.readFileSync(llmsFullPath, 'utf8')
  const lineCount = content.split('\n').length
  assert(lineCount >= 137, `Line count in llms-full.txt is ${lineCount}, expected >= 137`)
  console.log(`     (Line count: ${lineCount})`)
})

check('llms-full.txt contains competitor matrix and assembly guides', () => {
  const llmsFullPath = path.join(BASE_DIR, 'public/llms-full.txt')
  const content = fs.readFileSync(llmsFullPath, 'utf8')
  for (const comp of ['IKEA', 'Article', 'Burrow', 'Floyd']) {
    assert(content.includes(comp), `Missing competitor ${comp} in llms-full.txt`)
  }
  for (const prod of ['ModuSofa', 'SnapBed', '1-Bedroom Kit']) {
    assert(content.includes(prod), `Missing product guide for ${prod} in llms-full.txt`)
  }
})

// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n===================================================================')
console.log(`TOTAL PASSED: ${results.totalPassed}`)
console.log(`TOTAL FAILED: ${results.totalFailed}`)
console.log('===================================================================')

if (results.totalFailed > 0) {
  console.error('\nFAILURE DETAILS:')
  for (const err of results.errors) {
    console.error(`- ${err.description}: ${err.error}`)
  }
  process.exit(1)
} else {
  console.log('\nALL ADVERSARIAL STRESS-TESTS PASSED WITHOUT ERROR!')
  console.log('FINAL VERDICT: APPROVE')
  process.exit(0)
}
