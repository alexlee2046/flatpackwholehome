# System context

## Responsibilities and actors

The Flat Set application serves a multilingual DTC storefront, manages content and catalog data through Payload, and supports server-priced DDP checkout.

| Actor or system | Relationship to the application |
|---|---|
| Shopper browser | Requests localized pages and public APIs, keeps the working cart and destination preference in browser storage, and loads Stripe.js only during enabled checkout. |
| Content administrator | Uses Payload Admin and authenticated Payload APIs to manage content, catalog, media, and commerce records. |
| PostgreSQL | Stores Payload collections, globals, users, carts, transactions, orders, and migration state. Payload configures the adapter in `src/payload.config.ts:95-109`. |
| Stripe | Creates and confirms payment intents and emits payment webhooks. Checkout remains unavailable unless both the explicit release gate and complete Stripe configuration pass (`src/lib/commerce/checkoutConfig.ts`, `src/lib/commerce/stripeConfig.ts`). |
| Media filesystem | Holds runtime uploads under public/media/; the container exposes that directory as a persistent volume (`Dockerfile:38-43`). |

## Application boundary

Next.js and Payload run in the same Node.js process:

- `src/app/(app)` owns localized storefront pages, preview routes, and the checkout quote/health endpoints.
- `src/app/(payload)` exposes Payload Admin plus generated REST and GraphQL route adapters.
- `src/app/api` contains additional public application APIs.
- `src/payload.config.ts` composes PostgreSQL, collections, globals, plugins, localization, startup behavior, and the Payload secret.

`next.config.ts:14-14` selects standalone output, while `next.config.ts:144-146` composes next-intl and Payload around the Next.js configuration. PostgreSQL, Stripe, browser storage, and persistent media are dependencies, not separately deployed units owned by this repository.

## Build and runtime contract

- CI and the Docker builder supply placeholder database configuration while running type checking, lint, import-map generation, and the Next.js build (`.github/workflows/ci.yml`, `Dockerfile:12-21`). Those values do not establish a live build-time database dependency.
- The production image runs `.next/standalone` as an unprivileged Node.js user on port 3000 (`Dockerfile:23-51`).
- `/api/health` initializes Payload and queries the products collection; inability to initialize or query PostgreSQL returns HTTP 503 (`src/app/(app)/api/health/route.ts:7-41`).
- Production startup requires a real `PAYLOAD_SECRET`; the development configuration has a fallback. Runtime database connectivity is required for Payload-backed behavior (`src/payload.config.ts:95-109`, `src/payload.config.ts:238-247`).

These are repository-defined contracts, not evidence that any named production URL is currently deployed or healthy.
