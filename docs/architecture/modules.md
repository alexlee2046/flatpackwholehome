# Modules

## Composition and request surfaces

| Boundary | Ownership | Dependencies and evidence |
|---|---|---|
| Application composition | `next.config.ts` composes Next.js, next-intl, and Payload; `src/payload.config.ts` composes database, schema, plugins, localization, and startup hooks. | The Next.js build emits one standalone runtime (`next.config.ts:14`, `next.config.ts:144-146`). Payload registers collections, globals, and plugins in `src/payload.config.ts:77-94`, `src/payload.config.ts:147`, and `src/payload.config.ts:237`. |
| Localized storefront | `src/app/(app)` owns localized pages, preview handling, health, checkout quote, and enquiry routes. | Locale layouts install next-intl and ecommerce providers before rendering page UI (`src/app/(app)/[locale]/layout.tsx:70-140`). |
| Payload surface | `src/app/(payload)` mounts Payload Admin, REST, GraphQL, and GraphQL Playground in the same application. | The catch-all REST adapter exports Payload handlers in `src/app/(payload)/api/[...slug]/route.ts:14-20`; the Payload layout binds config and the generated import map in `src/app/(payload)/layout.tsx`. |
| Public machine endpoints | `src/app/api` owns catalog and geo APIs; root modules under `src/app` own robots, sitemap, and machine-readable text routes. | `src/proxy.ts` excludes API, metadata, and static asset paths from locale middleware; each endpoint is implemented by its route module. |

## Internal ownership

### Storefront UI

`src/components/moduliv` owns interactive storefront presentation and browser state. Page modules under `src/app/(app)/[locale]` select locale, metadata, and server data, then pass normalized data into those components. The root locale layout is the shared provider boundary for translations and ecommerce configuration (`src/app/(app)/[locale]/layout.tsx:70-140`).

The browser cart is not pricing authority. `CartView` persists a working cart locally, requests a server quote, creates and verifies a fresh Payload cart, and then starts payment (`src/components/moduliv/CartView.tsx:534-560`).

### Server-side storefront data

`src/lib/data/storefront.ts` is the storefront's server-side Payload read gateway. It owns CMS queries, five-minute Next.js data caches, locale-aware fallbacks, and removal of internal product economics. Product reads use `overrideAccess: true`, so this boundary must strip protected fields before documents can reach rendering code (`src/lib/data/storefront.ts:10-21`).

Storefront page modules should consume this gateway instead of opening unrelated Payload queries. Public API routes that intentionally expose a different contract, such as `src/app/api/catalog/route.ts`, own their explicit field selections and fail-closed response shape.

### Commerce domain

`src/lib/commerce` owns catalog eligibility, cart normalization, address validation, DDP calculations, quote contracts, checkout release configuration, Stripe integration, and voucher verification.

- `checkoutQuote.ts` resolves browser slugs and variant IDs to canonical Payload IDs and derives prices and inventory from current server-side catalog records.
- `checkoutPaymentClient.ts` is browser-safe orchestration for verifying the server-created cart and calling Payload payment endpoints (`src/lib/commerce/checkoutPaymentClient.ts:184-317`).
- `checkoutConfig.ts` enables checkout only when the explicit release switch and complete Stripe configuration both pass (`src/lib/commerce/checkoutConfig.ts:11-13`).
- `stripeDDPAdapter.ts` is the server payment boundary. It reprices carts, writes transaction snapshots, calls Stripe, and confirms orders under database row locks.

The quote route is an adapter around this domain rather than a second pricing implementation (`src/app/(app)/api/checkout/quote/route.ts:19-40`).

### Payload schema and access

`src/payload.config.ts` is the Payload composition root. Repository-owned schema is distributed across:

- `src/collections` for explicit collections and collection overrides;
- `src/globals` for global site content and settings;
- `src/blocks` and `src/fields` for reusable schema fragments;
- `src/access` for access predicates;
- `src/plugins/index.ts` for SEO, forms, and ecommerce-generated collections and overrides.

The product, order, transaction, variant, cart, and payment shape is not defined by `src/collections` alone. The ecommerce plugin installs those surfaces and applies repository overrides, including `ProductsCollection` and the Stripe DDP adapter (`src/plugins/index.ts:137-236`).

### Localization

`src/i18n` owns locale routing, request catalog loading, navigation helpers, and localized metadata. `messages`, `messages/pages`, and `messages/policies` hold browser-visible catalogs loaded for each request (`src/i18n/request.ts:16-24`). Payload localization is configured separately in `src/payload.config.ts`, while `translations` holds CMS translation artifacts.

The supported locale set is repeated at integration boundaries, including Payload and the public catalog API. A locale change therefore requires reviewing every explicit locale list rather than changing only `src/i18n/routing.ts:3-26`.

### Cache invalidation

Payload hooks in collections and globals call `src/utilities/revalidate.ts`. That helper expires a supplied cache tag and revalidates the root layout (`src/utilities/revalidate.ts:7-12`). Each hook must use tags that match the corresponding `unstable_cache` declaration; product hooks currently invalidate `products` and the changed product slug (`src/collections/Products/index.ts:64-73`).

## Generated and runtime-owned paths

- `src/payload-types.ts` is generated from Payload schema by `pnpm generate:types`.
- `src/app/(payload)/admin/importMap.js` is generated by `pnpm generate:importmap`.
- `.next` is Next.js build output.
- The configured media upload directory is runtime storage and is mounted as a persistent container volume.

Change schema sources first, then regenerate only the affected tracked outputs. Do not treat generated files as schema ownership points.

## Tests

`tests/commerce-contract.test.ts` is the maintained database-free contract suite for cart migration, variant selection, server quotes, voucher rejection, and cart verification (`tests/commerce-contract.test.ts:70-168`). The `test:e2e*` scripts exercise browser journeys against a running server. Files named `tests/challenger-*` or `tests/verify-*` are historical one-off checks rather than default gates.
