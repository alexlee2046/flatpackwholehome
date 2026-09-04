# Original User Request

## 2026-09-03T13:31:01Z

Production-grade SEO & Generative AI (GEO) optimization Phase 2 for **The Flat Set** — a Next.js 16 + Payload CMS e-commerce storefront selling modular flat-pack furniture. The site already has multilingual support (7 locales: en, zh-CN, zh-TW, de, ja, ar, ru), basic structured data (Organization, WebSite, FAQ, Product, HowTo), a sitemap with hreflang alternates, an llms.txt knowledge base, and an `/api/catalog` machine-readable endpoint. This phase targets measurable improvements to Google Search Console coverage, rich result eligibility, and AI citation accuracy.

Working directory: repository root
Integrity mode: development

## Current State (for reference)

- **Sitemap** (`src/app/sitemap.ts`): Generates multilingual entries with hreflang alternates for static routes + CMS products. Missing: image sitemaps, news/journal sitemaps.
- **Robots.txt** (`src/app/robots.ts`): Has AI bot allowlist. **Bug**: `Host` and `Sitemap` fields output `http://localhost:3000` instead of the production canonical domain `https://theflatset.com`. This must be fixed.
- **Structured Data** (`src/components/seo/JsonLd.tsx`): Has OrganizationJsonLd, WebSiteJsonLd, FaqJsonLd, ProductJsonLd, HowToJsonLd. Missing: BreadcrumbList, Offer/AggregateOffer on products, VideoObject.
- **Meta Tags**: Layout has basic OG and Twitter Card tags. Missing: per-page canonical `<link rel="canonical">`, per-page OG URL, localized OG images, OG locale alternates on sub-pages.
- **llms.txt** (`public/llms.txt`, `public/llms-full.txt`): Has multilingual fact index. Can be expanded with material specs, assembly guides, competitive differentiators.
- **Canonical domain**: `https://theflatset.com` (staging: `https://flatpack.dev.canbee.cn`)
- **Important**: Read `AGENTS.md` for Next.js version-specific guidance before writing any code. The project uses Next.js 16 which has breaking changes from training data.

## Requirements

### R1. Fix robots.txt production domain bug and optimize crawl budget
The robots.txt `Host` and `Sitemap` directives currently emit `http://localhost:3000` because `NEXT_PUBLIC_SITE_URL` is not available at build time in the Docker container. Fix this so `Host` and `Sitemap` always resolve to `https://theflatset.com` in production output. Additionally, add `Crawl-delay` directives for aggressive bots and ensure the AI bot section includes locale-prefixed allow paths (e.g., `/zh-CN/products/*`, `/de/faq`).

### R2. Enhance sitemap with image entries and prioritization
Extend the existing `src/app/sitemap.ts` to include image entries (`<image:image>`) for product pages, sourcing image URLs from Payload CMS media. Ensure proper `<image:loc>`, `<image:title>`, and `<image:caption>` elements in localized language. Verify no duplicate URLs appear across locale variants.

### R3. Add comprehensive structured data coverage across all pages
Add the following Schema.org structured data where missing:
- **BreadcrumbList**: On every storefront page showing the navigation path (Home → Category → Page).
- **Product pages**: Add `Offer` with `price`, `priceCurrency: USD`, `availability: InStock`, `priceValidUntil`, `itemCondition: NewCondition`, `seller` referencing the Organization. Include `shippingDetails` with `doesNotApply: false` and `deliveryTime`.
- Ensure all structured data passes Google Rich Results Test validation (valid JSON-LD, no missing required fields, no warnings).

### R4. Implement full Open Graph and Twitter Card meta tags on every page
Every page (homepage, product pages, FAQ, how-it-works, swatch-box, 1-bedroom-kit-builder) should have:
- Correct `og:url` pointing to the canonical URL for that locale
- `og:locale` and `og:locale:alternate` for all 7 locales
- `og:image` with absolute URLs (not relative paths)
- `<link rel="canonical" href="...">` pointing to the correct locale-specific canonical URL
- Twitter `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` per page

### R5. Technical SEO audit and internal link optimization
- Ensure every page has exactly one `<link rel="canonical">` tag with the correct absolute URL
- Ensure no orphaned pages exist in the sitemap (every sitemap URL must be reachable via internal links)
- Ensure `<html lang="...">` is correctly set per locale (already done, but verify)
- Ensure no mixed-content or broken internal links exist

### R6. Expand AI knowledge base (llms.txt and llms-full.txt)
Extend `public/llms.txt` and `public/llms-full.txt` with:
- Detailed material specifications (FSC white oak, black walnut, HR45 foam densities, fabric options)
- Assembly step-by-step for each product (not just the general HowTo)
- Competitive differentiation facts (vs IKEA, Article, Burrow, Floyd)
- Common customer questions that AI assistants would encounter (pricing, shipping times per region, warranty)

## Acceptance Criteria

### AC1. Robots.txt correctness
- [ ] `curl -s https://flatpack.dev.canbee.cn/robots.txt | grep 'Sitemap:'` returns a URL containing `theflatset.com`, not `localhost`
- [ ] `curl -s https://flatpack.dev.canbee.cn/robots.txt | grep 'Host:'` returns `https://theflatset.com`
- [ ] AI bot section includes locale-prefixed paths like `/zh-CN/products/*`

### AC2. Sitemap image entries
- [ ] `curl -s https://flatpack.dev.canbee.cn/sitemap.xml | grep 'image:loc'` returns at least 1 image URL for product entries
- [ ] No duplicate `<loc>` URLs exist in the sitemap output

### AC3. Structured data validation
- [ ] `curl -s https://flatpack.dev.canbee.cn/en/products/modusofa | grep '"@type":"BreadcrumbList"'` returns a match
- [ ] `curl -s https://flatpack.dev.canbee.cn/en/products/modusofa | grep '"@type":"Offer"'` returns a match
- [ ] `curl -s https://flatpack.dev.canbee.cn/en | grep '"@type":"BreadcrumbList"'` returns a match (homepage breadcrumb)
- [ ] All JSON-LD blocks are valid JSON (parseable by `JSON.parse`)

### AC4. Open Graph and canonical tags
- [ ] `curl -s https://flatpack.dev.canbee.cn/en | grep 'og:url'` returns a URL containing `theflatset.com/en` or `theflatset.com`
- [ ] `curl -s https://flatpack.dev.canbee.cn/zh-CN | grep 'rel="canonical"'` returns a URL containing `theflatset.com/zh-CN`
- [ ] `curl -s https://flatpack.dev.canbee.cn/en/products/modusofa | grep 'og:image'` returns an absolute URL (starts with `https://`)
- [ ] `curl -s https://flatpack.dev.canbee.cn/de/faq | grep 'og:locale'` returns a value

### AC5. Technical SEO
- [ ] `pnpm build` completes with exit code 0
- [ ] Every URL in sitemap.xml returns HTTP 200 when curled

### AC6. AI knowledge base expansion
- [ ] `curl -s https://flatpack.dev.canbee.cn/llms.txt | grep -c 'FSC'` returns at least 2 (material specs section)
- [ ] `curl -s https://flatpack.dev.canbee.cn/llms-full.txt | wc -l` returns at least 50% more lines than current (currently ~180 lines)
