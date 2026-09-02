FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=moduliv-build-secret-dummy
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
ENV PAYLOAD_RUN_MIGRATIONS=false
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl --fail http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
