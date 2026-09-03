# The Flat Set (MODULIV) 新产品录入与工程箱规设计手册

> **文档定位**：供团队在后续扩展产品库（如新增餐桌、餐椅、书柜、矮几、儿童床等）时遵循的标准化工程规范与后台操作指引。

---

## 一、 核心准入原则（Four Gatekeeper Rules）

任何准备加入 The Flat Set 的新产品，必须同时满足以下四大硬性工程与商业门槛：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       【新产品准入 4 大硬门槛】                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. 零螺丝组装 (Zero Screws)  : 严禁采用外露螺丝与传统六角扳手；必须采用自锁铰链│
│                                或高精度 CNC 榫卯公母槽插接，单人 15 分钟内完成。│
│ 2. 单箱重量限值 (≤ 24 kg)    : 单一包装箱毛重绝对不得超过 24kg（入户电梯/单人搬运│
│                                及规避国际快递 Overweight 超重重罚）。            │
│ 3. 极限定位尺寸 (≤ 160 cm)   : 外箱最长边 ≤ 160cm，且 长 + 2×(宽+高) ≤ 300cm， │
│                                彻底免除 FedEx/UPS 超长超大件附加费 ($150/件)。   │
│ 4. 履约毛利率底线 (≥ 55%)    : [零售售价 - 出厂采购BOM - 18元/kg海派运费] ÷ 零售价│
│                                必须 ≥ 55%（保证在比宜家便宜 20% 下依然高盈利）。  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、 包装箱规与体积重核算标准

跨国海派及尾程派送采用**体积重与实重对比取大者**规则。

* **标准换算比**：`1 CBM = 167 kg`（公式：`体积重 (kg) = 长(cm) × 宽(cm) × 高(cm) / 6000`）
* **单箱包装优化法**：
  * **软体家具（沙发垫/靠背/床垫）**：必须使用 200℃ 现压真空压缩袋，入箱体积需压缩 65%~70%；
  * **板式/实木（桌面/柜体/床架）**：必须平放堆叠（Flat-packed），单箱厚度控制在 6~12cm 内；
  * **五金配件**：工厂必须预装于板件内或使用磁吸卡扣，严禁零散螺丝袋。

---

## 三、 在 Payload CMS 后台录入新产品步骤

1. 登录管理员后台：`https://yourdomain.com/admin` 或本地 `http://localhost:3000/admin`；
2. 导航至 **Collections > Products**，点击右上角 **Create New**；
3. **填写基础信息 (Content Tab)**：
   * `Title`: 单品英文标准命名（如 `FlatDining 4-Person Table`）
   * `Subtitle`: 极简一句话主张（如 `CNC mortise & tenon solid oak dining table. 1 flat box, 15 min, 0 screws.`）
   * `Slug`: URL 路径（全小写连字符，如 `flatdining-table`）
   * `Price (USD)`: 终端售价（美金包邮包税一口价）
4. **填写工程与比价底牌 (Product Details Tab)**：
   * `IKEA Benchmark Price`: 对标宜家同类美区售价（美金，系统自动计算直降百分比）
   * `Target BOM (USD)` / `Target BOM (RMB)`: 出厂采购目标成本（美元及人民币）
   * `Shipping Weight (kg)`: 包装毛重总计（kg）
   * `Packed Volume (CBM)`: 外箱总体积（$长 \times 宽 \times 高$ 立方米）
   * `Box Count`: 外箱件数（几箱装）
   * `Assembly Minutes`: 免工具预估组装耗时（分钟）
   * `Joinery Type`: 结构工艺名称（如 `Tool-Free Japandi Mortise & Tenon`）
   * `Box Breakdown`: 逐箱详细尺寸、单箱重量与部件说明
5. **关联关系**：
   * `Material`: 关联材质库（白橡木 / 黑胡桃 / 燕麦雪尼尔等）
   * `Spaces`: 关联空间场景（Living / Bedroom / Dining）
6. 点击 **Publish** 立即发布，前台商品详情页与比价卡片自动实时渲染！

---

## 四、 快速参考模板 (`src/data/product-template.json`)

系统已内置标准的 JSON 模板文件 [`src/data/product-template.json`](file:///Users/alex/.herdr/worktrees/flatpackwholehome/worktree-brave-river-8740/src/data/product-template.json)，后续批量导入或脚本同步时直接复制该格式即可。
