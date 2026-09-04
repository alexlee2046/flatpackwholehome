export interface SpaceTranslation {
  title: string
  intro: string
}

export interface MaterialTranslation {
  title: string
  intro: string
  facts: Array<{ label: string; body: string }>
}

export interface ProductTranslation {
  title: string
  subtitle: string
  joineryType: string
  description: string
  specifications: Array<{ label: string; value: string }>
  boxBreakdown: Array<{
    boxId: string
    title: string
    description: string
    dimensions?: string
    weight?: string
  }>
}

export interface GlobalsTranslation {
  announcement: {
    message: string
    linkLabel: string
  }
  homepage: {
    hero: {
      eyebrow: string
      headline: string
      body: string
    }
  }
  siteSettings: {
    descriptor: string
    tagline: string
  }
}

export interface LocaleSeedData {
  spaces: {
    'living-room': SpaceTranslation
    bedroom: SpaceTranslation
    'whole-home': SpaceTranslation
  }
  materials: {
    'white-oak': MaterialTranslation
    'black-walnut': MaterialTranslation
    'oatmeal-boucle': MaterialTranslation
  }
  products: {
    modusofa: ProductTranslation
    snapbed: ProductTranslation
    '1-bedroom-kit': ProductTranslation
  }
  globals: GlobalsTranslation
}

