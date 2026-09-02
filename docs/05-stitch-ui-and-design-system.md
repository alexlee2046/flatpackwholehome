# Stitch UI 设计系统与生成页面清单 (Stitch UI & Design System Specs)

> **Stitch Project ID**: `1318977181840355780`  
> **Stitch Project Title**: `MODULIV — Whole-Home Flat-Pack Living System`  
> **设计系统名称**: `Warm Minimalist Editorial (Japandi)`  
> **Design System Asset**: `assets/ccec2497a9a34d4f83eaccfd96147a37`

---

## 1. 设计系统规范 (Design System Tokens)

### 1.1 品牌色彩体系 (Color Palette)

| 颜色角色 (Role) | 颜色名 (Name) | HEX 编码 | 使用场景 |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | Warm Porcelain | `#F9F8F6` | 全站主底色，柔和纸质触感，降低视觉疲劳 |
| **Primary Typography** | Basalt Charcoal | `#1A1C1D` | 标题与高对比正文，干净利落 |
| **Brand Accent / CTAs** | Terracotta / Warm Oak | `#A85F3B` | 主按钮、限时优惠徽章、价格高亮、自锁指示器 |
| **Secondary Accent** | Soft Sage | `#545C50` | 环保/可持续标签、现压品质认证标签 |
| **Structural Borders** | Hairline Stone | `#EBEAE8` | 1px 极细卡片与模块分割线，增强建筑感 |
| **Elevated Surfaces** | Clean White | `#FFFFFF` | 产品卡片背景、下拉弹窗与购买浮层 |

### 1.2 字体排印规范 (Typography Pairing)

* **Display & Headline (大标题与社论标题)**：`Playfair Display`（600 Semi-Bold / 500 Medium）
* **Body & Technical Specs (正文与参数)**：`Plus Jakarta Sans`（400 Regular / 600 Semi-Bold）
* **Navigation & Metadata (导航与标签)**：`Plus Jakarta Sans` (12px / 14px Uppercase with `0.05em` letter-spacing)

### 1.3 空间网格与圆角 (Grid & Shapes)

* **Grid System**: 12-Column Desktop Grid (Max-width: 1440px), 8px 基础节奏
* **Corner Radius**:
  * 按钮与输入框：`4px` (Gently Squared)
  * 产品卡片与大图容器：`8px` (Soft Minimalist)
* **Shadows**: 摒弃厚重弥散投影，采用 Tonal Layering（色块层叠）与 Whisper-soft Shadow (`0px 4px 20px rgba(26, 28, 29, 0.04)`)

---

## 2. 已生成的 5 大核心 UI 页面

### 页面 1：独立站首页 (Homepage Desktop)
* **Screen ID**: `09ac5b66726d49a291227264f25bb34c`
* **核心内容**：
  * **Hero 视觉**：左侧 6 个整齐平放的牛皮纸箱，右侧蜕变为阳光洒满的原木奶油风 Japandi 客厅与卧室样板间；
  * **主标语**：“Your Entire Home. Delivered in 6 Flat Boxes.”
  * **Trust Strip**：1-Person Lift、0-Tool 5-Min Assembly、100-Night In-Home Trial；
  * **Move-In Bundles 展区**：3 套高客单一键搬家套餐；
  * **5 大系统分类轨**：坐具、桌几、睡眠、收纳、办公；
  * **现压保鲜 vs 仓库死库存对比矩阵**；
  * **0 螺丝榫卯与自锁五金 3D 爆炸拆解图**；
  * **UGC 开箱 ASMR 视频流与 $0 面料小样盒入口**。

---

### 页面 2：全屋一键入住套餐定制页 (Move-In Bundles & Room Kit Builder)
* **核心内容**：
  * **左右分屏联动设计**：
    * 左侧：3D 样板间交互渲染 + 6 箱体积重量清单（总计 0.51 CBM / 102kg，电梯 100% 可进提示）；
    * 右侧：4 步快速选配流（面料颜色 ➔ 木作饰面 ➔ 床架尺寸 ➔ 增购床垫与小样）；
  * **动态价格核算**：原价 $1,894 ➔ 套装特惠价 **$1,499.00（立省 $395.00）**；
  * **DDP 门到门包税声明** 与以捐代退无忧保障。

---

### 页面 3：核心爆款商详页 (PDP: The ModuSofa 3-Seater)
* **核心内容**：
  * **多维度图集**：多场景样板间、15+ 种面料细节微距、自锁五金卡扣特写、扁平纸箱入户示意图；
  * **3D 内部透视图**：2英寸记忆棉 + 35D 高弹棉 + 独立袋装弹簧 + 自锁连接件；
  * **公寓微型电梯与门框通过率计算器**；
  * **全拆洗拉链结构说明与防泼水/抗抓防刮测试**。

---

### 页面 4：免费面料样板盒申领页 (Free Swatch Box Landing Page)
* **核心内容**：
  * **牛皮纸盒开箱视觉**：6 款热门面料小样 + 35D/45D 海绵触感切块 + $50 现金抵扣券；
  * **交互式面料触感探索器**（微距纹理与防刮测试视频）；
  * **2 步极速航空直邮表单**（5-7 天全球空运直达），将大件退货率压低至 0.8% 以下。

---

### 页面 5：全流程交付与工坊解密页 (How It Works & The DDP Journey)
* **核心内容**：
  * **3 大核心支柱探索**：现压保鲜、0 螺丝自锁五金、标准快递小箱化；
  * **5 阶段跨洋履约时间轴**（工坊裁剪 ➔ 现压封箱 ➔ 跨洋海运 ➔ 清关完毕 ➔ 本地 FedEx 派送）；
  * **“以捐代退”（Donation-over-Return）ESG 政策全解读**。

---
*Generated and synchronized with Stitch UI Project 1318977181840355780.*
