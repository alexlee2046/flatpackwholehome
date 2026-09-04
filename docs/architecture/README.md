# Software architecture

This directory is the authoritative entry point for the repository's current software architecture. It documents stable boundaries and flows, not product strategy, brand claims, deployment status, or historical plans.

## Evidence and maintenance

Executable configuration and current source are authoritative when they disagree with prose. Tests describe intended behavior but do not prove a deployment is healthy. Keep these pages synchronized with changes to composition roots, runtime boundaries, ownership, or cross-module flows; cite the smallest stable source location for material claims.

The system is one Next.js standalone runtime that composes the localized storefront with Payload Admin, REST/GraphQL APIs, and commerce behavior. PostgreSQL, Stripe, browser storage, and the persistent media volume sit outside that process. The composition is visible in `next.config.ts:14-14`, `next.config.ts:144-146`, and `src/payload.config.ts`.

## Pages

- [System context](context.md) — actors, external systems, runtime and deployment boundaries.
- [Modules](modules.md) — source ownership, dependency direction, generated boundaries, and tests.
- [Data flow](data-flow.md) — localized reads, cache invalidation, checkout, and startup initialization.

There is no separate containers page because the repository defines one deployable runtime rather than multiple independently deployed services.

## Related documentation

The root [README](../../README.md) remains the project and documentation index. The numbered files under `docs/` cover brand, commercial, copywriting, logistics, and design concerns; `.plans/` and `PROJECT.md` are historical planning or delivery records rather than architecture authority.