export const seedTranslations: Record<string, LocaleSeedData> = {
  en: {
    spaces: {
      'living-room': {
        title: 'Living Room',
        intro: 'Calm Japandi living spaces centered around the modular ModuSofa and solid oak coffee tables.',
      },
      bedroom: {
        title: 'Bedroom',
        intro: 'Minimalist platform sleeping sanctuary featuring the zero-screw SnapBed.',
      },
      'whole-home': {
        title: 'Whole Home 1-Bedroom',
        intro: 'All 6 boxes for complete living and sleeping zones in one seamless delivery.',
      },
    },
    materials: {
      'white-oak': {
        title: 'FSC European White Oak',
        intro: 'Sustainably harvested solid white oak with natural matte wax finish and precision joinery.',
        facts: [
          { label: 'Origin', body: 'FSC-Certified European sustainable forestry.' },
          { label: 'Finish', body: 'Zero-VOC plant-based protective matte wax oil.' },
          { label: 'Density', body: 'High-density slow-grown hardwood built for decades.' },
        ],
      },
      'black-walnut': {
        title: 'American Black Walnut',
        intro: 'Deep rich chocolate tones with fluid natural grain patterns.',
        facts: [
          { label: 'Origin', body: 'North American Appalachian hardwoods.' },
          { label: 'Grain', body: 'Bookmatched continuous grain along structural rails.' },
        ],
      },
      'oatmeal-boucle': {
        title: 'Oatmeal Bouclé Weave',
        intro: 'Textured, durable, stain-resistant tactile upholstery designed for daily relaxation.',
        facts: [
          { label: 'Martindale', body: 'Over 60,000 double rubs for commercial-grade durability.' },
          { label: 'Stain Repel', body: 'PFC-free eco water-repellent yarn treatment.' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'ModuSofa Modular 3-Seater',
        subtitle: 'Tool-free Japandi sofa engineered for deep comfort and tool-free disassembly.',
        joineryType: 'Snap-Lock Mortise & Tenon',
        description: 'The ModuSofa rethinks large living room seating. Shipped flat in two manageable boxes, the kiln-dried solid oak frame connects via hidden interlocking mortise-and-tenon tenons in under 25 minutes without a single screw.',
        specifications: [
          { label: 'Dimensions', value: '220 cm W × 92 cm D × 74 cm H' },
          { label: 'Frame', value: 'Solid FSC European White Oak' },
          { label: 'Cushions', value: 'High-resilience foam core + down-blend wrap' },
          { label: 'Box Count', value: '2 Flat Boxes (Fits standard elevator)' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Box 1: Oak Base & Joinery Rails', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Solid oak perimeter rails and center support.' },
          { boxId: 'b2', title: 'Box 2: Cushions & Backrest Supports', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Down-blend seat cushions and modular backrests.' },
        ],
      },
      snapbed: {
        title: 'SnapBed Minimal Platform Bed',
        subtitle: 'Solid oak platform bed frame with floating nightstand compatibility.',
        joineryType: 'Zero-Screw Gravity Lock',
        description: 'Designed for effortless moves and peaceful nights. The SnapBed frame locks securely using gravity wedge joints that get sturdier with weight. No creaking, no loose hardware.',
        specifications: [
          { label: 'Dimensions (Queen)', value: '160 cm W × 210 cm L × 28 cm H' },
          { label: 'Box Count', value: '2 Flat Boxes' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: 'Box 5: Bed Frame Side Rails & Hardware', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Long structural perimeter rails with embedded gravity locks.' },
          { boxId: 'b6', title: 'Box 6: Slats & Headboard System', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC birch roll-out slats and optional low headboard.' },
        ],
      },
      '1-bedroom-kit': {
        title: '1-Bedroom Whole Home Kit',
        subtitle: 'Complete whole-home furniture solution: Living, Dining, and Bedroom in 6 flat boxes.',
        joineryType: 'Full Japandi Tool-Free System',
        description: 'Your entire apartment furnished in one delivery. Includes the 3-seater ModuSofa, Oak Coffee Table, SnapBed frame with nightstands, and dining bench. All engineered to assemble in 60 minutes tool-free.',
        specifications: [
          { label: 'Coverage', value: 'Living, Bedroom, & Dining essentials' },
          { label: 'Total Boxes', value: '6 flat boxes; destination DDP is quoted in cart' },
          { label: 'Bundle Savings', value: '$350 vs buying pieces separately' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Box 1: ModuSofa Base Frame', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Living set base framework' },
          { boxId: 'b2', title: 'Box 2: ModuSofa Cushions & Backs', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Bouclé cushions and back pillows' },
          { boxId: 'b3', title: 'Box 3: Low Coffee Table', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: 'Solid oak organic coffee table' },
          { boxId: 'b4', title: 'Box 4: Dining / Work Bench', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: 'Dual-purpose solid wood bench' },
          { boxId: 'b5', title: 'Box 5: SnapBed Frame Rails', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Queen platform perimeter frame' },
          { boxId: 'b6', title: 'Box 6: SnapBed Slats & Nightstands', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'Birch slats + two floating nightstands' },
        ],
      },
    },
    globals: {
      announcement: {
        message: 'Material swatch checkout is currently unavailable. Contact our concierge for options.',
        linkLabel: 'Explore 1-Bedroom Kit',
      },
      homepage: {
        hero: {
          eyebrow: 'JAPANDI WHOLE-HOME SYSTEM',
          headline: 'Your entire home. Delivered in 6 flat boxes.',
          body: 'Solid FSC-certified oak and walnut furniture engineered for tool-free assembly, zero-hassle shipping, and lifetime modularity.',
        },
      },
      siteSettings: {
        descriptor: 'Whole-home flat-pack Japandi furniture in 6 boxes with destination-specific DDP delivery.',
        tagline: 'Your entire home. Delivered in 6 flat boxes.',
      },
    },
  },
  'zh-CN': {
    spaces: {
      'living-room': {
        title: '客厅空间',
        intro: '以模块化 ModuSofa 与实木橡木茶几为核心的日式极简客厅空间。',
      },
      bedroom: {
        title: '卧室空间',
        intro: '零螺丝组装 SnapBed 地台床打造的极简睡眠栖息地。',
      },
      'whole-home': {
        title: '一居室全屋整装',
        intro: '仅需 6 个扁平包装箱，一次性送达客厅与卧室全套家具。',
      },
    },
    materials: {
      'white-oak': {
        title: 'FSC 认证欧洲白橡木',
        intro: '可持续采伐的原木白橡木，表面采用天然哑光木蜡油与高精度榫卯工艺。',
        facts: [
          { label: '产地', body: 'FSC 认证欧洲可持续森林。' },
          { label: '涂装', body: '零 VOC 植物基哑光木蜡油。' },
          { label: '密度', body: '高密度慢生硬木，历久弥新。' },
        ],
      },
      'black-walnut': {
        title: '北美特级黑胡桃木',
        intro: '温润醇厚的深巧克力色泽，带有行云流水般的天然山形纹理。',
        facts: [
          { label: '产地', body: '北美阿巴拉契亚优质硬木林。' },
          { label: '纹理', body: '结构主梁采用连续山形拼花对称纹理。' },
        ],
      },
      'oatmeal-boucle': {
        title: '燕麦色肌理羊圈呢',
        intro: '富有质感、耐磨抗污的舒适触感织物，专为日常舒适起居设计。',
        facts: [
          { label: '马丁代尔耐磨度', body: '超过 60,000 次双摩擦，商业级耐磨标准。' },
          { label: '抗污防护', body: '无氟环保防泼水纱线工艺。' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'ModuSofa 模块化三人沙发',
        subtitle: '免工具榫卯组装的日式沙发，专为深舒适坐感与自由拆卸设计。',
        joineryType: '自锁榫卯结构',
        description: 'ModuSofa 重新定义客厅大件座几。采用两个便于搬运的扁平箱包装，烘干实木白橡木框架通过隐藏式互锁榫卯连接，单人 25 分钟内即可徒手拼装完成，无需任何螺丝。',
        specifications: [
          { label: '尺寸', value: '220 cm 宽 × 92 cm 深 × 74 cm 高' },
          { label: '框架材质', value: 'FSC 认证欧洲特级白橡木原木' },
          { label: '坐垫填充', value: '高回弹海绵支撑层 + 羽绒柔弹包裹层' },
          { label: '包装规格', value: '2 个扁平纸箱（轻松进入标准客梯）' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: '1 号箱：实木底座与榫卯横梁', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '纯实木白橡木边框与中央承重梁。' },
          { boxId: 'b2', title: '2 号箱：坐垫与靠背支撑件', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羽绒混纺坐垫与模块化靠背组件。' },
        ],
      },
      snapbed: {
        title: 'SnapBed 极简地台床',
        subtitle: '纯实木橡木悬浮地台床架，兼容无缝悬浮床头柜。',
        joineryType: '重力契合自锁结构',
        description: '专为轻盈搬迁与静谧睡眠打造。SnapBed 床架运用重力楔形卡榫结构，承重越大越稳固，彻底告别异响与松动零件。',
        specifications: [
          { label: '尺寸 (Queen 标准双人)', value: '160 cm 宽 × 210 cm 长 × 28 cm 高' },
          { label: '包装规格', value: '2 个扁平纸箱' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: '5 号箱：床架侧梁与五金锁扣', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: '内嵌自重锁止结构的实木长侧梁。' },
          { boxId: 'b6', title: '6 号箱：排骨架与床头模块', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC 桦木卷式排骨架与低矮床头板。' },
        ],
      },
      '1-bedroom-kit': {
        title: '一居室全套家具包 (6 箱整套)',
        subtitle: '全屋家具一站式解决方案：客厅、餐厅与卧室仅需 6 个包装箱。',
        joineryType: '全屋免工具日式榫卯系统',
        description: '整套公寓家具一次性配送到家。包含 3 人位 ModuSofa 沙发、橡木茶几、SnapBed 床架附带床头柜以及餐桌长凳。全套家具专为 60 分钟内免工具组装而设计。',
        specifications: [
          { label: '全套配置', value: 'ModuSofa 三人沙发 + 实木茶几 + SnapBed 地台床 + 餐厅长凳' },
          { label: '包装规格', value: '6 个扁平包装箱（一次性完整配送）' },
          { label: '套装优惠', value: '相比单件选购立省 $350' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: '1 号箱：ModuSofa 橡木底架', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '沙发实木框架与免工具卡扣' },
          { boxId: 'b2', title: '2 号箱：ModuSofa 坐垫靠包', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羊圈呢坐垫与靠枕组' },
          { boxId: 'b3', title: '3 号箱：低矮极简茶几', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: '纯实木橡木有机形态茶几' },
          { boxId: 'b4', title: '4 号箱：多功能长凳', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: '餐桌/玄关两用实木长凳' },
          { boxId: 'b5', title: '5 号箱：SnapBed 床架侧梁', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Queen 双人床边框与重力卡榫' },
          { boxId: 'b6', title: '6 号箱：SnapBed 床排骨架与悬浮床头柜', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: '桦木排骨架 + 两个悬浮置物床头柜' },
        ],
      },
    },
    globals: {
      announcement: {
        message: '免费面料色卡盒附赠 $50 抵用券 — 全球 DDP 包税专线配送',
        linkLabel: '探索一居室全套方案',
      },
      homepage: {
        hero: {
          eyebrow: '日式极简全屋系统',
          headline: '6 个扁平包装箱装下你的整套家',
          body: '精选 FSC 认证欧洲白橡木与北美黑胡桃木，无需螺丝工具即可组装，物流直达，模组自由组合。',
        },
      },
      siteSettings: {
        descriptor: '全屋扁平包装日式极简家具，仅需 6 个包装箱，全球包税到家。',
        tagline: '你的整套家，装在 6 个扁平包装箱中送达。',
      },
    },
  },
  'zh-TW': {
    spaces: {
      'living-room': {
        title: '客廳空間',
        intro: '以模組化 ModuSofa 與實木橡木茶几為核心的日式極簡客廳空間。',
      },
      bedroom: {
        title: '臥室空間',
        intro: '零螺絲組裝 SnapBed 地台床打造的極簡睡眠棲息地。',
      },
      'whole-home': {
        title: '一居室全屋整裝',
        intro: '僅需 6 個扁平包裝箱，一次性送達客廳與臥室全套家具。',
      },
    },
    materials: {
      'white-oak': {
        title: 'FSC 認證歐洲白橡木',
        intro: '可持續採伐的原木白橡木，表面採用天然啞光木蠟油與高精度榫卯工藝。',
        facts: [
          { label: '產地', body: 'FSC 認證歐洲可持續森林。' },
          { label: '塗裝', body: '零 VOC 植物基啞光木蠟油。' },
          { label: '密度', body: '高密度慢生硬木，歷久彌新。' },
        ],
      },
      'black-walnut': {
        title: '北美特級黑胡桃木',
        intro: '溫潤醇厚的深巧克力色澤，帶有行雲流水般的天然山形紋理。',
        facts: [
          { label: '產地', body: '北美阿巴拉契亞優質硬木林。' },
          { label: '紋理', body: '結構主梁採用連續山形拼花對稱紋理。' },
        ],
      },
      'oatmeal-boucle': {
        title: '燕麥色肌理羊圈呢',
        intro: '富有質感、耐磨抗污的舒適觸感織物，專為日常舒適起居設計。',
        facts: [
          { label: '馬丁代爾耐磨度', body: '超過 60,000 次雙摩擦，商業級耐磨標準。' },
          { label: '抗污防護', body: '無氟環保防潑水紗線工藝。' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'ModuSofa 模組化三人沙發',
        subtitle: '免工具榫卯組裝的日式沙發，專為深舒適坐感與自由拆卸設計。',
        joineryType: '自鎖榫卯結構',
        description: 'ModuSofa 重新定義客廳大件座幾。採用兩個便於搬運的扁平箱包裝，烘乾實木白橡木框架通過隱藏式互鎖榫卯連接，單人 25 分鐘內即可徒手拼裝完成，無需任何螺絲。',
        specifications: [
          { label: '尺寸', value: '220 cm 寬 × 92 cm 深 × 74 cm 高' },
          { label: '框架材質', value: 'FSC 認證歐洲特級白橡木原木' },
          { label: '坐墊填充', value: '高回彈海綿支撐層 + 羽絨柔彈包裹層' },
          { label: '包裝規格', value: '2 個扁平紙箱（輕鬆進入標準客梯）' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: '1 號箱：實木底座與榫卯橫樑', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '純實木白橡木邊框與中央承重樑。' },
          { boxId: 'b2', title: '2 號箱：坐墊與靠背支撐件', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羽絨混紡坐墊與模組化靠背組件。' },
        ],
      },
      snapbed: {
        title: 'SnapBed 極簡地台床',
        subtitle: '純實木橡木懸浮地台床架，兼容無縫懸浮床頭櫃。',
        joineryType: '重力契合自鎖結構',
        description: '專為輕盈搬遷與靜謐睡眠打造。SnapBed 床架運用重力楔形卡榫結構，承重越大越穩固，徹底告別異響與鬆動零件。',
        specifications: [
          { label: '尺寸 (Queen 標準雙人)', value: '160 cm 寬 × 210 cm 長 × 28 cm 高' },
          { label: '包裝規格', value: '2 個扁平紙箱' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: '5 號箱：床架側樑與五金鎖扣', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: '內嵌自重鎖止結構的實木長側樑。' },
          { boxId: 'b6', title: '6 號箱：排骨架與床頭模組', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC 樺木卷式排骨架與低矮床頭板。' },
        ],
      },
      '1-bedroom-kit': {
        title: '一居室全套家具包 (6 箱整套)',
        subtitle: '全屋家具一站式解決方案：客廳、餐廳與臥室僅需 6 個包裝箱。',
        joineryType: '全屋免工具日式榫卯系統',
        description: '整套公寓家具一次性配送到家。包含 3 人位 ModuSofa 沙發、橡木茶几、SnapBed 床架附帶床頭櫃以及餐桌長凳。全套家具專為 60 分鐘內免工具組裝而設計。',
        specifications: [
          { label: '全套配置', value: 'ModuSofa 三人沙發 + 實木茶几 + SnapBed 地台床 + 餐廳長凳' },
          { label: '包裝規格', value: '6 個扁平包裝箱（一次性完整配送）' },
          { label: '套裝優惠', value: '相比單件選購立省 $350' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: '1 號箱：ModuSofa 橡木底架', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '沙發實木框架與免工具卡扣' },
          { boxId: 'b2', title: '2 號箱：ModuSofa 坐墊靠包', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: '羊圈呢坐墊與靠枕組' },
          { boxId: 'b3', title: '3 號箱：低矮極簡茶几', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: '純實木橡木有機形態茶几' },
          { boxId: 'b4', title: '4 號箱：多功能長凳', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: '餐桌/玄關兩用實木長凳' },
          { boxId: 'b5', title: '5 號箱：SnapBed 床架側樑', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Queen 雙人床邊框與重力卡榫' },
          { boxId: 'b6', title: '6 號箱：SnapBed 床排骨架與懸浮床頭櫃', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: '樺木排骨架 + 兩個懸浮置物床頭櫃' },
        ],
      },
    },
    globals: {
      announcement: {
        message: '免費面料色卡盒附贈 $50 抵用券 — 全球 DDP 包稅專線配送',
        linkLabel: '探索一居室全套方案',
      },
      homepage: {
        hero: {
          eyebrow: '日式極簡全屋系統',
          headline: '6 個扁平包裝箱裝下你的整套家',
          body: '精選 FSC 認證歐洲白橡木與北美黑胡桃木，無需螺絲工具即可組裝，物流直達，模組自由組合。',
        },
      },
      siteSettings: {
        descriptor: '全屋扁平包裝日式極簡家具，僅需 6 個包裝箱，全球包稅到家。',
        tagline: '你的整套家，裝在 6 個扁平包裝箱中送達。',
      },
    },
  },
  de: {
    spaces: {
      'living-room': {
        title: 'Wohnbereich',
        intro: 'Ruhige Japandi-Wohnräume rund um das modulare ModuSofa und Couchtische aus massiver Eiche.',
      },
      bedroom: {
        title: 'Schlafbereich',
        intro: 'Minimalistischer Schlafraum mit dem schraubenlosen SnapBed Plattformbett.',
      },
      'whole-home': {
        title: 'Komplett-Wohnung 1-Zimmer',
        intro: 'Alle 6 Kartons für vollständigen Wohn- und Schlafbereich in einer einzigen nahtlosen Lieferung.',
      },
    },
    materials: {
      'white-oak': {
        title: 'FSC Europäische Weißeiche',
        intro: 'Nachhaltig geschlagene massive Weißeiche mit mattem Naturwachs-Finish und Präzisions-Holzverbindungen.',
        facts: [
          { label: 'Herkunft', body: 'FSC-zertifizierte europäische nachhaltige Forstwirtschaft.' },
          { label: 'Finish', body: 'Pflanzenbasiertes, schadstofffreies mattes Hartwachsöl (Zero-VOC).' },
          { label: 'Dichte', body: 'Hochdichtes, langsam gewachsenes Hartholz für Jahrzehnte.' },
        ],
      },
      'black-walnut': {
        title: 'Amerikanischer Schwarznussbaum',
        intro: 'Tiefe, reiche Schokoladentöne mit fließenden natürlichen Maserungsverläufen.',
        facts: [
          { label: 'Herkunft', body: 'Nordamerikanische Appalachen-Harthölzer.' },
          { label: 'Maserung', body: 'Symmetrisch gespiegelte durchgehende Maserung entlang der Konstruktionsträger.' },
        ],
      },
      'oatmeal-boucle': {
        title: 'Haferflocken-Bouclé-Gewebe',
        intro: 'Strukturierter, strapazierfähiger und fleckabweisender Polsterstoff für tägliche Entspannung.',
        facts: [
          { label: 'Martindale', body: 'Über 60.000 Scheuertouren für gewerbliche Beanspruchung.' },
          { label: 'Fleckschutz', body: 'PFC-freie, umweltfreundliche wasserabweisende Garnveredelung.' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'ModuSofa Modulares 3-Sitzer Sofa',
        subtitle: 'Werkzeugloses Japandi-Sofa für tiefen Komfort und mühelosen Abbau.',
        joineryType: 'Snap-Lock Zapfen- und Nutverbindung',
        description: 'Das ModuSofa definiert Wohnzimmermöbel neu. Geliefert in zwei handlichen Flachkartons, verbindet sich der ofengetrocknete massive Eichenrahmen durch verdeckte Steckzapfen in unter 25 Minuten – ganz ohne Schrauben.',
        specifications: [
          { label: 'Maße', value: '220 cm B × 92 cm T × 74 cm H' },
          { label: 'Rahmen', value: 'Massive FSC Europäische Weißeiche' },
          { label: 'Polsterung', value: 'Hochbelastbarer Schaumstoffkern + Daunen-Vlies-Ummantelung' },
          { label: 'Packmaße', value: '2 Flachkartons (passend für Standardaufzüge)' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Karton 1: Eichenholz-Basisrahmen & Verbindungsleisten', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Massiver Eichen-Umfangsrahmen und Mittelträger.' },
          { boxId: 'b2', title: 'Karton 2: Kissen & Rückenlehnen', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Daunengemisch-Sitzkissen und modulare Rückenstützen.' },
        ],
      },
      snapbed: {
        title: 'SnapBed Minimalistisches Plattformbett',
        subtitle: 'Massives Eichen-Plattformbett kompatibel mit schwebenden Nachttischen.',
        joineryType: 'Schraubenlose Schwerkraft-Verriegelung',
        description: 'Entworfen für mühelose Umzüge und erholsamen Schlaf. Der Rahmen verriegelt sich durch Keilverbindungen, die mit Belastung stabiler werden. Kein Quietschen, keine losen Beschläge.',
        specifications: [
          { label: 'Maße (Queen)', value: '160 cm B × 210 cm L × 28 cm H' },
          { label: 'Kartonanzahl', value: '2 Flachkartons' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: 'Karton 5: Bettseiten & Beschlagssystem', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Lange Längsholme mit integrierten Schwerkraftverschlüssen.' },
          { boxId: 'b6', title: 'Karton 6: Lattenrost & Kopfteil', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSC-Birken-Rollrost und optionales flaches Kopfteil.' },
        ],
      },
      '1-bedroom-kit': {
        title: '1-Zimmer Komplett-Wohnungsset',
        subtitle: 'Ganzheitliche Einrichtung: Wohnen, Essen und Schlafen in nur 6 Flachkartons.',
        joineryType: 'Vollständiges werkzeugloses Japandi-System',
        description: 'Ihre gesamte Wohnung in einer einzigen Lieferung. Enthält das 3-Sitzer ModuSofa, Eichen-Couchtisch, SnapBed Bettgestell mit Nachttischen und Essbank. Aufbau in nur 60 Minuten werkzeuglos möglich.',
        specifications: [
          { label: 'Umfang', value: 'Wohn-, Schlaf- und Essbereich' },
          { label: 'Gesamtkartons', value: '6 Flachkartons (DDP-Lieferung bis in den Wunschraum)' },
          { label: 'Set-Vorteil', value: '$350 Ersparnis gegenüber Einzelkauf' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Karton 1: ModuSofa Basisrahmen', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Basisrahmen für den Wohnbereich' },
          { boxId: 'b2', title: 'Karton 2: ModuSofa Polster & Kissen', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Bouclé-Sitzkissen und Rückenkissen' },
          { boxId: 'b3', title: 'Karton 3: Niedriger Couchtisch', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: 'Organischer Couchtisch aus massiver Eiche' },
          { boxId: 'b4', title: 'Karton 4: Ess- & Sitzbank', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: 'Multifunktionale Massivholzbank' },
          { boxId: 'b5', title: 'Karton 5: SnapBed Rahmen-Längsholme', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Umfangsrahmen für Queen-Plattformbett' },
          { boxId: 'b6', title: 'Karton 6: SnapBed Lattenrost & Nachttische', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'Birkenholzlattenrost + zwei schwebende Nachttische' },
        ],
      },
    },
    globals: {
      announcement: {
        message: 'Kostenlose Musterbox mit $50 Gutschein — Weltweite DDP-Lieferung inklusive aller Zölle',
        linkLabel: '1-Zimmer-Set entdecken',
      },
      homepage: {
        hero: {
          eyebrow: 'JAPANDI GANZHAUS-SYSTEM',
          headline: 'Ihr ganzes Zuhause. Geliefert in 6 flachen Kartons.',
          body: 'Möbel aus FSC-zertifizierter Eiche und Nussbaum – entwickelt für werkzeuglosen Aufbau, sorgenfreien Versand und lebenslange Modularität.',
        },
      },
      siteSettings: {
        descriptor: 'Japandi-Vollholzmobilien im Flachpack-Format in 6 Kartons weltweit zollfrei geliefert.',
        tagline: 'Ihr ganzes Zuhause. Geliefert in 6 flachen Kartons.',
      },
    },
  },
  ja: {
    spaces: {
      'living-room': {
        title: 'リビングルーム',
        intro: 'モジュラーソファ「ModuSofa」と無垢ホワイトオークのローテーブルを中心とした、穏やかなジャパンディ空間。',
      },
      bedroom: {
        title: 'ベッドルーム',
        intro: 'ネジを一切使わない「SnapBed」ローベッドがもたらす、静謐でミニマルな眠りの聖域。',
      },
      'whole-home': {
        title: '1LDK オールインワンキット',
        intro: 'リビングから寝室までの家具一式を、わずか6個のフラットボックスで一括お届け。',
      },
    },
    materials: {
      'white-oak': {
        title: 'FSC認証 ヨーロピアンホワイトオーク',
        intro: '持続可能な森林から調達された無垢ホワイトオーク。天然マットワックス仕上げと高精度な木組み工芸。',
        facts: [
          { label: '産地', body: 'FSC認証のヨーロッパ持続可能林業。' },
          { label: '仕上げ', body: 'VOCゼロの植物性天然マットオイルワックス。' },
          { label: '密度', body: '何十年も使い続けられる高密度・緩成広葉樹。' },
        ],
      },
      'black-walnut': {
        title: 'アメリカンブラックウォールナット',
        intro: '深みのあるチョコレートトーンと流れるような美しい天然木目。',
        facts: [
          { label: '産地', body: '北米アパラチア山脈の上質広葉樹。' },
          { label: '木目', body: '構造梁に沿って施されたブックマッチ連動木目。' },
        ],
      },
      'oatmeal-boucle': {
        title: 'オートミール ブークレ織り',
        intro: '豊かな質感と耐久性、防汚性を備えた、日常のリラックスに最適なファブリック。',
        facts: [
          { label: 'マーチンデール', body: '商業施設基準を凌駕する60,000回以上の耐摩耗性。' },
          { label: '防汚加工', body: '環境に優しいPFCフリーの撥水ヤーン加工。' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'ModuSofa モジュラー3人掛けソファ',
        subtitle: '工具不要の伝統ほぞ組み構造。深い座り心地と容易な解体を両立。',
        joineryType: 'スナップロック式 ほぞ組み工法',
        description: '大型リビング家具の概念を一新。扱いやすい2つのフラットボックスでお届けし、乾燥無垢ホワイトオークフレームを隠しほぞ構造により工具なし・ネジなしで25分以内に組み立て可能です。',
        specifications: [
          { label: '寸法', value: '幅 220 cm × 奥行 92 cm × 高さ 74 cm' },
          { label: 'フレーム', value: 'FSC認証 ヨーロピアン無垢ホワイトオーク' },
          { label: 'クッション', value: '高反発ウレタンコア + フェザーブレンド層' },
          { label: '梱包仕様', value: '薄型フラットボックス2箱（一般的なエレベーターに積載可）' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Box 1: オーク製ベースフレーム＆連結ビーム', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: '無垢オークの外周フレームおよびセンターサポート。' },
          { boxId: 'b2', title: 'Box 2: シートクッション＆モジュラー背もたれ', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'フェザー混クッションおよび背もたれパーツ。' },
        ],
      },
      snapbed: {
        title: 'SnapBed ミニマルローベッドフレーム',
        subtitle: 'フロート式ナイトスタンドと一体化する無垢ホワイトオークベッド。',
        joineryType: '工具不要 自重ロック構造',
        description: '引越しも設置も驚くほど身軽に。荷重がかかるほど強固になる自重クサビ嵌合を採用し、きしみ音や緩む金具の心配が一切ありません。',
        specifications: [
          { label: '寸法 (クイーン)', value: '幅 160 cm × 長さ 210 cm × 高さ 28 cm' },
          { label: '梱包仕様', value: 'フラットボックス2箱' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: 'Box 5: ベッドサイドレール＆結合金具', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: '自重ロック構造を内蔵した長尺サイドフレーム。' },
          { boxId: 'b6', title: 'Box 6: すのこ＆ヘッドボード', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'FSCバーチ無垢ロールすのことオプションのローヘッドボード。' },
        ],
      },
      '1-bedroom-kit': {
        title: '1LDK ホールホームキット (6箱一括)',
        subtitle: 'リビング・ダイニング・寝室がわずか6箱で完結する全室家具キット。',
        joineryType: '完全工具レス ジャパンディ木組みシステム',
        description: '住まい全体の家具を一度にお届け。ModuSofa 3人掛け、無垢オークコーヒーテーブル、SnapBed（ナイトスタンド付き）、ダイニングベンチを網羅。すべて60分以内に工具不要で組み立て可能です。',
        specifications: [
          { label: '構成内容', value: 'リビング、ベッドルーム、ダイニング必須家具' },
          { label: '総梱包数', value: '薄型フラットボックス6箱（お部屋までDDP配送）' },
          { label: 'セット割引', value: '単品購入と比較して$350お得' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Box 1: ModuSofa ベースフレーム', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'リビングソファの木製ベース骨組み' },
          { boxId: 'b2', title: 'Box 2: ModuSofa クッション＆バック', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'ブークレ製クッションおよび背もたれ' },
          { boxId: 'b3', title: 'Box 3: ローコーヒーテーブル', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: '無垢ホワイトオークのオーガニックローテーブル' },
          { boxId: 'b4', title: 'Box 4: ダイニング / ワークベンチ', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: '多用途に使える無垢材ベンチ' },
          { boxId: 'b5', title: 'Box 5: SnapBed フレームレール', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'クイーンサイズベッドの外周フレーム' },
          { boxId: 'b6', title: 'Box 6: SnapBed すのこ＆ナイトスタンド', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'バーチ材すのこ + 2個のフロート式ナイトスタンド' },
        ],
      },
    },
    globals: {
      announcement: {
        message: '$50クーポン付き無料ファブリックサンプルボックス — 世界中DDP関税・送料込み',
        linkLabel: '1LDKキットを見る',
      },
      homepage: {
        hero: {
          eyebrow: 'ジャパンディ・ホールホームシステム',
          headline: '6個のフラットボックスで届く、あたらしい暮らし。',
          body: 'FSC認証の無垢オーク材とウォールナット材を使用。工具不要の直感的な組み立て、ストレスフリーな配送、生涯使えるモジュール設計。',
        },
      },
      siteSettings: {
        descriptor: '6個の薄型箱で世界中に届く、工具不要の無垢材ジャパンディ家具システム。',
        tagline: '6個のフラットボックスで届く、あたらしい暮らし。',
      },
    },
  },
  ar: {
    spaces: {
      'living-room': {
        title: 'غرفة المعيشة',
        intro: 'مساحات معيشة هادئة بطراز جاباندي تتمحور حول أريكة ModuSofa المعيارية وطاولات القهوة من خشب البلوط الصلب.',
      },
      bedroom: {
        title: 'غرفة النوم',
        intro: 'ملاذ نوم بسيط ومريح يتميز بسرير SnapBed المنصي الخالي تماماً من المسامير.',
      },
      'whole-home': {
        title: 'تأثيث منزل كامل (غرفة نوم واحدة)',
        intro: 'جميع الصناديق الستة لتأثيث مناطق المعيشة والنوم بالكامل في شحنة واحدة سلسة.',
      },
    },
    materials: {
      'white-oak': {
        title: 'خشب البلوط الأبيض الأوروبي المعتمد من FSC',
        intro: 'بلوط أبيض صلب يُحصد بطرق مستدامة مع تشطيب شمعي طبيعي مطفأ وتجميع خشبي فائق الدقة.',
        facts: [
          { label: 'المصدر', body: 'غابات أوروبية مستدامة معتمدة من FSC.' },
          { label: 'التشطيب', body: 'زيت شمعي نباتي مطفأ واقٍ خالٍ تماماً من المركبات العضوية المتطايرة (Zero-VOC).' },
          { label: 'الكثافة', body: 'خشب صلب عالي الكثافة بطيء النمو مصمم ليدوم لعقود.' },
        ],
      },
      'black-walnut': {
        title: 'خشب الجوز الأسود الأمريكي',
        intro: 'درجات شوكولاتة عميقة وغنية مع تموجات عروق طبيعية انسيابية.',
        facts: [
          { label: 'المصدر', body: 'أخشاب صلبة من جبال الأبالاش في أمريكا الشمالية.' },
          { label: 'التموج', body: 'عروق خشبية متناسقة ومتصلة بدقة على طول الدعامات الهيكلية.' },
        ],
      },
      'oatmeal-boucle': {
        title: 'نسيج البوكليه بلون الشوفان',
        intro: 'تنجيد ناعم ذو ملمس غني، متين ومقاوم للبقع، مصمم للاسترخاء اليومي الفاخر.',
        facts: [
          { label: 'اختبار مارتنديل', body: 'أكثر من 60,000 دورة احتكاك لمقاومة تجارية فائقة.' },
          { label: 'مقاومة البقع', body: 'معالجة خيوط صديقة للبيئة وطاردة للماء خالية من مركبات PFC.' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'أريكة ModuSofa المعيارية ثلاثية المقاعد',
        subtitle: 'أريكة جاباندي تُركب بدون أدوات، مصممة لراحة عميقة وتفكيك فوري وسلس.',
        joineryType: 'تعشيق خشبي محكم بتقنية القفل التلقائي',
        description: 'تعيد أريكة ModuSofa ابتكار أثاث غرف المعيشة الكبيرة. تُشحن مسطحة في صندوقين يسهل حملهما، ويتصل هيكلها المصنوع من البلوط الصلب المجفف بتعاشيق مخفية في أقل من 25 دقيقة دون مسمار واحد.',
        specifications: [
          { label: 'الأبعاد', value: '220 سم عرض × 92 سم عمق × 74 سم ارتفاع' },
          { label: 'الهيكل', value: 'خشب بلوط أبيض أوروبي صلب معتمد من FSC' },
          { label: 'الوسائد', value: 'قلب إسفنجي عالي المرونة + طبقة ناعمة من مزيج الريش' },
          { label: 'عدد الصناديق', value: 'صندوقان مسطحان (يناسبان المصاعد القياسية)' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'الصندوق 1: قاعدة البلوط ودعامات التجميع', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'إطارات محيطية ودعامة وسطى من البلوط الصلب.' },
          { boxId: 'b2', title: 'الصندوق 2: الوسائد ودعامات مسند الظهر', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'وسائد جلوس بمزيج الريش ومساند ظهر معيارية.' },
        ],
      },
      snapbed: {
        title: 'سرير SnapBed المنصي البسيط',
        subtitle: 'إطار سرير منصي من البلوط الصلب متوافق مع طاولات جانبية عائمة.',
        joineryType: 'قفل جاذبية ذاتي خالي من المسامير',
        description: 'مُصمم للتنقل السلس والليالي الهادئة. يُقفل هيكل SnapBed بإحكام عبر مفاصل إسفينية تزداد ثباتاً مع الوزن. لا صرير ولا أدوات معدنية مفكوكة.',
        specifications: [
          { label: 'الأبعاد (كوين)', value: '160 سم عرض × 210 سم طول × 28 سم ارتفاع' },
          { label: 'عدد الصناديق', value: 'صندوقان مسطحان' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: 'الصندوق 5: عوارض السرير الجانبية والوصلات', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'عوارض هيكلية طولية مزودة بأقفال جاذبية مدمجة.' },
          { boxId: 'b6', title: 'الصندوق 6: الألواح الخشبية ولوح الرأس', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'ألواح خشب البتولا القابلة للطي ولوح رأس منخفض اختياري.' },
        ],
      },
      '1-bedroom-kit': {
        title: 'طقم المنزل الكامل لغرفة نوم واحدة (6 صناديق)',
        subtitle: 'حل تأثيث متكامل للمنزل بأكمله: المعيشة والطعام والنوم في 6 صناديق مسطحة فقط.',
        joineryType: 'نظام جاباندي خشبي متكامل بدون أدوات',
        description: 'شقتك بالكامل مفروشة في شحنة واحدة. يتضمن أريكة ModuSofa 3 مقاعد، طاولة قهوة من البلوط، سرير SnapBed مع طاولات جانبية، ومقعد طعام. مُهندسة بالكامل للتجميع في 60 دقيقة دون أي أدوات.',
        specifications: [
          { label: 'التغطية', value: 'أساسيات غرفة المعيشة وغرفة النوم وتناول الطعام' },
          { label: 'إجمالي الصناديق', value: '6 صناديق (توصيل DDP حتى باب الغرفة المختارة)' },
          { label: 'توفير الطقم', value: 'وفر 350 دولاراً مقارنة بشراء القطع منفردة' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'الصندوق 1: هيكل قاعدة أريكة ModuSofa', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'قاعدة الهيكل الخشبي لغرفة المعيشة' },
          { boxId: 'b2', title: 'الصندوق 2: وسائد ومساند أريكة ModuSofa', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'وسائد بوكليه ووسائد ظهر داعمة' },
          { boxId: 'b3', title: 'الصندوق 3: طاولة قهوة منخفضة', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: 'طاولة قهوة عضوية من خشب البلوط الصلب' },
          { boxId: 'b4', title: 'الصندوق 4: مقعد طعام / عمل', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: 'مقعد متعدد الاستخدامات من الخشب الصلب' },
          { boxId: 'b5', title: 'الصندوق 5: عوارض سرير SnapBed', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'إطار سرير منصي كوين المحيطي' },
          { boxId: 'b6', title: 'الصندوق 6: ألواح SnapBed وطاولات السرير', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'ألواح خشب البتولا + طاولتان جانبيتان عائمتان' },
        ],
      },
    },
    globals: {
      announcement: {
        message: 'علبة عينات أقمشة مجانية مع قسيمة بقيمة 50 دولاراً — شحن DDP شامل الرسوم والجمارك لجميع أنحاء العالم',
        linkLabel: 'استكشف طقم الشقة الكاملة',
      },
      homepage: {
        hero: {
          eyebrow: 'نظام جاباندي للمنزل الكامل',
          headline: 'منزلك بالكامل. يصلك في 6 صناديق مسطحة.',
          body: 'أثاث من خشب البلوط والجوز الصلب المعتمد من FSC، صُمم للتجميع بدون أدوات وشحن خالي من المتاعب ونمط معياري يدوم مدى الحياة.',
        },
      },
      siteSettings: {
        descriptor: 'أثاث جاباندي مسطح متكامل لمنزلك في 6 صناديق مسطحة يصلك بدون رسوم جمركية حول العالم.',
        tagline: 'منزلك بالكامل. يصلك في 6 صناديق مسطحة.',
      },
    },
  },
  ru: {
    spaces: {
      'living-room': {
        title: 'Гостиная',
        intro: 'Спокойное пространство в стиле джапанди с модульным диваном ModuSofa и журнальными столами из массива дуба.',
      },
      bedroom: {
        title: 'Спальня',
        intro: 'Минималистичный оазис для сна с платформенной кроватью SnapBed без единого болта.',
      },
      'whole-home': {
        title: 'Комплект для 1-комнатной квартиры',
        intro: 'Все 6 коробок для полной меблировки гостиной и спальни в одной удобной доставке.',
      },
    },
    materials: {
      'white-oak': {
        title: 'Европейский белый дуб FSC',
        intro: 'Массив белого дуба из возобновляемых лесов с натуральным матовым восковым покрытием и точными столярными соединениями.',
        facts: [
          { label: 'Происхождение', body: 'Устойчивое европейское лесное хозяйство, сертифицированное FSC.' },
          { label: 'Покрытие', body: 'Защитное растительное масло-воск без летучих органических соединений (Zero-VOC).' },
          { label: 'Плотность', body: 'Высокоплотная древесина медленного роста, созданная на десятилетия.' },
        ],
      },
      'black-walnut': {
        title: 'Американский черный орех',
        intro: 'Глубокие благородные шоколадные оттенки с плавным естественным рисунком волокон.',
        facts: [
          { label: 'Происхождение', body: 'Лиственные леса Аппалачей в Северной Америке.' },
          { label: 'Текстура', body: 'Симметричный непрерывный рисунок волокон вдоль несущих балок.' },
        ],
      },
      'oatmeal-boucle': {
        title: 'Ткань букле овсяного оттенка',
        intro: 'Фактурная, износостойкая и грязеотталкивающая обивка для максимального ежедневного комфорта.',
        facts: [
          { label: 'Тест Мартиндейла', body: 'Более 60 000 циклов истирания для коммерческого уровня прочности.' },
          { label: 'Защита от пятен', body: 'Экологичная гидрофобная обработка пряжи без соединений PFC.' },
        ],
      },
    },
    products: {
      modusofa: {
        title: 'Модульный 3-местный диван ModuSofa',
        subtitle: 'Диван в стиле джапанди со сборкой без инструментов для глубокого комфорта и легкой разборки.',
        joineryType: 'Защелкивающееся соединение шип-паз',
        description: 'ModuSofa меняет представление о крупной мебели для гостиной. Поставляется в двух удобных плоских коробках. Каркас из массива дуба соединяется скрытыми шип-паз замками менее чем за 25 минут без единого винта.',
        specifications: [
          { label: 'Размеры', value: '220 см (Ш) × 92 см (Г) × 74 см (В)' },
          { label: 'Каркас', value: 'Массив европейского белого дуба FSC' },
          { label: 'Наполнитель', value: 'Высокоэластичный пенный блок + обертка из пуховой смеси' },
          { label: 'Упаковка', value: '2 плоские коробки (проходят в стандартный пассажирский лифт)' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Коробка 1: Дубовое основание и соединительные балки', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Периметральные рейки и центральная опора из массива дуба.' },
          { boxId: 'b2', title: 'Коробка 2: Подушки и опоры спинки', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Подушки сиденья с пуховой смесью и модульные элементы спинки.' },
        ],
      },
      snapbed: {
        title: 'Минималистичная платформа SnapBed',
        subtitle: 'Платформенная кровать из массива дуба с возможностью крепления парящих прикроватных тумб.',
        joineryType: 'Гравитационный замок без винтов',
        description: 'Создана для легких переездов и безмятежного сна. Каркас SnapBed надежно фиксируется клиновыми соединениями, которые становятся только прочнее под нагрузкой. Никаких скрипов и разболтанной фурнитуры.',
        specifications: [
          { label: 'Размеры (Queen)', value: '160 см (Ш) × 210 см (Д) × 28 см (В)' },
          { label: 'Упаковка', value: '2 плоские коробки' },
        ],
        boxBreakdown: [
          { boxId: 'b5', title: 'Коробка 5: Боковые царги и замки кровати', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Длинные несущие балки со встроенными гравитационными замками.' },
          { boxId: 'b6', title: 'Коробка 6: Ламели и изголовье', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'Рулонные ламели из березы FSC и дополнительное низкое изголовье.' },
        ],
      },
      '1-bedroom-kit': {
        title: 'Комплект мебели для 1-комнатной квартиры (6 коробок)',
        subtitle: 'Готовое интерьерное решение: гостиная, столовая и спальня всего в 6 плоских коробках.',
        joineryType: 'Единая система соединений джапанди без инструментов',
        description: 'Вся квартира меблирована в одну доставку. Включает 3-местный диван ModuSofa, дубовый кофейный столик, кровать SnapBed с тумбами и обеденную скамью. Сборка всего комплекта занимает около 60 минут без инструментов.',
        specifications: [
          { label: 'Состав', value: 'Полный набор для гостиной, спальни и столовой зоны' },
          { label: 'Всего коробок', value: '6 коробок (доставка DDP с заносом в нужную комнату)' },
          { label: 'Выгода', value: 'Экономия $350 по сравнению с покупкой предметов по отдельности' },
        ],
        boxBreakdown: [
          { boxId: 'b1', title: 'Коробка 1: Каркас основания ModuSofa', dimensions: '115 × 50 × 20 cm', weight: '24 kg', description: 'Опорный каркас дивана для зоны гостиной' },
          { boxId: 'b2', title: 'Коробка 2: Подушки и спинка ModuSofa', dimensions: '100 × 70 × 35 cm', weight: '18 kg', description: 'Подушки из букле и подушки спинки' },
          { boxId: 'b3', title: 'Коробка 3: Низкий кофейный столик', dimensions: '90 × 60 × 12 cm', weight: '14 kg', description: 'Органичный журнальный столик из массива дуба' },
          { boxId: 'b4', title: 'Коробка 4: Обеденная / рабочая скамья', dimensions: '120 × 35 × 15 cm', weight: '16 kg', description: 'Многофункциональная скамья из массива дерева' },
          { boxId: 'b5', title: 'Коробка 5: Царги кровати SnapBed', dimensions: '215 × 25 × 18 cm', weight: '22 kg', description: 'Периметр платформы для кровати Queen' },
          { boxId: 'b6', title: 'Коробка 6: Ламели и тумбы SnapBed', dimensions: '165 × 40 × 15 cm', weight: '20 kg', description: 'Березовые ламели + две парящие прикроватные тумбы' },
        ],
      },
    },
    globals: {
      announcement: {
        message: 'Бесплатный набор образцов ткани с купоном на $50 — доставка DDP по всему миру со всеми пошлинами',
        linkLabel: 'Смотреть комплект для 1-комнатной',
      },
      homepage: {
        hero: {
          eyebrow: 'СИСТЕМА ДЖАПАНДИ ДЛЯ ВСЕГО ДОМА',
          headline: 'Весь ваш дом. Доставлен в 6 плоских коробках.',
          body: 'Мебель из сертифицированного дуба и ореха FSC: сборка без инструментов, простая доставка и модульность на всю жизнь.',
        },
      },
      siteSettings: {
        descriptor: 'Мебель в стиле джапанди для всей квартиры в 6 плоских коробках с доставкой DDP по всему миру.',
        tagline: 'Весь ваш дом. Доставлен в 6 плоских коробках.',
      },
    },
  },
}
