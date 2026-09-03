import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

console.log('===================================================================')
console.log('   CHALLENGER 2: EMPIRICAL ADVERSARIAL VERIFICATION SUITE')
console.log('   Structured Data (JSON-LD), OpenGraph/Twitter Meta, AI Knowledge Base')
console.log('===================================================================\n')

const serverAppDir = path.resolve(process.cwd(), '.next/server/app')
assert(fs.existsSync(serverAppDir), `Server app directory not found at ${serverAppDir}`)

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

const EXPECTED_PRICES = {
  modusofa: 699,
  snapbed: 899,
  '1-bedroom-kit': 1598,
}

const EXPECTED_CATEGORIES_ZH_CN = {
  modusofa: '客厅坐具',
  snapbed: '卧室家具',
  '1-bedroom-kit': '全屋套装',
}

const EXPECTED_CATEGORIES_EN = {
  modusofa: 'Seating',
  snapbed: 'Bedroom',
  '1-bedroom-kit': 'Whole Home',
}

let totalAssertions = 0
function pass(message) {
  totalAssertions++
  console.log(`  ✓ ${message}`)
}

// -----------------------------------------------------------------------------
// Helper: Extract all JSON-LD from an HTML string
// -----------------------------------------------------------------------------
function extractJsonLd(html, filePath) {
  const matches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || []
  return matches.map((tag, idx) => {
    const rawJson = tag
      .replace(/^<script type="application\/ld\+json">/i, '')
      .replace(/<\/script>$/i, '')
    try {
      return JSON.parse(rawJson)
    } catch (err) {
      throw new Error(`JSON.parse failed in ${filePath} (script #${idx}): ${err.message}\n${rawJson}`)
    }
  })
}

// =============================================================================
// TEST SUITE 1: JSON-LD Extraction & Strict Parsing Across All Generated Pages
// =============================================================================
console.log('Test Suite 1: Extract & JSON.parse() every <script type="application/ld+json">')

function getAllHtmlFiles(dir) {
  let results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath)
    }
  }
  return results
}

const allHtmlFiles = getAllHtmlFiles(serverAppDir)
assert(allHtmlFiles.length > 0, 'No HTML files found in .next/server/app')

let totalJsonLdBlocks = 0
for (const htmlFile of allHtmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8')
  const jsonLdBlocks = extractJsonLd(content, htmlFile)
  totalJsonLdBlocks += jsonLdBlocks.length
  for (const block of jsonLdBlocks) {
    assert(block['@context'], `Missing @context in ${htmlFile}`)
    assert(block['@type'], `Missing @type in ${htmlFile}`)
  }
}
pass(`Extracted and successfully parsed ${totalJsonLdBlocks} JSON-LD blocks across ${allHtmlFiles.length} HTML files with 0 parse errors`)

// =============================================================================
// TEST SUITE 2: Homepage BreadcrumbList Verification
// =============================================================================
console.log('\nTest Suite 2: Homepage BreadcrumbList Verification (all 7 locales)')

for (const locale of LOCALES) {
  const homeHtmlPath = path.join(serverAppDir, `${locale}.html`)
  assert(fs.existsSync(homeHtmlPath), `Missing homepage for locale ${locale}`)
  const content = fs.readFileSync(homeHtmlPath, 'utf8')
  const jsonLdBlocks = extractJsonLd(content, homeHtmlPath)

  const breadcrumbs = jsonLdBlocks.find((b) => b['@type'] === 'BreadcrumbList')
  assert(breadcrumbs, `Homepage for ${locale} is missing BreadcrumbList JSON-LD`)
  assert(Array.isArray(breadcrumbs.itemListElement), `itemListElement is not an array in ${locale} homepage`)
  assert.strictEqual(breadcrumbs.itemListElement.length, 1, `Expected 1 breadcrumb item on homepage, found ${breadcrumbs.itemListElement.length}`)

  const item1 = breadcrumbs.itemListElement[0]
  assert.strictEqual(item1['@type'], 'ListItem')
  assert.strictEqual(item1.position, 1)
  assert(typeof item1.name === 'string' && item1.name.length > 0, `Empty name for home breadcrumb in ${locale}`)
  assert(item1.item.startsWith('https://theflatset.com'), `Breadcrumb item URL does not start with https://theflatset.com: ${item1.item}`)

  if (locale === 'en') {
    assert.strictEqual(item1.name, 'Home')
    assert.strictEqual(item1.item, 'https://theflatset.com/')
  } else if (locale === 'zh-CN') {
    assert.strictEqual(item1.name, '首页')
    assert.strictEqual(item1.item, 'https://theflatset.com/zh-CN')
  }

  pass(`Homepage [${locale}]: Valid BreadcrumbList (Pos 1: "${item1.name}" -> ${item1.item})`)
}

