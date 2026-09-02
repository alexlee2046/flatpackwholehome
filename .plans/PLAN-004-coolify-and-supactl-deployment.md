# PLAN-004: 基于 Coolify CLI 与 supactl 的生产容器化部署方案

## 1. 目标与背景

当前本项目（MODULIV / The Flat Set）已成功完成 Payload CMS 3.x 后端接入、PostgreSQL 数据库持久化及 7 国多语言国际化体系构建。
为了将系统部署至自建多节点集群，需利用团队现有的两大核心运维 CLI 工具：
1. **`supactl`**：通过内部控制平面 (`project-control-plane`) 在 `internal-production` (`dev-r730xd`) 上创建并编排独立的 Supabase / PostgreSQL 项目实例，托管高可用生产数据库与认证存储。
2. **`coolify cli`**：在 Coolify 自动化部署集群中创建专属工程与应用，通过定制的多阶段 Docker 镜像自动化拉取、构建、注入环境变量、绑定网络与反向代理，实现全站一键上线。

---

## 2. 部署流程与系统拓扑

```mermaid
flowchart TD
    classDef input fill:#2563eb,stroke:#1d4ed8,color:#ffffff;
    classDef process fill:#16a34a,stroke:#15803d,color:#ffffff;
    classDef output fill:#ea580c,stroke:#c2410c,color:#ffffff;

    subgraph Step1 ["输入阶段 (Input)"]
        SRC["本地代码库与依赖 (Git / Next.js / Payload)"]:::input
        ENV_CFG["生产环境变量清单 (.env.production)"]:::input
        SUPA_CTX["supactl 环境上下文 (r730xd)"]:::input
        COOL_CTX["coolify 上下文 (100.66.51.75:8443)"]:::input
    end

    subgraph Step2 ["编排与构建阶段 (Process)"]
        DOCKER["编写生产级 Dockerfile & .dockerignore"]:::process
        HEALTH["新增生产健康检查探针 /api/health"]:::process
        GIT_PUSH["创建 GitHub 远程仓库并推送代码"]:::process
        SUPA_PROV["supactl create flatpackwholehome 实例配置"]:::process
        COOL_PROJ["coolify project create & app create 自动化声明"]:::process
        COOL_ENV["coolify app env 注入生产环境密钥与 DB 凭据"]:::process
        BUILD_RUN["Coolify 容器镜像构建与 Traefik/Caddy 路由绑定"]:::process
    end

    subgraph Step3 ["产出阶段 (Output)"]
        STOREFRONT["MODULIV 生产商城入口 (HTTPS)"]:::output
        CMS_ADMIN["Payload 生产管理后台 (/admin)"]:::output
        PG_INSTANCE["Supabase / PG 专属独立数据库"]:::output
        HEALTH_CHECK["7×24 自动化健康监控"]:::output
    end

    SRC --> DOCKER
    SRC --> HEALTH
    HEALTH --> GIT_PUSH
    DOCKER --> GIT_PUSH

    ENV_CFG --> COOL_ENV
    SUPA_CTX --> SUPA_PROV
    SUPA_PROV --> COOL_ENV
    COOL_CTX --> COOL_PROJ

    GIT_PUSH --> BUILD_RUN
    COOL_PROJ --> BUILD_RUN
    COOL_ENV --> BUILD_RUN

    BUILD_RUN --> STOREFRONT
    BUILD_RUN --> CMS_ADMIN
    SUPA_PROV --> PG_INSTANCE
    BUILD_RUN --> HEALTH_CHECK
```

---

## 3. 代码级别与配置实施指南

### 3.1 容器化构建文件定义
- **`Dockerfile`**：
  采用与参考项目 `odsai` 一致的高效轻量多阶段构建（Node 22 Bookworm Slim + pnpm 10.14.0）：
  ```dockerfile
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
  ENV PAYLOAD_SECRET=build-only-secret-dummy
  ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
  ENV NEXT_PUBLIC_SITE_URL=http://localhost:3000
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

  USER nextjs
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail http://127.0.0.1:3000/api/health || exit 1

  CMD ["node", "server.js"]
  ```

- **`.dockerignore`**：
  ```
  node_modules
  .next
  .git
  .plans
  .cursor
  tests
  *.log
  ```

- **健康检查探针路由 `src/app/api/health/route.ts`**：
  提供毫秒级响应的轻量 HTTP 200 状态检查，供 Coolify / Docker Swarm 进行容器就绪探活。

