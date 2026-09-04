# CLAUDE.md

@AGENTS.md

Next.js 16 App Router + Payload CMS 3 (Postgres) + `next-intl` + Stripe via `@payloadcms/plugin-ecommerce`. One app hosts storefront and `/admin`. Package manager `pnpm`, Node >= 20.9. `cp .env.example .env` to configure; `DATABASE_URL` and `PAYLOAD_SECRET` have dev fallbacks, and only `NODE_ENV=production` without `PAYLOAD_SECRET` fails to boot.

## Commands

| Task | Command |
| --- | --- |
| Dev server (port 3000) | `pnpm dev` |
| Typecheck (CI gate) | `pnpm exec tsc --noEmit` |
| Lint (CI gate, errors only) | `pnpm exec eslint --max-warnings=-1` |
| Unit tests (node:test, no DB) | `pnpm test:commerce` |
| Single test by name | `pnpm exec tsx --test --test-name-pattern="<pattern>" tests/commerce-contract.test.ts` |
| Browser E2E against a running server | `BASE_URL=http://localhost:3000 pnpm test:e2e` (also `:journey`, `:motion`, `:admin`, `:deep`) |
| Regenerate `src/payload-types.ts` / admin `importMap.js` | `pnpm generate:types` / `pnpm generate:importmap` |

CI runs exactly `tsc --noEmit`, `eslint --max-warnings=-1`, `pnpm build`. Existing `any`/unused-var warnings are tolerated but must not grow.

## Gotchas

- Regenerate `payload-types.ts` and `importMap.js` whenever `src/collections`, `src/globals`, `src/blocks`, `src/plugins`, or `payload.config.ts` change, and commit the result.
- `seed:*`, `i18n:*`, `i18n:cms:apply` write to the DB or call an external LLM: confirm the target first.
- Product schema may live in `src/plugins/index.ts` (ecommerce plugin overrides), not only in `src/collections`.
- Storefront pages never call Payload directly; go through `src/lib/data/storefront.ts`. It runs with `overrideAccess: true`, so it strips internal cost fields (`targetBOMUSD`, `ikeaBenchmarkPrice`, …) and falls back to static copy when the CMS is empty.
- Adding a locale touches `src/i18n/routing.ts`, `payload.config.ts`, all three `messages/**/<locale>.json` catalogs, `src/utilities/i18nDictionary.ts`, and the locale lists hard-coded in `scripts/i18n/*` and `src/app/api/catalog/route.ts`.
- Checkout is fail-closed: enabled only when `CHECKOUT_ENABLED=true` and all three Stripe env values are present and in the same mode. The accepted-countries list must stay identical across `ddp.ts`, the quote endpoint, the cart selector, and the Payload addresses config.
- Canonical host is always `https://theflatset.com`; `canonicalUrl.ts` deliberately ignores `localhost`/`canbee.cn` in `NEXT_PUBLIC_SITE_URL`. `robots.ts` / `sitemap.ts` / `llms.txt` are route handlers, not static files.
- `pnpm build` must succeed without a reachable database (Dockerfile builds with dummy env). Never add build-time code that queries Postgres. Production: `https://flatpack.dev.canbee.cn` behind `theflatset.com`; `redirects.ts` maps legacy Stitch `*.html` URLs, keep it in sync when renaming a top-level page.
- `payload.config.ts` `onInit` self-provisions on boot: verifies an existing admin, creates one only when `INITIAL_ADMIN_PASSWORD` is set (otherwise just logs an error), seeds content, and runs the full catalogue seed only when `products` is empty. Errors inside `onInit` are logged as warnings, never thrown. `PAYLOAD_RUN_MIGRATIONS=true` is only safe on an empty database.
- On Supabase, `DATABASE_URL` must use the session-mode pooler or direct 5432. The transaction pooler (6543) breaks Payload's prepared statements and shows up as intermittent 500s (see `.env.example`).

## Reference docs

`docs/06-product-addition-and-catalog-guide.md` holds the hard product intake rules (zero screws, ≤ 24 kg per box, ≤ 160 cm longest side, ≥ 55 % margin). `docs/05-*` and `docs/06-brand-vi.md` hold design tokens and brand rules. `PROJECT.md` documents the SEO inventory. `.plans/` and `PROJECT.md` are historical planning context, not open tasks.