// =============================================================================
// TEST SUITE 3: Product Detail Pages (PDP) Breadcrumbs, Offer, & AggregateRating
// =============================================================================
console.log('\nTest Suite 3: PDP BreadcrumbList, Offer & AggregateRating Verification')

for (const locale of LOCALES) {
  for (const slug of PRODUCTS) {
    const pdpHtmlPath = path.join(serverAppDir, locale, 'products', `${slug}.html`)
    assert(fs.existsSync(pdpHtmlPath), `Missing PDP HTML: ${pdpHtmlPath}`)
    const content = fs.readFileSync(pdpHtmlPath, 'utf8')
    const jsonLdBlocks = extractJsonLd(content, pdpHtmlPath)

    // A. BreadcrumbList check (Home -> Category -> Title)
    const breadcrumbBlock = jsonLdBlocks.find((b) => b['@type'] === 'BreadcrumbList')
    assert(breadcrumbBlock, `Missing BreadcrumbList in ${locale}/products/${slug}`)
    const items = breadcrumbBlock.itemListElement
    assert(Array.isArray(items), `itemListElement not an array in ${locale}/products/${slug}`)
    assert.strictEqual(items.length, 3, `Expected exactly 3 breadcrumb items in ${locale}/products/${slug}, found ${items.length}`)

    // Item 1: Home
    assert.strictEqual(items[0].position, 1)
    assert(items[0].item.startsWith('https://theflatset.com'))

    // Item 2: Category
    assert.strictEqual(items[1].position, 2)
    assert(items[1].item.includes('/1-bedroom-kit-builder'))
    assert(typeof items[1].name === 'string' && items[1].name.length > 0)

    // Item 3: Title
    assert.strictEqual(items[2].position, 3)
    assert(items[2].item.includes(`/products/${slug}`))
    assert(typeof items[2].name === 'string' && items[2].name.length > 0)

    // Specific check for zh-CN localized category names
    if (locale === 'zh-CN') {
      const expectedCat = EXPECTED_CATEGORIES_ZH_CN[slug]
      assert.strictEqual(
        items[1].name,
        expectedCat,
        `Expected zh-CN category '${expectedCat}', got '${items[1].name}'`
      )
      assert.strictEqual(items[0].name, '首页')
    }

    if (locale === 'en') {
      const expectedCat = EXPECTED_CATEGORIES_EN[slug]
      assert.strictEqual(
        items[1].name,
        expectedCat,
        `Expected en category '${expectedCat}', got '${items[1].name}'`
      )
      assert.strictEqual(items[0].name, 'Home')
    }

    // B. Product & Offer check
    const productBlock = jsonLdBlocks.find((b) => b['@type'] === 'Product')
    assert(productBlock, `Missing Product schema in ${locale}/products/${slug}`)

    const offer = productBlock.offers
    assert(offer, `Missing offers in Product schema in ${locale}/products/${slug}`)
    assert.strictEqual(offer['@type'], 'Offer')
    assert.strictEqual(offer.price, EXPECTED_PRICES[slug], `Invalid price for ${slug}`)
    assert.strictEqual(offer.priceCurrency, 'USD', `Expected priceCurrency USD, got ${offer.priceCurrency}`)
    assert.strictEqual(offer.availability, 'https://schema.org/InStock')
    assert.strictEqual(offer.itemCondition, 'https://schema.org/NewCondition')
    assert.strictEqual(offer.priceValidUntil, '2027-12-31')

    // Seller @id
    assert(offer.seller, `Missing seller in Offer for ${slug}`)
    assert.strictEqual(offer.seller['@type'], 'Organization')
    assert.strictEqual(offer.seller['@id'], 'https://theflatset.com/#organization')

    // shippingDetails.doesNotApply: false
    assert(offer.shippingDetails, `Missing shippingDetails in ${locale}/products/${slug}`)
    assert.strictEqual(
      offer.shippingDetails.doesNotApply,
      false,
      `shippingDetails.doesNotApply must be boolean false`
    )

    // AggregateRating check (ratingValue: 4.9)
    const rating = productBlock.aggregateRating
    assert(rating, `Missing aggregateRating in ${locale}/products/${slug}`)
    assert.strictEqual(rating['@type'], 'AggregateRating')
    assert.strictEqual(rating.ratingValue, '4.9')
    assert(rating.reviewCount && Number(rating.reviewCount) > 0)

    pass(`PDP [${locale}/products/${slug}]: 3 Breadcrumbs ("${items[1].name}"), Offer ($${offer.price} USD, InStock, NewCondition, seller #org, doesNotApply:false), AggregateRating (${rating.ratingValue})`)
  }
}

