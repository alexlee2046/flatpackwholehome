# Project: The Flat Set — Production-Grade SEO & Generative AI (GEO) Optimization Phase 2

## Architecture
- **Framework**: Next.js 16 App Router with `next-intl` (7 locales: `en`, `zh-CN`, `zh-TW`, `de`, `ja`, `ar`, `ru`, `localePrefix: 'as-needed'`).
- **CMS**: Payload CMS 3.x with PostgreSQL database.
- **Canonical Domain**: `https://theflatset.com` (with staging at `https://flatpack.dev.canbee.cn`).
- **Domain Resolution**: Centralized canonical URL helper ensuring build-time dummy envs (`http://localhost:3000` from Dockerfile) never leak into production metadata.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Host and Sitemap domain fix | Ensure `Host` and `Sitemap` directives in robots.txt always resolve to `https://theflatset.com` | M1 | Survey 1 |
| 2 | Crawl-delay for aggressive bots | Add `Crawl-delay` (e.g. 2s) for `Bytespider` and `CCBot` in robots.txt | M1 | Survey 1 |
| 3 | AI bot locale-prefixed allowlist | Add allow paths for all 7 locales (`/zh-CN/products/*`, `/de/faq`, etc.) for AI user-agents | M1 | Survey 1 |
| 4 | Sitemap image entries | Add `<image:image>` with `<image:loc>` for product entries via Next.js 16 native `images: string[]` | M2 | Survey 1 |
| 5 | Sitemap deduplication & cleanup | Remove disallowed `/cart` from sitemap; eliminate duplicate `<loc>` elements | M2 | Survey 1 |
| 6 | BreadcrumbList structured data | Add `BreadcrumbList` JSON-LD across all storefront pages (Home, PDP, FAQ, How-It-Works, Swatch, Kit Builder, Us vs IKEA, Cart) | M3 | Survey 2 |
| 7 | Product Offer schema enhancement | Add `itemCondition: NewCondition`, `shippingDetails` with `doesNotApply: false`, seller `@id`, and rating to Product JSON-LD | M3 | Survey 2 |
| 8 | JSON-LD XSS sanitization | Implement `.replace(/</g, '\\u003c')` sanitization per Next.js 16 documentation | M3 | Survey 2 |
| 9 | Next.js 16 OG/Twitter image fix | Extend `buildPageMetadata` with `image?: string` to prevent shallow merge wipeout of OG/Twitter images | M4 | Survey 3 |
| 10 | Per-page Open Graph & Twitter tags | Supply absolute URLs, canonical tags, `og:locale`, and `og:locale:alternate` for all pages | M4 | Survey 3 |
| 11 | Technical SEO & link orphan cleanup | Eliminate orphaned routes (`/products/1-bedroom-kit`), add missing footer links (`snapbed`), ensure static fallback on PDP so build never 404s | M5 | Survey 3 |
| 12 | Canonical & hreflang integrity | Exactly one canonical tag per page, valid hreflang across 7 locales, pnpm build exits 0 | M5 | Survey 3 |
| 13 | AI Knowledge Base material specs | Add FSC white oak, black walnut, HR45 foam, and 4 fabric specs to `llms.txt` and `llms-full.txt` | M6 | Survey 3 |
| 14 | Per-product assembly guides in LLMs | Add step-by-step assembly guides for ModuSofa, SnapBed, and 1-Bedroom Kit | M6 | Survey 3 |
| 15 | Competitive differentiation matrix | Add 4-competitor matrix (vs IKEA, Article, Burrow, Floyd) covering price, materials, assembly, logistics | M6 | Survey 3 |
| 16 | Customer FAQs in LLMs KB | Add pricing, DDP delivery timeframes by region, 100-night trial, and warranty details | M6 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Robots.txt & Crawl Budget / AI Allowlist | `src/app/robots.ts`, canonical domain resolution, crawl-delay, 7-locale allow paths | none | DONE |
| M2 | Sitemap Image Sitemaps & Deduplication | `src/app/sitemap.ts`, native `images: string[]`, remove `/cart`, strict deduplication | M1 | DONE |
| M3 | Schema.org Structured Data Overhaul | `src/components/seo/JsonLd.tsx`, BreadcrumbList across all pages, Product Offer & shippingDetails | none | DONE |
| M4 | Open Graph, Twitter & Canonical Metadata | `src/i18n/pageMetadata.ts`, per-page images, og:url, og:locale, canonical tags | M1 | DONE |
| M5 | Technical SEO Audit & Internal Link Integrity | Eliminate orphaned routes, footer links, static fallback for PDP, pnpm build exit code 0 | M2, M4 | DONE |
| M6 | AI Knowledge Base Expansion | `public/llms.txt`, `public/llms-full.txt` (FSC, assembly, competitors, FAQs) | none | DONE |

## Code Layout & Write Boundaries
- **Central Canonical Domain**: `src/utilities/canonicalUrl.ts` (shared helper, created in M1)
- **Robots**: `src/app/robots.ts` (owned by M1)
- **Sitemap**: `src/app/sitemap.ts` (owned by M2)
- **JSON-LD**: `src/components/seo/JsonLd.tsx` (owned by M3)
- **Page Metadata**: `src/i18n/pageMetadata.ts` (owned by M4)
- **Page Components (Breadcrumb & Metadata Integration)**:
  - `src/app/(app)/[locale]/layout.tsx` (M3/M4)
  - `src/app/(app)/[locale]/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/products/[slug]/page.tsx` (M3/M4/M5)
  - `src/app/(app)/[locale]/faq/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/how-it-works-craft-logistics/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/free-swatch-box-material-discovery/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/1-bedroom-kit-builder/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/us-vs-ikea/page.tsx` (M3/M4)
  - `src/app/(app)/[locale]/cart/page.tsx` (M3/M4)
- **Navigation & Internal Links**:
  - `src/components/navigation/ModulivFooter.tsx` (owned by M5)
- **Knowledge Base**:
  - `public/llms.txt` (owned by M6)
  - `public/llms-full.txt` (owned by M6)

## Interface Contracts
### Canonical Site URL (`src/utilities/canonicalUrl.ts`)
```ts
export const CANONICAL_SITE_URL = 'https://theflatset.com'
export function getCanonicalSiteURL(): string
```
- Strictly resolves to `https://theflatset.com` when `NEXT_PUBLIC_SITE_URL` contains `localhost`, `127.0.0.1`, or `canbee.cn`.

### Page Metadata (`src/i18n/pageMetadata.ts`)
```ts
export interface PageMetadataArgs {
  title: string
  description: string
  pathname: string
  locale: string
  availableLocales?: string[]
  index?: boolean
  image?: string // absolute URL or path starting with '/'
}
export function buildPageMetadata(args: PageMetadataArgs): Metadata
```
- Emits complete OpenGraph and Twitter cards with absolute `images` (1200x630), `url`, and locale alternates.

### Structured Data (`src/components/seo/JsonLd.tsx`)
```ts
export function BreadcrumbJsonLd({ items, locale }: { items: Array<{ name: string; url: string }>; locale?: string }): JSX.Element
export function ProductJsonLd({ name, description, image, price, sku, url, currency, inStock, locale, category, ratingValue, reviewCount }): JSX.Element
```
- XSS sanitized with `.replace(/</g, '\\u003c')`.
- Resolves localized canonical URLs automatically when given relative paths.
