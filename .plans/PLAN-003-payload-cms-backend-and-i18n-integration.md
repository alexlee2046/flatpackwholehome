# PLAN-003: Payload CMS 3.x 后端与多语言 (i18n) 全面接入实施计划

## 1. 计划概述与目标

基于用户最新指令：
> “你结合 payload cms 一起做吧，前端保持不变，后端全部接入 payload cms，你看下我们 ods 那个项目，在 outdoor 文件夹里面，基本上那边的东西包括多语言，等等都可以直接拿过来”

本计划旨在全面复用 `/Users/alex/Develop/outdoor/07_odsai_storefront`（ODSai 项目已验证的高可用架构与多语言体系），为 **Moduliv / The Flat Set**（整家全包扁平化装配家具体系）构建完整的企业级 Payload CMS 3.x 后端及端到端多语言动态驱动链路，同时严格保障现存前端 UI/UX（Japandi 美学、配色、版式、微交互、3D套件切换器、购物车、样板箱申领等）100% 像素级忠实还原与不变。

---

## 2. 架构设计与复用对照分析 (ODSai vs Moduliv)

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    classDef input fill:#93c5fd,stroke:#1d4ed8,stroke-width:2px,color:#0f172a;
    classDef process fill:#86efac,stroke:#15803d,stroke-width:2px,color:#0f172a;
    classDef output fill:#fdba74,stroke:#c2410c,stroke-width:2px,color:#0f172a;

    subgraph ClientLayer ["用户前端访问层 (保持不变的前端 UI/UX)"]
        A1["访客访问 /zh-CN 或 /en /ja /de /ar /ru"]:::input
        A2["Stitch 像素级组件与页面结构"]:::input
        A3["moduliv-core.js 交互 (购物车/币种/模态框)"]:::input
    end

    subgraph NextIntlRouting ["Next.js 15+ & next-intl 路由层"]
        B1["i18n 路由匹配 (src/i18n/routing.ts)"]:::process
        B2["Locale 检测与上下文注入 (src/i18n/request.ts)"]:::process
        B3["本地化字典读取 (messages/*.json)"]:::process
    end

    subgraph PayloadBackend ["Payload CMS 3.x 后端核心 (复用 ODSai)"]
        C1["Payload Local API (getPayload)"]:::process
        C2["Payload Collections (产品/套件/空间/材质/媒体/订单)"]:::process
        C3["Payload Globals (站点设置/导航/页脚/公告/首页配置)"]:::process
        C4["Payload 多语言引擎 (7种语言数据库字段)"]:::process
        C5["PostgreSQL 17 数据库适配器 (@payloadcms/db-postgres)"]:::process
    end

    subgraph OutputLayer ["数据与页面输出"]
        D1["完全静态/动态 Hydrated Storefront 渲染"]:::output
        D2["Payload Admin 管理后台 (/admin)"]:::output
        D3["REST / GraphQL / Stripe DDP 支付接口"]:::output
    end

    A1 --> B1
    B1 --> B2
    B2 --> B3
    B2 --> C1
    C1 --> C2
    C1 --> C3
    C2 --> C4
    C3 --> C4
    C4 --> C5
    A2 --> D1
    A3 --> D1
    B3 --> D1
    C1 --> D1
    C2 --> D2
    C2 --> D3