// =============================================================================
// TEST SUITE 4: Secondary Storefront Pages BreadcrumbList Verification
// =============================================================================
console.log('\nTest Suite 4: Secondary Pages BreadcrumbList Verification (FAQ, How-It-Works, Swatch, Kit-Builder, Us-vs-IKEA, Cart)')

for (const locale of LOCALES) {
  for (const pageName of SECONDARY_PAGES) {
    const pageHtmlPath = path.join(serverAppDir, locale, `${pageName}.html`)
    assert(fs.existsSync(pageHtmlPath), `Missing secondary page: ${pageHtmlPath}`)
    const content = fs.readFileSync(pageHtmlPath, 'utf8')
    const jsonLdBlocks = extractJsonLd(content, pageHtmlPath)

    const breadcrumbs = jsonLdBlocks.find((b) => b['@type'] === 'BreadcrumbList')
    assert(breadcrumbs, `Missing BreadcrumbList in ${locale}/${pageName}`)
    const items = breadcrumbs.itemListElement
    assert(Array.isArray(items), `itemListElement is not array in ${locale}/${pageName}`)
    assert.strictEqual(items.length, 2, `Expected 2 breadcrumb items in ${locale}/${pageName}, got ${items.length}`)

    assert.strictEqual(items[0].position, 1)
    assert(items[0].item.startsWith('https://theflatset.com'))

    assert.strictEqual(items[1].position, 2)
    assert(items[1].item.includes(pageName))
    assert(typeof items[1].name === 'string' && items[1].name.length > 0)

    pass(`Secondary page [${locale}/${pageName}]: BreadcrumbList (Pos 1: "${items[0].name}" -> Pos 2: "${items[1].name}")`)
  }
}

// =============================================================================
// TEST SUITE 5: OpenGraph, Twitter & Robots Meta Tags
// =============================================================================
console.log('\nTest Suite 5: OpenGraph, Twitter, and Robots Meta Tags across all pages')

const ALL_STOREFRONT_ROUTES = [
  '',
  ...SECONDARY_PAGES,
  ...PRODUCTS.map((p) => `products/${p}`),
]

