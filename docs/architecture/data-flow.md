# Data flow

## Localized storefront reads

1. `src/proxy.ts` applies next-intl middleware to storefront paths while excluding API, admin, static asset, and framework paths.
2. `src/i18n/routing.ts` validates one of seven locales and uses `localePrefix: 'as-needed'`; `src/i18n/request.ts` loads the base, page, and policy message catalogs for that locale (`src/i18n/request.ts:16-24`).
3. A server page under `src/app/(app)/[locale]` sets the request locale and calls a function from `src/lib/data/storefront.ts`.
4. The data gateway initializes Payload in-process and reads localized globals or collections from PostgreSQL. These reads are cached with `unstable_cache` for 300 seconds and tagged by content type; product data uses `products` and `product-<slug>` tags (`src/lib/data/storefront.ts:133-160`).
5. Payload reads use `overrideAccess: true`. Product-returning paths remove internal economics before returning to page code (`src/lib/data/storefront.ts:10-21`).
6. When CMS data is unavailable or untranslated, individual gateway functions may return repository-owned static content or empty data. This preserves rendering but does not turn fallback products into eligible checkout items.
7. Payload collection/global hooks expire matching tags through `src/utilities/revalidate.ts:7-12`. Cache expiry remains a fallback when no matching hook runs.

The trust boundary is the server data gateway: browser components receive a deliberately narrowed rendering model, not unrestricted Payload documents.

## Checkout and order confirmation

Checkout is fail-closed. Rendering a cart or obtaining a quote does not by itself enable payment. `readCheckoutConfig` requires both the explicit checkout release switch and a complete, mode-consistent Stripe configuration (`src/lib/commerce/checkoutConfig.ts:11-13`, `src/lib/commerce/stripeConfig.ts:27-43`).

1. `CartView` hydrates working cart lines, destination, and voucher candidate from browser storage.
2. The browser sends product slugs, quantities, optional variant IDs, destination, and voucher candidate to `POST /api/checkout/quote`.
3. The quote route validates the public request and destination, then `checkoutQuote.ts` resolves published products to canonical IDs, verifies variant eligibility and inventory, and calculates product subtotal plus DDP freight/import charges from current Payload data (`src/app/(app)/api/checkout/quote/route.ts:19-40`).
4. Before payment, `CartView` requests a fresh quote. It writes the quote's canonical lines to the Payload `carts` REST endpoint and rejects the response unless cart ID, exact item fingerprint, and subtotal match (`src/components/moduliv/CartView.tsx:534-560`, `src/lib/commerce/checkoutPaymentClient.ts:184-253`).
5. The browser passes that verified cart ID to the Payload Stripe initiation endpoint. `stripeDDPAdapter.ts` checks the release gate, reloads and reprices the cart, validates addresses and identity, creates or reuses a Stripe customer, creates an idempotent PaymentIntent, and persists a pending transaction snapshot (`src/lib/commerce/stripeDDPAdapter.ts:395-535`).
6. Stripe.js confirms payment in the browser. The client then requests order confirmation; a Stripe `payment_intent.succeeded` webhook can invoke the same server confirmation path.
7. Confirmation retrieves Stripe and transaction state, starts a PostgreSQL transaction, locks transaction/cart/catalog rows, verifies the paid amount, cart snapshot, current quote, address, inventory, and refund state, then decrements inventory and writes the order, purchased cart, and successful transaction atomically (`src/lib/commerce/stripeDDPAdapter.ts:622-837`).
8. If post-payment eligibility or pricing cannot be reconciled, the adapter marks the transaction for failure/refund rather than creating an inconsistent order.

The browser never supplies an authoritative product price, DDP amount, inventory value, or order status. The public quote is advisory input to UX; initiation and confirmation independently enforce server state.

## CMS updates and cache propagation

1. An authenticated administrator changes a Payload collection or global through `/admin` or Payload APIs.
2. Payload validates access and schema, writes PostgreSQL, and runs the configured collection/global hooks.
3. Hooks call `revalidateStorefrontTag`; product changes expire the shared product tag and the changed slug, while globals and supporting collections use their own tags (`src/collections/Products/index.ts:64-73`, `src/utilities/revalidate.ts:7-12`).
4. The next affected request repopulates its `unstable_cache` entry from Payload. Unmatched cache entries may remain until their 300-second revalidation interval.

Therefore, “Publish” is not a universal synchronous push to every rendered surface; freshness depends on the tags owned by each reader and writer.

## Payload startup initialization

Payload initialization has database-writing behavior and is not a read-only health operation:

1. `src/payload.config.ts` connects the PostgreSQL adapter and conditionally registers production migrations only when `PAYLOAD_RUN_MIGRATIONS=true` (`src/payload.config.ts:95-109`).
2. `onInit` finds the configured administrator. It updates an existing administrator's non-password fields, creates one only when an initial password is present, and otherwise logs an error (`src/payload.config.ts:162-210`).
3. It seeds initial content, counts products and seeds the catalog when empty, then seeds localized CMS content (`src/payload.config.ts:213-232`).
4. Initialization errors inside this hook are logged as warnings rather than rethrown (`src/payload.config.ts:233-235`).

Commands or runtime checks that initialize Payload can therefore trigger provisioning. Confirm the target database before seed, CMS apply, migration, or non-local admin operations.
