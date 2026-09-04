# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is `pnpm`. Node >= 20.9 (CI uses 22). Dev and build need `DATABASE_URL` (Postgres) plus `PAYLOAD_SECRET`; copy `.env.example` to `.env`.

| Task | Command |
| --- | --- |
| Dev server (port 3000, admin at `/admin`) | `pnpm dev` |
| Production build (standalone output) | `pnpm build` |
| Typecheck (CI gate) | `pnpm exec tsc --noEmit` |
| Lint everything (CI gate, errors only) | `pnpm exec eslint --max-warnings=-1` |
| Lint changed files | `pnpm exec eslint <files>` |
| Unit tests (node:test, no DB needed) | `pnpm test:commerce` |
| Single test by name | `pnpm exec tsx --test --test-name-pattern="<pattern>" tests/commerce-contract.test.ts` |
| Browser E2E against a running server | `BASE_URL=http://localhost:3000 pnpm test:e2e` (also `:journey`, `:motion`, `:admin`, `:deep`) |
| Regenerate `src/payload-types.ts` | `pnpm generate:types` |
| Regenerate admin `importMap.js` | `pnpm generate:importmap` |
| Payload CLI (migrations etc.) | `pnpm payload <cmd>` |

CI (`.github/workflows/ci.yml`) runs exactly: `tsc --noEmit`, `eslint --max-warnings=-1`, `pnpm build`. Existing `any`/unused-var warnings are tolerated but should not grow.

Regenerate `payload-types.ts` and `importMap.js` whenever `src/collections`, `src/globals`, `src/blocks`, `src/plugins`, or `payload.config.ts` change, and commit the result. Side-effectful scripts (`seed:*`, `i18n:*`, `i18n:cms:apply`) write to the DB or call an external LLM: confirm the target first.

## Architecture

**Stack**: Next.js 16 App Router + Payload CMS 3 (Postgres via `@payloadcms/db-postgres`) + `next-intl` + Tailwind 3 + Stripe (via `@payloadcms/plugin-ecommerce`). One Next app hosts both the storefront and the Payload admin.

### Route groups

- `src/app/(app)/[locale]/…` — the public storefront. Every page validates `locale` with `hasLocale`, calls `setRequestLocale`, builds metadata with `buildPageMetadata` (`src/i18n/pageMetadata.ts`), and renders a JSON-LD breadcrumb from `src/components/seo/JsonLd.tsx`.
- `src/app/(app)/api/…` — storefront APIs (checkout quote, swatch enquiries, health). `src/app/api/catalog` and `src/app/api/geo` sit outside the locale tree.
- `src/app/(payload)/…` — Payload admin and REST/GraphQL. Do not edit `admin/importMap.js` by hand.
- `src/app/(app)/next/preview` and `exit-preview` — live-preview entry gated by `PREVIEW_SECRET`.
- `src/proxy.ts` is the `next-intl` middleware; its matcher excludes `/api`, `/admin`, `/media`, and static assets.

### Locales

Seven locales (`en` default, `zh-CN`, `zh-TW`, `de`, `ja`, `ar` RTL, `ru`) are declared once in `src/i18n/routing.ts` and mirrored in `payload.config.ts` `localization`. `localePrefix: 'as-needed'` means `en` has no URL prefix. Adding a locale touches: `routing.ts`, `payload.config.ts`, all three `messages/**/<locale>.json` catalogs (`messages/`, `messages/pages/`, `messages/policies/`), `src/utilities/i18nDictionary.ts`, and the locale lists hard-coded in `scripts/i18n/*` and `src/app/api/catalog/route.ts`.

UI strings live in `messages/*.json` (loaded in `src/i18n/request.ts` as namespaces `Common`, `Metadata`, `Pages`, `Policies`). CMS content is localized per-field in Payload. `scripts/i18n/translate-messages.mjs` machine-translates the JSON catalogs from `en`; `translate-payload.mjs` does the same for CMS docs and only writes with `--apply`.

### Content model and data flow

- Collections in `src/collections`, globals in `src/globals`, Lexical blocks in `src/blocks`. `Products`, `variants`, `carts`, `orders`, `transactions`, `addresses` come from `@payloadcms/plugin-ecommerce`; `src/plugins/index.ts` overrides them (Products via `src/collections/Products`, extra DDP/voucher/locale fields on orders and transactions, Stripe adapter). Product schema changes therefore may live in `src/plugins/index.ts`, not only in `src/collections`.
- Storefront pages never call Payload directly. They go through `src/lib/data/storefront.ts`, which wraps `getPayload` queries in React `cache` + `unstable_cache`, strips internal cost fields (`targetBOMUSD`, `ikeaBenchmarkPrice`, …) because queries run with `overrideAccess: true`, and falls back to static copy in `src/data` and `src/utilities/i18nDictionary.ts` when the CMS is empty or unreachable.
- Cache invalidation: collection/global hooks call `revalidateStorefrontTag` (`src/utilities/revalidate.ts`) on change.
- `payload.config.ts` `onInit` self-provisions on boot: ensures the admin user (`INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD`), seeds initial content and translations, and runs the full catalogue seed (`src/scripts/seed-flatpack.ts`) only when `products` is empty. `PAYLOAD_RUN_MIGRATIONS=true` applies the bundled baseline migration in `src/migrations` and is only safe on an empty database.
- Access control helpers are in `src/access` and are passed into the ecommerce plugin.

### Commerce and checkout

`src/lib/commerce` holds all pricing logic and is what `tests/commerce-contract.test.ts` covers. Key pieces: `ddp.ts` (supported destinations, DDP zones, quote math), `checkoutQuote.ts` (resolves cart lines against live products/variants, fails closed on unavailable or truncated data), `catalogEligibility.ts`, `storefrontCart.ts` (client cart shape and legacy migration), `vouchers.ts`/`voucherServer.ts` (HMAC swatch vouchers), `stripeDDPAdapter.ts`. Checkout is fail-closed: `readCheckoutConfig` only enables it when `CHECKOUT_ENABLED=true` and all three Stripe env values are present and in the same mode. The list of accepted countries must stay identical across `ddp.ts`, the quote endpoint, the cart selector, and the Payload addresses config.

### SEO / GEO

Canonical host is always `https://theflatset.com` via `src/utilities/canonicalUrl.ts`, which deliberately ignores `localhost`/`canbee.cn` values of `NEXT_PUBLIC_SITE_URL` so build-time dummies never leak into metadata. `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/llms.txt`, and `src/app/llms-full.txt` are route handlers, not static files. `PROJECT.md` documents the SEO feature inventory and the metadata contracts.

### Storefront UI

Page-level React lives in `src/components/moduliv` (`ModulivHomepage`, `ProductDetail`, `KitBuilder`, `CartView`, `SiteHeader`/`SiteFooter`); `EcommerceRoot` in the locale layout provides the cart/checkout context. Motion helpers use GSAP (`src/components/motion`). Payload block renderers are in `src/blocks/*`.

## Reference docs

`docs/06-product-addition-and-catalog-guide.md` defines the hard product intake rules (zero screws, ≤ 24 kg per box, ≤ 160 cm longest side, ≥ 55 % margin) and the admin fields to fill when adding a product. `docs/05-*` and `docs/06-brand-vi.md` hold the design tokens and brand rules. `.plans/` and `PROJECT.md` are historical planning context, not open tasks.