for (const locale of LOCALES) {
  for (const route of ALL_STOREFRONT_ROUTES) {
    const pagePath = route === ''
      ? path.join(serverAppDir, `${locale}.html`)
      : path.join(serverAppDir, locale, `${route}.html`)

    assert(fs.existsSync(pagePath), `Page file not found: ${pagePath}`)
    const html = fs.readFileSync(pagePath, 'utf8')

    // 1. og:image
    const ogImgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
    assert(ogImgMatch, `Missing og:image in ${locale}/${route || 'home'}`)
    const ogImg = ogImgMatch[1]
    assert(
      ogImg.startsWith('https://theflatset.com/'),
      `og:image does not start with https://theflatset.com/ in ${locale}/${route || 'home'}: ${ogImg}`
    )

    // 2. twitter:image
    const twImgMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i)
    assert(twImgMatch, `Missing twitter:image in ${locale}/${route || 'home'}`)
    const twImg = twImgMatch[1]
    assert(
      twImg.startsWith('https://theflatset.com/'),
      `twitter:image does not start with https://theflatset.com/ in ${locale}/${route || 'home'}: ${twImg}`
    )

    // 3. og:locale
    const ogLocMatch = html.match(/<meta[^>]*property="og:locale"[^>]*content="([^"]+)"/i)
    assert(ogLocMatch, `Missing og:locale in ${locale}/${route || 'home'}`)
    assert(ogLocMatch[1].length >= 2, `Invalid og:locale in ${locale}/${route || 'home'}`)

    // 4. Cart page robots meta tag
    if (route === 'cart') {
      const robotsMatch = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/i)
      assert(robotsMatch, `Missing robots meta tag in ${locale}/cart`)
      const robotsContent = robotsMatch[1]
      assert(
        robotsContent.includes('noindex') && robotsContent.includes('nofollow'),
        `Expected 'noindex, nofollow' in ${locale}/cart, got '${robotsContent}'`
      )
      pass(`Cart robots meta [${locale}/cart]: content="${robotsContent}" verified`)
    } else {
      // Adversarial check: verify NO accidental noindex on public indexable pages
      const robotsMatch = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/i)
      if (robotsMatch) {
        assert(
          !robotsMatch[1].includes('noindex'),
          `Accidental noindex detected on public route: ${locale}/${route || 'home'}`
        )
      }
    }
  }
}
pass(`Verified og:image, twitter:image, og:locale, and robots across all ${LOCALES.length * ALL_STOREFRONT_ROUTES.length} storefront pages`)

// =============================================================================
// TEST SUITE 6: AI Knowledge Base & GEO Verification
// =============================================================================
console.log('\nTest Suite 6: AI Knowledge Base & GEO Verification (llms.txt & llms-full.txt)')

// 1. Assert grep -c 'FSC' public/llms.txt >= 2
const llmsTxtPath = path.resolve(process.cwd(), 'public/llms.txt')
assert(fs.existsSync(llmsTxtPath), `public/llms.txt not found at ${llmsTxtPath}`)
const llmsTxtContent = fs.readFileSync(llmsTxtPath, 'utf8')
const fscMatches = (llmsTxtContent.match(/FSC/g) || []).length
assert(
  fscMatches >= 2,
  `Expected at least 2 FSC occurrences in public/llms.txt, found ${fscMatches}`
)
pass(`public/llms.txt has ${fscMatches} FSC mentions (>= 2 required)`)

// 2. Assert line count of public/llms-full.txt >= 137 (>50% increase over 91 lines)
const llmsFullTxtPath = path.resolve(process.cwd(), 'public/llms-full.txt')
assert(fs.existsSync(llmsFullTxtPath), `public/llms-full.txt not found at ${llmsFullTxtPath}`)
const llmsFullContent = fs.readFileSync(llmsFullTxtPath, 'utf8')
const lineCount = llmsFullContent.split('\n').length
assert(
  lineCount >= 137,
  `Expected at least 137 lines in public/llms-full.txt, found ${lineCount}`
)
pass(`public/llms-full.txt line count is ${lineCount} (>= 137 required, baseline was 91)`)

// 3. Assert presence of IKEA, Article, Burrow, and Floyd in llms-full.txt
const requiredCompetitors = ['IKEA', 'Article', 'Burrow', 'Floyd']
for (const competitor of requiredCompetitors) {
  assert(
    llmsFullContent.includes(competitor),
    `Competitor '${competitor}' is missing from public/llms-full.txt`
  )
  pass(`Competitor '${competitor}' confirmed present in public/llms-full.txt`)
}

console.log('\n===================================================================')
console.log(`   ALL ${totalAssertions} EMPIRICAL ASSERTIONS PASSED! VERDICT: APPROVE`)
console.log('===================================================================\n')
