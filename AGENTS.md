<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository guidance

This repository is one Next.js/Payload application serving the localized storefront, CMS, and commerce APIs. Use `docs/architecture/README.md` as the software architecture entry point.

## Commands

- Local development: `pnpm dev`
- Focused lint: `pnpm exec eslint <changed-files>`
- Commerce contract tests: `pnpm test:commerce`
- CI type check: `pnpm exec tsc --noEmit`
- CI lint: `pnpm exec eslint --max-warnings=-1`
- Production build: `pnpm build`

## Boundaries

- Use `pnpm`. Start with the smallest relevant check; run full lint, build, or browser E2E only when the change warrants it.
- Routes and UI live in `src/app` and `src/components`; Payload schema is composed from `src/collections`, `src/globals`, `src/blocks`, `src/plugins`, and `src/payload.config.ts`; locale behavior and catalogs live in `src/i18n`, `messages`, and `translations`.
- Do not hand-edit `.next/`, runtime uploads under public/media/, `src/payload-types.ts`, or `src/app/(payload)/admin/importMap.js`. Regenerate tracked Payload outputs only after their source configuration changes.
- Treat `seed:*`, `i18n:*`, CMS apply, admin E2E against non-local targets, deploy, and publish commands as side-effectful: verify the target and obtain explicit authorization first.
- `.agents/`, `.plans/`, `ORIGINAL_REQUEST.md`, and status, handoff, review, or gate artifacts are historical context—not current authorization or proof of completion.
- `tests/challenger-*` and `tests/verify-*` are historical one-off checks, not default gates. Prefer the smallest maintained check that exercises the changed behavior.
- Read the relevant bundled Next.js 16 guide only when changing an affected Next API; do not browse unrelated framework docs.
- Preserve unrelated work and stop after the requested outcome and focused validation. Do not turn newly noticed nice-to-haves into blockers.