```

### 2.1 模块对应与复用清单

| 模块 | ODSai (户外家具项目) | Moduliv / The Flat Set (本项目) | 复用度与改造策略 |
| :--- | :--- | :--- | :--- |
| **运行时框架** | Next.js 15+ App Router, React 19 | Next.js 15+ App Router, React 19 | 100% 结构复用，保持一致的架构规范 |
| **CMS 核心** | `@payloadcms/next` 3.88.0 + PostgreSQL | `@payloadcms/next` 3.88.0 + PostgreSQL | 直接复用，本地已有运行中的 PG17 |
| **多语言体系 (i18n)** | `next-intl` (7国语言: en, zh-CN, zh-TW, de, ja, ar, ru) | 同样采用 `next-intl` 7国语言标准 | 直接搬运 `src/i18n/` 配置与中间件 |
| **翻译自动化工具** | `translate-messages.mjs`, `translate-payload.mjs` | 直接引入 `scripts/i18n/` | 100% 复用，支持全库批量自动化翻译 |
| **产品集合 (Products)** | 户外柚木沙发/餐桌/躺椅 | ModuSofa, SnapBed, 咖啡桌, 电视柜, 样板箱 | 复用 schema，增加扁平化箱规(`flatpackBoxes`)、免螺丝暗榫装配时长(`assemblyMinutes`) |
| **产品套件 (Bundles)** | ProductCollections (Bali, Florence...) | 1-Bedroom Full Bundle, Living Set, Bedroom Set | 复用集合模型，管理多箱套餐定价与组件拆解 |
| **空间展示 (Spaces)** | Garden, Poolside, Terrace, Hospitality | Living Room, Bedroom, Studio, Balcony | 复用集合模型，对应前端 1-bedroom-kit-builder 场景切换 |
| **材质体系 (Materials)** | Teak finishes, Sunbrella fabrics | FSC 白橡木, 黑胡桃木, 燕麦色颗粒绒(Bouclé), 苔藓绿绒布 | 复用集合模型，支持 Free Swatch Box 材质发现联动 |
| **物流与关税 (DDP)** | DDPQuotes, ShippingZones, Landed Cost | 整家大件免税专线海运 + 送货进屋，关税全包 | 复用 DDP 运算引擎与询价/计价数据模型 |
| **公共全局 (Globals)** | Header, Footer, Announcement, SiteSettings, Homepage | 注入 Moduliv 导航菜单、日式极简美学配置、促销条、币种切换 | 复用 Global Schema，数据字段精准对接前端 |

---

## 3. 代码级别变更实施指南

### 3.1 基础设施搭建与依赖对齐
- [x] **初始化 `package.json`**：
  - 对齐 `outdoor/07_odsai_storefront/app/package.json` 中的核心依赖：
    - `payload: "3.88.0"`
    - `@payloadcms/next: "3.88.0"`
    - `@payloadcms/db-postgres: "3.88.0"`
    - `@payloadcms/richtext-lexical: "3.88.0"`
    - `@payloadcms/plugin-seo: "3.88.0"`
    - `@payloadcms/plugin-ecommerce: "3.88.0"`
    - `@payloadcms/plugin-form-builder: "3.88.0"`
    - `next: "16.3.3"` (或稳定 Next 15/16)
    - `next-intl: "^3.26.0"`
    - `tailwindcss: "^4.1.18"`
    - `pg`, `sharp`, `dotenv`, `cross-env`, `tsx`
- [x] **配置文件移植**：
  - `tsconfig.json` & `next.config.ts`：配置 `withPayload`、`withNextIntl`、图片允许路径、Webpack/Turbopack 别名。
  - `.env.example` 与 `.env`：配置 `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/flatpackwholehome` 与 `PAYLOAD_SECRET`。

### 3.2 多语言 (i18n) 引擎搬运
- [x] **移植 `src/i18n/` 模块**：
  - `routing.ts`：定义 7 大语言代号 (`en`, `zh-CN`, `zh-TW`, `de`, `ja`, `ar`, `ru`)，方向支持 (`rtl` for Arabic)，默认语言 `en`。
  - `request.ts`：服务端请求上下文与消息字典加载器。
  - `navigation.ts`：封装本地化 `<Link>`、`useRouter`、`usePathname`。
  - `getPayloadLocale.ts`：将 Next.js 请求语言自动映射至 Payload 数据库请求 Locale。
  - `pageMetadata.ts` & `metadata.ts`：多语言 SEO 元数据生成器。
- [x] **移植并建立 `messages/` 词典目录**：
  - 提取当前 `stitch/` 页面中所有的通用 UI 文本（导航条、套件构建器控制项、购物车结算、样板盒申请、FAQ 过滤、页脚条款等），生成标准化 `messages/en.json`，并由自动化脚本衍生对应各语言词典。
- [x] **移植翻译自动化脚本**：
  - 将 `outdoor/07_odsai_storefront/scripts/i18n/translate-messages.mjs` 和 `translate-payload.mjs` 完整引入本项目的 `scripts/i18n/` 目录下。

### 3.3 Payload CMS 配置与 Collections / Globals 适配
- [x] **创建 `src/payload.config.ts`**：
  - 配置 PostgresAdapter 数据库连接池。
  - 配置多语言支持：
    ```ts
    localization: {
      defaultLocale: 'en',
      defaultLocalePublishOption: 'active',
      fallback: false,
      locales: [
        { code: 'en', label: 'English' },
        { code: 'zh-CN', label: '简体中文' },
        { code: 'zh-TW', label: '繁體中文' },
        { code: 'de', label: 'Deutsch' },
        { code: 'ja', label: '日本語' },
        { code: 'ar', label: 'العربية', rtl: true },
        { code: 'ru', label: 'Русский' },
      ],
    }
    ```
- [x] **构建 Collections**：
  - `Products`：标题、副标、Slug、分类、空间关联、单价、箱规详情（Box 1~Box 6）、材质选项、组装难度/耗时、3D模型文件/图集。
  - `ProductCollections`：全屋套餐 (1-Bedroom, Studio, Living Set, Bedroom Set) 及对应子产品拆包规则与组合定价。
  - `Spaces`：客餐厅、主卧、小户型、多功能空间等分类（支持 Kit Builder 实时联动）。
  - `Materials`：木种（白橡木/黑胡桃）、织物（Bouclé/亚麻/绒面）、色卡、样板箱支持。
  - `Media`：高分辨率实拍图、渲染图、拆装图解、说明书 PDF。
  - `DDPQuotes` & `ShippingZones`：目的地国家/邮编、运费及关税全包预估计算。
  - `TradeEnquiries` & `ContactEnquiries`：整家批量定制与咨询线索。
- [x] **构建 Globals**：
  - `Header`：顶部导航链接、多语言切换器、币种切换器配置。
  - `Footer`：法律条款、社媒、品牌介绍。
  - `SiteSettings`：品牌全称（Moduliv Studio / The Flat Set）、货币、SEO 默认描述。
  - `Announcement`：置顶全站通告栏配置。
  - `Homepage`：主页 Hero 区域、重点套件推广位、背书指标（45分钟免工具拼装/6箱到家/100天试用）。

### 3.4 前端界面无缝结合策略 ("前端保持不变")
- [x] **静态资源与模板衔接**：
  - 将 `stitch/assets/` 与媒体文件挂载至 `public/assets/`。
  - 维持 `stitch/moduliv-core.js` 作为轻量高内聚的全局客户端行为核心（购物车交互、全局搜索弹窗、币种切换器、法律条款弹窗），并在 Next.js 页面中无缝调用。
- [x] **路由与页面组件封装 (在 `src/app/(app)/[locale]/` 维持原汁原味 HTML/Tailwind 结构)**：
  - `/` (首页)：复用 `stitch/index.html` 完美结构，Hero 轮播与推荐商品接入 Payload `Homepage` Global 与 `Products` Collection。
  - `/kit-builder` 或 `/1-bedroom-kit-builder`：复用 `stitch/1-bedroom-kit-builder.html`，保留原有的全屋/客厅/卧室动态箱规切换逻辑，商品数据来自 Payload `ProductCollections`。
  - `/products/[slug]` (例如 `/modusofa`)：复用 `stitch/modusofa-product-detail-page.html`，动态从 Payload `Products` 读取规格参数与图集。
  - `/swatch-box`：复用 `stitch/free-swatch-box-material-discovery.html`，材质数据从 Payload `Materials` 动态拉取。
  - `/how-it-works`：复用 `stitch/how-it-works-craft-logistics.html`。
  - `/cart` & `/checkout`：复用 `stitch/cart.html`，动态同步 `window.modulivCart` 并接入 Payload Orders API。
  - `/faq`：复用 `stitch/faq.html`，支持动态 FAQ 条目检索与分类展示。
  - `/(payload)/admin`：保留完整的 Payload 管理面板。

### 3.5 种子数据 (Seed Script) 自动化写入
- [x] **编写 `src/scripts/seed-flatpack.ts`**：
  - 将当前 `stitch/*.html` 中的所有真实商品（ModuSofa、1-Bedroom 套装、白橡木/黑胡桃木材质、6大包装箱规参数、FAQ 条目）预先结构化为初始种子数据。
  - 自动创建默认管理员、初始化 Globals、插入 Products 与 Materials，确保一键运行即可拥有开箱即用的完整 CMS 内容。

---

## 4. 潜在风险分析与应对措施

| 风险类别 | 潜在问题/隐患 | 严重度 | 针对性应对策略 |
| :--- | :--- | :---: | :--- |
| **视觉与样式漂移** | Next.js/Tailwind 4 编译环境与静态 HTML 中的 class 产生冲突或丢失细节 | 高 | 严格保留原 CSS 与字体设置（Cinzel, Playfair, Newsreader, Inter），直接复用已验证的 HTML 结构与 Tailwind 变量，不做样式重写。 |
| **多语言动态路由冲突** | 静态页面原有的相对路径（如 `cart.html`, `faq.html`）在多语言动态路由 `/[locale]/` 下失效 | 中 | 在 `moduliv-core.js` 与链接层自动注入当前 locale 前缀，利用 `wire.py` 与 Next.js `rewrites`/`redirects` 兜底兼容。 |
| **数据库初始化与连接** | PostgreSQL 未创建专属数据库或认证失败 | 中 | 预先在本地 PG17 中创建专属数据库 `createdb flatpackwholehome`，提供完备 `.env` 模板。 |
| **Node.js 运行时版本** | 机器运行 Node v26，可能与部分原生构建库 (sharp 等) 产生兼容告警 | 低 | 使用 pnpm 锁定依赖；通过 `pnpm.onlyBuiltDependencies: ["sharp"]` 保证平稳构建。 |

---

## 5. 测试与验证策略

1. **CMS 本地编译与构建验证**：
   - 运行 `pnpm generate:types` 验证 Payload 集合类型生成。
   - 运行 `pnpm generate:importmap` 验证管理后台组件映射。
   - 运行 `pnpm build` 确认 Next.js + Payload 生产构建零报错。
2. **多语言与路由验证**：
   - 测试访问 `/en`, `/zh-CN`, `/ja`, `/de`，确认页面语言随路由自动切换，UI 无错位。
   - 测试访问后台 `/admin`，确认管理面板正常登录、内容可自由发布并在前台即时生效。
3. **前端功能与交互回归测试**：
   - 复用 Playwright 自动化脚本，验证 1-Bedroom 套装箱规切换、ModuSofa 选配、Swatch Box 申请、优惠码输入、购物车持久化等交互完全无损。

---

## 6. 任务跟踪清单

- [x] [P3-01] 审查并初始化项目 `package.json`、`tsconfig.json` 与 Next.js/Payload 依赖配置
- [x] [P3-02] 创建本地数据库 `flatpackwholehome` 并配置 `.env` 环境变量
- [x] [P3-03] 搬运并配置 `src/i18n/` 模块与 7 种语言核心词典骨架
- [x] [P3-04] 配置 `src/payload.config.ts`、定义 Collections (Products, Spaces, Materials 等) 与 Globals
- [x] [P3-05] 编写自动化种子数据脚本 `src/scripts/seed-flatpack.ts` 并完成初次入库
- [x] [P3-06] 封装 Next.js Storefront 页面 (`[locale]/page.tsx`, `kit-builder`, `products/[slug]`, `cart` 等)
- [x] [P3-07] 迁移翻译自动化脚本 `scripts/i18n/` 并验证多语言翻译管线
- [x] [P3-08] 端到端功能回归与 Playwright 自动化验证