### 3.2 代码同步与 GitHub 远程仓库设置
- 初始化并关联远程仓库：
  - 检查或创建 GitHub 仓库（通过 `gh repo create alexlee2046/flatpackwholehome --private`）。
  - 推送当前 `master` 分支至 GitHub。

### 3.3 通过 `supactl` 编排数据库资源
- **操作步骤**：
  1. 审查当前上下文与就绪状态：
     `supactl context` 与 `supactl list`。
  2. 请求创建独立生产实例：
     `supactl create flatpackwholehome`。
  3. 获取项目元数据与 PostgreSQL 连接配置，核对状态为 `ready`。

### 3.4 通过 `coolify cli` 编排应用与部署
- **创建项目与环境**：
  - 执行 `coolify project create --name "flatpackwholehome" --description "MODULIV Japandi Furniture Storefront & Payload CMS"`
- **创建应用资源**：
  - 绑定生产目标服务器（`yg2nv1eeyzvrepaasi50godh` 或目标 server-uuid）。
  - 执行 `coolify app create public`（或关联部署密钥），指定 `dockerfile` 构建包、端口 `3000`、分支 `master`。
- **配置环境变量**：
  - 注入 `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SITE_URL`, `PAYLOAD_PUBLIC_SERVER_URL` 等运行时变量。
- **触发部署与监控**：
  - 执行部署指令，实时抓取部署日志，验证容器健康检查与域名解析。

---

## 4. 潜在风险分析与应对措施

| 风险类别 | 潜在问题/隐患 | 严重度 | 针对性应对策略 |
| :--- | :--- | :---: | :--- |
| **Docker 独立构建失败** | Next.js standalone 模式缺少静态资源或环境变量校验失败 | 高 | 在 builder 阶段注入虚拟 build-time 环境变量；确保 `next.config.ts` 的 `output: "standalone"` 与 `server.js` 完备；在本地先运行一次 `docker build` 烟雾测试。 |
| **数据库外网连接受阻** | `supactl` 创建的数据库若在 Tailscale 内部私网 (`ts.net`)，Coolify 容器无法直接解析内网 DNS | 高 | 预先核查 Coolify 目标服务器与 `dev-r730xd` 之间的网络互通性；若位于同局域网/Tailnet 则通过固定内网 IP 通信，或采用 Coolify 内嵌 Postgres 配合 `supactl` 的双模连接方案。 |
| **密钥安全性** | `SUPACTL_TOKEN` 或生产数据库密码意外泄露 | 极高 | 严格遵守 `supactl` 安全规范，绝不在日志、提示词或普通文件中打印或保存明文 Token，均通过系统 Keychain 和环境变量传递。 |
| **静态文件缺失** | `public/assets/` 下的大体积图片未包含在 Docker 镜像中导致 404 | 中 | 在 Dockerfile runner 阶段通过 `--from=builder` 完整复制 `public` 目录，并预先校验镜像体积与文件完整性。 |

---

## 5. 测试与验证策略

1. **本地 Docker 镜像构建验证**：
   - 运行 `docker build -t flatpackwholehome:test .` 验证容器镜像打包无缺失。
   - 运行临时容器并请求 `http://localhost:3000/api/health` 验证健康检查响应。
2. **supactl 实例状态验证**：
   - 执行 `supactl status <projectRef>` 确保状态为 `ready` 且 `providerState: running`。
3. **Coolify 部署就绪验证**：
   - 监控 `coolify app logs <app-uuid>`，确认 Next.js server 启动成功。
   - 远程请求生产 FQDN / 域名，验证首页、套件定制器、购物车及 `/admin` 后台均可正常交互。

---

## 6. 任务跟踪清单

- [x] [P4-01] 编写生产级 `Dockerfile`、`.dockerignore` 与健康探针 `src/app/api/health/route.ts`
- [x] [P4-02] 本地验证 Docker 镜像构建与探针接口响应
- [x] [P4-03] 配置 GitHub 远程仓库 (`alexlee2046/flatpackwholehome`) 并推送最新代码
- [x] [P4-04] 执行 `supactl create flatpackwholehome` 编排独立生产数据库实例并获取凭据
- [x] [P4-05] 通过 `coolify cli` 创建 Project 与 Application 配置
- [x] [P4-06] 通过 `coolify app env` 注入生产环境变量矩阵并绑定域名
- [x] [P4-07] 触发生产自动化部署、监控部署日志并完成全链路验收
- [x] [P4-08] 生产数据库数据播种 (Seed) 与多语言/全链路 Playwright E2E 自动化测试验收通过
