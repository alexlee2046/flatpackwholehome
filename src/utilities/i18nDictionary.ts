/**
 * High-quality, native-grade multilingual localization dictionary for The Flat Set.
 * Covers all 6 non-English target locales: zh-CN, zh-TW, de, ja, ar, ru.
 * Protected brand terms: The Flat Set, MODULIV, ModuSofa, SnapBed, DDP, USD, FSC, HR45.
 */

export interface LocaleContent {
  faqs: Array<{
    q: string
    a: string
  }>
  howItWorks: {
    hero: {
      eyebrow: string
      title: string
      subtitle: string
    }
    steps: Array<{
      stepNumber: string
      title: string
      description: string
      badge: string
      metric: string
      icon: string
    }>
  }
  homepage: {
    trustPillars: Array<{ metric: string; label: string; icon: string }>
    comparisonMatrix: {
      eyebrow: string
      title: string
      subtitle: string
      rows: Array<{ label: string; flatSetValue: string; traditionalValue: string }>
    }
    bundlePromo: {
      eyebrow: string
      title: string
      subtitle: string
      discountCallout: string
      ctaLabel: string
    }
    testimonials: Array<{
      author: string
      location: string
      apartmentType: string
      quote: string
      rating: number
    }>
  }
  header: {
    navItems: Array<{ label: string; url: string; badge?: string }>
  }
  footer: {
    brandSlogan: string
    copyrightText: string
    navItems: Array<{ label: string; url: string }>
  }
}

export const I18N_DICTIONARY: Record<string, LocaleContent> = {
  // ==========================================
  // 简体中文 (zh-CN)
  // ==========================================
  'zh-CN': {
    faqs: [
      {
        q: '物流配送需要多长时间？配送是如何安排的？',
        a: '订单在确认后 48 小时内完成现压精工制作，并通过全程碳中和的极速海运专线直发。北美、欧洲、东亚及大洋洲的主要城市通常在 14–18 天内完税送达。全部包裹拆分为标准快递规格（每箱 < 24 kg），由当地 FedEx、UPS 或 DPD 快递员直接送货上楼进门，无需预约大货车或承担高昂叉车费。',
      },
      {
        q: 'DDP（完税后交货）具体包含哪些费用？',
        a: 'DDP 意味着在结账时您看到的总额即为最终全包到手价。它涵盖了海运海关报关费、全部进口关税、增值税（VAT）以及送达家门口的全部快递运费。包裹到达当地海关时绝不会向您索要任何补充清关文件，收货时也不会有任何隐形关税账单。',
      },
      {
        q: '真的完全不需要工具吗？组装到底有多简单？',
        a: '100% 免工具，免螺丝，免内六角扳手。我们采用精密 CNC 预埋的不锈钢暗榫自锁机械结构。只需双手对齐卡扣并向下按压，即可“咔哒”一声坚固锁死。单人仅需 15 分钟即可装配好 ModuSofa 三人沙发，60 分钟内即可独自组装完一居室整套家具。搬家时轻轻上提释放机械锁即可无损扁平收纳。',
      },
      {
        q: '100 天无忧试用与“就地捐赠退换”是如何运作的？',
        a: '您可以在自己的家中自然光线下真实生活体验 100 天。如果您觉得家具不适合您的生活方式，我们绝不会将沉重的家具横跨大洋运回仓库或送去填埋场。我们会为您协调经审核的当地公益慈善机构上门免费回收，在核验捐赠凭证后，我们将立即为您办理 100% 全额原路退款。',
      },
      {
        q: '家具是用什么材质制作的？它是否足够坚固耐用？',
        a: '所有外露框架均选用 FSC 认证的北美白橡木或黑胡桃木原木精工打造，严禁使用劣质颗粒板或易老化的中纤板。座垫采用特调的 45 kg/m³ 高回弹环保乳胶感海绵（HR45），经 10 万次耐疲劳下压测试；面料则提供重磅羊羔绒（Bouclé）、防泼水灯芯绒及抗抓科技布，符合 OEKO-TEX 100 婴儿级环保标准。',
      },
      {
        q: '免费面料小样探索盒中包含什么？$50 抵用券如何使用？',
        a: '小样探索盒包含全部 4 种主推面料的完整织物大样、2 块 FSC 实木原木切片（白橡木与黑胡桃木原木油面）以及 1 块真空高回弹海绵测试块。盒盖内侧印有一张价值 $50 的无门槛优惠兑换码，可在您后续购买任何家具套装时抵扣现金使用。',
      },
      {
        q: '搬家时可以多次拆卸吗？拆装会导致结构松动吗？',
        a: '与使用自攻螺丝反复破坏木质纤维的传统板式家具不同，The Flat Set 的自锁卡扣是由 304 不锈钢与冷轧钢一体冲压而成的独立机械五金。即使拆装搬运 50 次以上，机械自锁公差仍保持在 0.1 mm 内，绝不晃动、绝不产生木质异响。',
      },
      {
        q: '如果某个部件在运输中意外受损，我该怎么办？',
        a: '我们的每个包装箱均配备内嵌式蜂窝缓冲护角与防潮真空层。万一在运输途中因暴力快递发生微小划痕或破损，您只需在收到包裹后 7 天内拍照联系我们的礼宾客服，我们将在 48 小时内为您免费补发顺丰/DHL 空运替换模块，无需整箱退回。',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: '精工匠造 · 直达客厅',
        title: '从数字工坊到您的客厅，只需 6 个扁平包装箱。',
        subtitle:
          '每一件家具均在下单后现压精工制作，全程碳中和极速海运直送到家，杜绝中间商加价与展厅溢价，DDP 完税包邮直达入户。',
      },
      steps: [
        {
          stepNumber: '01',
          title: '按需现压精工制作',
          description:
            '我们不囤积布满灰尘的长期库存。您的家具在确认订单后 48 小时内在专属数控工坊完成裁切、包覆与现压组装。高回弹 HR45 海绵定型后立即真空压缩包装，彻底避免受潮发霉与弹力疲劳。',
          badge: '工坊直造',
          metric: '48 小时',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6 个扁平包装箱装下整套一居室',
          description:
            '您的客厅、餐厅和卧室整套家具被精巧封装进 6 个超密集扁平纸箱中（每箱重量 < 24 kg，厚度 < 20 cm）。专为轻松穿过狭窄的老式楼梯井与小型客用电梯而设计。',
          badge: '极致扁平规整',
          metric: '6 个标准箱',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: '标准快递专线，零大件附加费',
          description:
            '通过将每箱严格控制在国际标准快件尺寸阈值内，您的家具全程经由标准快递（FedEx / UPS / DPD）运输。无需预约大货车上门，无需预留 4 小时等待窗口，零搬运上楼附加费。',
          badge: '标准快递直发',
          metric: '零意外加价',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: 'DDP 全程双清包税送到家门口',
          description:
            '完税后交货（Delivered Duty Paid）。全程国际远洋干线、进出口海关清关、进口关税及当地消费税已 100% 预付。结账页面显示的金额就是您的最终支付金额。',
          badge: '关税税费全包',
          metric: '14–18 天',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: '100% 免工具 60 分钟徒手自锁拼装',
          description:
            '零螺丝、零内六角扳手、零零散散的五金零件袋。预埋的不锈钢 Snap-Lock 自锁卡扣徒手对准即可紧扣锁死。ModuSofa 沙发 15 分钟装好，一居室整套方案单人 60 分钟轻松搞定。',
          badge: '暗榫机械自锁',
          metric: '0 颗螺丝',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: '100 天试用与“就地捐赠替代退货”',
          description:
            '在家真实体验 100 天。如果不合心意，我们绝不让大件家具跨洋倒运填埋。我们安排经认证的当地公益机构免费上门回收，并在收到捐赠收据后为您办理 100% 全额退款。',
          badge: '绿色环保循环',
          metric: '100 天',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6 个扁平包装箱', label: '装下一居室全套家具', icon: 'package_2' },
        { metric: '60 分钟', label: '单人徒手免工具拼装', icon: 'timer' },
        { metric: '0 颗螺丝', label: '不锈钢暗榫机械自锁', icon: 'handyman' },
        { metric: 'DDP 全包', label: '国际关税与税费已预付', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: '核心差异',
        title: 'The Flat Set 极简工程 vs. 传统家具卖场',
        subtitle: '为什么从现代数字工坊直接发货的扁平箱家具，远胜传统家具展厅与繁复的自组平板家具。',
        rows: [
          {
            label: '拼装过程',
            flatSetValue: '单人 15–60 分钟徒手拼装 · 0 颗螺丝 · 预埋自锁卡扣',
            traditionalValue: '3–6 小时繁琐组装 · 120+ 螺丝 · 需电钻与工具箱',
          },
          {
            label: '发货与交付',
            flatSetValue: '14–18 天碳中和专线 · DDP 双清关税运费全包送到门',
            traditionalValue: '8–16 周漫长展厅排单 · 昂贵且苛刻的大件货车派送',
          },
          {
            label: '座垫新鲜度',
            flatSetValue: '下单后 48 小时内定型现压 · 零仓储受潮塌陷',
            traditionalValue: '在集装箱与仓库货架堆积 6–12 个月 · 泡棉受潮老化',
          },
          {
            label: '一居室全套花费',
            flatSetValue: '$1,499 包揽全套整屋 · 免费送样板盒附 $50 抵扣券',
            traditionalValue: '$3,800+ 零散件溢价加价 · 附加高额上楼服务费',
          },
        ],
      },
      bundlePromo: {
        eyebrow: '一站式全屋方案',
        title: '一居室整屋全套家具方案',
        subtitle: 'ModuSofa 三人沙发 + SnapBed 双人床架 + FlatCoffee 茶几 + SnapSide 边几 + EntryRack 玄关置物架。6 个扁平包装箱打包齐送。',
        discountCallout: '相比单件购买立省 $300',
        ctaLabel: '定制您的一居室整屋方案',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: '纽约 布鲁克林',
          apartmentType: '4层老式无电梯公寓',
          quote: '在遇到 The Flat Set 之前，要把 3 人沙发搬进门框只有 65cm 的 4 楼老房子简直是不可能的任务。2 个扁平纸箱轻松拎上楼梯。不到 15 分钟就全部徒手卡紧装好了，甚至都不需要翻看说明书。',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: '英国 伦敦',
          apartmentType: '现代精装一居室',
          quote: 'DDP 双清包税的承诺非常真实——收货后绝没有任何莫名其妙的税单。白橡木质感非常扎实，完全是传家宝级的用料，灯芯绒面料拆箱即平整无褶皱。',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: '日本 东京',
          apartmentType: '极简单身公寓',
          quote: '极其纯粹的极简主义，结构异常稳固，能完美放进狭小的单人电梯。公益捐赠替代退货的环保政策让我完全放心地提交了订单。',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: '一居室整套方案', url: '/1-bedroom-kit-builder', badge: '热销' },
        { label: 'ModuSofa 模块沙发', url: '/products/modusofa' },
        { label: '工艺与物流解密', url: '/how-it-works-craft-logistics' },
        { label: '面料样板盒', url: '/free-swatch-box-material-discovery', badge: '$0 免费' },
        { label: '常见问题', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6个包装箱 · 60分钟免工具 · 0颗螺丝 · DDP包税包邮',
      copyrightText: 'The Flat Set. 保留所有权利。',
      navItems: [
        { label: '一居室整套方案', url: '/1-bedroom-kit-builder' },
        { label: 'ModuSofa 模块沙发', url: '/products/modusofa' },
        { label: 'SnapBed 极简床架', url: '/products/snapbed' },
        { label: '工艺与物流解密', url: '/how-it-works-craft-logistics' },
        { label: '免费领面料样板盒', url: '/free-swatch-box-material-discovery' },
        { label: '常见问题解答', url: '/faq' },
      ],
    },
  },

  // ==========================================
  // 繁体中文 (zh-TW)
  // ==========================================
  'zh-TW': {
    faqs: [
      {
        q: '物流配送需要多長時間？配送是如何安排的？',
        a: '訂單在確認後 48 小時內完成現壓精工製作，並通過全程碳中和的極速海運專線直送。北美、歐洲、東亞及大洋洲的主要城市通常在 14–18 天內完稅送達。全部包裹拆分為標準快遞規格（每箱 < 24 kg），由當地 FedEx、UPS 或 DPD 快遞員直接送貨進屋，無需預約大卡車或承擔高昂叉車費。',
      },
      {
        q: 'DDP（完稅後交貨）具體包含哪些費用？',
        a: 'DDP 意味著在結帳時您看到的總額即為最終全包到手價。它涵蓋了海運海關報關費、全部進口關稅、加值稅（VAT）以及送達家門口的全部快遞運費。包裹到達當地海關時絕不會向您索取任何補充清關文件，收貨時也不會有任何隱形關稅帳單。',
      },
      {
        q: '真的完全不需要工具嗎？組裝到底有多簡單？',
        a: '100% 免工具，免螺絲，免六角扳手。我們採用精密 CNC 預埋的不銹鋼暗榫自鎖機械結構。只需雙手對齊卡扣並向下按壓，即可「喀噠」一聲穩固鎖死。單人僅需 15 分鐘即可裝配好 ModuSofa 三人沙發，60 分鐘內即可獨自組裝完一居室整套家具。搬家時輕輕上提釋放機械鎖即可無損扁平收納。',
      },
      {
        q: '100 天無憂試用與「就地捐贈退換」是如何運作的？',
        a: '您可以在自己的家中自然光線下真實生活體驗 100 天。如果您覺得家具不適合您的生活方式，我們絕不會將沉重的家具橫跨大洋運回倉庫或送去掩埋場。我們會為您協調經審核的當地公益慈善機構上門免費回收，在核驗捐贈憑證後，我們將立即為您辦理 100% 全額原路退款。',
      },
      {
        q: '家具是用什麼材質製作的？它是否足夠堅固耐用？',
        a: '所有外露框架均選用 FSC 認證的北美白橡木或黑胡桃木原木精工打造，嚴禁使用劣質顆粒板或易老化的密集板。座墊採用特調的 45 kg/m³ 高回彈環保乳膠感泡棉（HR45），經 10 萬次耐疲勞下壓測試；面料則提供重磅羊羔絨（Bouclé）、防潑水燈芯絨及抗抓科技布，符合 OEKO-TEX 100 嬰兒級環保標準。',
      },
      {
        q: '免費面料樣板探索盒中包含什麼？$50 抵用券如何使用？',
        a: '樣板探索盒包含全部 4 種主推面料的完整織物大樣、2 塊 FSC 實木原木切片（白橡木與黑胡桃木原木油面）以及 1 塊真空高回彈泡棉測試塊。盒蓋內側印有一張價值 $50 的無門檻優惠兌換碼，可在您後續購買任何家具套裝時折抵現金使用。',
      },
      {
        q: '搬家時可以多次拆卸嗎？拆裝會導致結構鬆動嗎？',
        a: '與使用自攻螺絲反復破壞木質纖維的傳統板式家具不同，The Flat Set 的自鎖卡扣是由 304 不銹鋼與冷軋鋼一體沖壓而成的獨立機械五金。即使拆裝搬運 50 次以上，機械自鎖公差仍保持在 0.1 mm 內，絕不晃動、絕不產生木質異響。',
      },
      {
        q: '如果某個部件在運輸中意外受損，我該怎麼辦？',
        a: '我們的每個包裝箱均配備內嵌式蜂窩緩衝護角與防潮真空層。萬一在運輸途中因暴力快遞發生微小刮痕或破損，您只需在收到包裹後 7 天內拍照聯繫我們的禮賓客服，我們將在 48 小時內為您免費補發順豐/DHL 空運替換模組，無需整箱退回。',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: '精工匠造 · 直達客廳',
        title: '從數位工坊到您的客廳，只需 6 個扁平包裝箱。',
        subtitle:
          '每一件家具均在下單後現壓精工製作，全程碳中和極速海運直送到府，杜絕中間商加價與展廳溢價，DDP 完稅包郵直達入戶。',
      },
      steps: [
        {
          stepNumber: '01',
          title: '按需現壓精工製作',
          description:
            '我們不囤積布滿灰塵的長期庫存。您的家具在確認訂單後 48 小時內在專屬數控工坊完成裁切、包覆與現壓組裝。高回彈 HR45 泡棉定型後立即真空壓縮包裝，徹底避免受潮發霉與彈力疲勞。',
          badge: '工坊直造',
          metric: '48 小時',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6 個扁平包裝箱裝下整套一居室',
          description:
            '您的客廳、餐廳和臥室整套家具被精巧封裝進 6 個超密集扁平紙箱中（每箱重量 < 24 kg，厚度 < 20 cm）。專為輕鬆穿過狹窄的老式樓梯井與小型客用電梯而設計。',
          badge: '極致扁平規整',
          metric: '6 個標準箱',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: '標準快遞專線，零大件附加費',
          description:
            '通過將每箱嚴格控制在國際標準快件尺寸閾值內，您的家具全程經由標準快遞（FedEx / UPS / DPD）運輸。無需預約大卡車上門，無需預留 4 小時等待窗口，零搬運上樓附加費。',
          badge: '標準快遞直發',
          metric: '零意外加價',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: 'DDP 全程雙清包稅送到家門口',
          description:
            '完稅後交貨（Delivered Duty Paid）。全程國際遠洋幹線、進出口海關清關、進口關稅及當地消費稅已 100% 預付。結帳頁面顯示的金額就是您的最終支付金額。',
          badge: '關稅稅費全包',
          metric: '14–18 天',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: '100% 免工具 60 分鐘徒手自鎖拼裝',
          description:
            '零螺絲、零六角扳手、零零散散的五金零件袋。預埋的不銹鋼 Snap-Lock 自鎖卡扣徒手對準即可緊扣鎖死。ModuSofa 沙發 15 分鐘裝好，一居室整套方案單人 60 分鐘輕鬆搞定。',
          badge: '暗榫機械自鎖',
          metric: '0 顆螺絲',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: '100 天試用與「就地捐贈替代退貨」',
          description:
            '在家真實體驗 100 天。如果不合心意，我們絕不讓大件家具跨洋倒運掩埋。我們安排經認證的當地公益機構免費上門回收，並在收到捐贈收據後為您辦理 100% 全額退款。',
          badge: '綠色環保循環',
          metric: '100 天',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6 個扁平包裝箱', label: '裝下一居室全套家具', icon: 'package_2' },
        { metric: '60 分鐘', label: '單人徒手免工具拼裝', icon: 'timer' },
        { metric: '0 顆螺絲', label: '不銹鋼暗榫機械自鎖', icon: 'handyman' },
        { metric: 'DDP 全包', label: '國際關稅與稅費已預付', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: '核心差異',
        title: 'The Flat Set 極簡工程 vs. 傳統家具賣場',
        subtitle: '為什麼從現代數位工坊直接發貨的扁平箱家具，遠勝傳統家具展廳與繁復的自組平板家具。',
        rows: [
          {
            label: '拼裝過程',
            flatSetValue: '單人 15–60 分鐘徒手拼裝 · 0 顆螺絲 · 預埋自鎖卡扣',
            traditionalValue: '3–6 小時繁瑣組裝 · 120+ 螺絲 · 需電鑽與工具箱',
          },
          {
            label: '發貨與交付',
            flatSetValue: '14–18 天碳中和專線 · DDP 雙清關稅運費全包送到府',
            traditionalValue: '8–16 周漫長展廳排單 · 昂貴且苛刻的大件貨車派送',
          },
          {
            label: '座墊新鮮度',
            flatSetValue: '下單後 48 小時內定型現壓 · 零倉儲受潮塌陷',
            traditionalValue: '在集裝箱與倉庫貨架堆積 6–12 個月 · 泡棉受潮老化',
          },
          {
            label: '一居室全套花費',
            flatSetValue: '$1,499 包攬全套整屋 · 免費送樣板盒附 $50 折抵券',
            traditionalValue: '$3,800+ 零散件溢價加價 · 附加高額搬運上樓服務費',
          },
        ],
      },
      bundlePromo: {
        eyebrow: '一站式全屋方案',
        title: '一居室整屋全套家具方案',
        subtitle: 'ModuSofa 三人沙發 + SnapBed 雙人床架 + FlatCoffee 茶几 + SnapSide 邊几 + EntryRack 玄關置物架。6 個扁平包裝箱打包齊送。',
        discountCallout: '相比單件購買立省 $300',
        ctaLabel: '定制您的一居室整屋方案',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: '紐約 布魯克林',
          apartmentType: '4層老式無電梯公寓',
          quote: '在遇到 The Flat Set 之前，要把 3 人沙發搬進門框只有 65cm 的 4 樓老房子簡直是不可能的任務。2 個扁平紙箱輕鬆拎上樓梯。不到 15 分鐘就全部徒手卡緊裝好了，甚至都不需要翻看說明書。',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: '英國 倫敦',
          apartmentType: '現代精裝一居室',
          quote: 'DDP 雙清包稅的承諾非常真實——收貨後絕沒有任何莫名其妙的稅單。白橡木質感非常扎實，完全是傳家寶級的用料，燈芯絨面料拆箱即平整無褶皺。',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: '日本 東京',
          apartmentType: '極簡單身公寓',
          quote: '極其純粹的極簡主義，結構異常穩固，能完美放進狹小的單人電梯。公益捐贈替代退貨的環保政策讓我完全放心地提交了訂單。',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: '一居室整套方案', url: '/1-bedroom-kit-builder', badge: '熱銷' },
        { label: 'ModuSofa 模組沙發', url: '/products/modusofa' },
        { label: '工藝與物流解密', url: '/how-it-works-craft-logistics' },
        { label: '面料樣板盒', url: '/free-swatch-box-material-discovery', badge: '$0 免費' },
        { label: '常見問題', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6個包裝箱 · 60分鐘免工具 · 0顆螺絲 · DDP包稅包郵',
      copyrightText: 'The Flat Set. 保留所有權利。',
      navItems: [
        { label: '一居室整套方案', url: '/1-bedroom-kit-builder' },
        { label: 'ModuSofa 模組沙發', url: '/products/modusofa' },
        { label: 'SnapBed 極簡床架', url: '/products/snapbed' },
        { label: '工藝與物流解密', url: '/how-it-works-craft-logistics' },
        { label: '免費領面料樣板盒', url: '/free-swatch-box-material-discovery' },
        { label: '常見問題解答', url: '/faq' },
      ],
    },
  },

  // ==========================================
  // 德语 (de)
  // ==========================================
  'de': {
    faqs: [
      {
        q: 'Wie lange dauert die Lieferung und wie läuft der Versand ab?',
        a: 'Jedes Möbelstück wird innerhalb von 48 Stunden nach Auftragsbestätigung frisch auf Maß gefertigt und per klimaneutralem See-Express versandt. Großstädte in Europa, Nordamerika und Asien erreichen wir in 14–18 Werktagen. Alle Pakete sind auf Standard-Paketmaße optimiert (< 24 kg pro Box) und werden von DHL Express, DPD oder UPS direkt bis an Ihre Wohnungstür geliefert – ganz ohne Speditionstermine oder Aufpreise.',
      },
      {
        q: 'Was genau bedeutet DDP (Delivered Duty Paid)?',
        a: 'DDP bedeutet, dass der an der Kasse angezeigte Betrag der garantierte Endpreis ist. Er enthält sämtliche internationalen Frachtkosten, Zollabfertigungsgebühren, Einfuhrzölle und die geltende Mehrwertsteuer. Bei der Ankunft Ihrer Möbel entstehen garantiert keine Nachzahlungen oder Zollformalitäten.',
      },
      {
        q: 'Ist die Montage wirklich zu 100 % werkzeuglos?',
        a: 'Ja, absolut. Keine Schrauben, kein Inbusschlüssel, keine losen Kleinteile. Unsere präzisionsgefrästen Snap-Lock-Gelenke aus Edelstahl rasten mit einem spürbaren Klick von Hand ein. Das 3-Sitzer ModuSofa ist in 15 Minuten montiert, das komplette 1-Zimmer-Set in 60 Minuten durch eine Einzelperson. Beim Umzug lässt sich alles genauso zerstörungsfrei wieder zerlegen.',
      },
      {
        q: 'Wie funktionieren die 100-Tage-Probewohnen und die Spenden-Rückgabe?',
        a: 'Testen Sie Ihre Möbel 100 Tage lang in Ihrem echten Alltag. Sollten sie nicht perfekt zu Ihrem Wohnstil passen, schicken wir sie nicht mit hohem CO2-Aufwand über Meere zurück. Stattdessen organisieren wir die kostenlose Abholung durch eine geprüfte lokale Hilfsorganisation. Gegen Vorlage des Spendennachweises erstatten wir Ihnen 100 % des Kaufpreises zurück.',
      },
      {
        q: 'Welche Materialien werden verwendet und wie langlebig sind sie?',
        a: 'Alle sichtbaren Rahmen bestehen aus FSC-zertifizierter massiver Weißeiche oder amerikanischem Schwarznussbaum. Wir verzichten vollständig auf minderwertige Spanplatten. Für die Polsterung setzen wir hochverdichteten HR45-Kaltschaum ein (getestet auf 100.000 Belastungszyklen). Unsere Bezüge (Bouclé, Breitcord, Tech-Textil) sind OEKO-TEX 100-zertifiziert.',
      },
      {
        q: 'Was enthält die kostenlose Musterbox und wie löse ich den $50-Gutschein ein?',
        a: 'Die Musterbox enthält Originalmuster aller 4 Polsterstoffe, zwei Echtholzmuster (Eiche & Walnuss mit natürlichem Hartwachsöl) sowie einen Schaumstoffprüfkörper. Im Deckel befindet sich ein Gutscheincode im Wert von 50 USD, der beim Kauf jedes Möbelsets direkt an der Kasse angerechnet wird.',
      },
      {
        q: 'Kann das System bei Umzügen mehrfach zerlegt werden?',
        a: 'Im Gegensatz zu herkömmlichen Möbeln, deren Holzgewinde nach mehrmaligem Schrauben ausleiern, bestehen unsere Snap-Lock-Verbinder aus gestanztem 304-Edelstahl und Kaltbandstahl. Auch nach über 50 Umzügen bleibt die mechanische Passgenauigkeit unter 0,1 mm – spielfrei und geräuschlos.',
      },
      {
        q: 'Was passiert, wenn ein Paket während des Transports beschädigt wird?',
        a: 'Jede Flachbox ist mit integriertem Wabenkantenschutz und Feuchtigkeitssperre geschützt. Sollte dennoch ein Transportschaden auftreten, senden Sie uns innerhalb von 7 Tagen ein Foto. Wir versenden innerhalb von 48 Stunden ein kostenloses Ersatzmodul per Luftfracht.',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: 'PRÄZISIONSHANDWERK · DIREKTVERTRIEB',
        title: 'Von der Manufaktur in Ihr Wohnzimmer. In 6 Flachboxen.',
        subtitle:
          'Jedes Stück wird auf Abruf frisch gefertigt, klimaneutral per See-Express versandt und ohne Zwischenhändlermargen mit voller DDP-Zollübernahme direkt an Ihre Tür geliefert.',
      },
      steps: [
        {
          stepNumber: '01',
          title: 'Frisch auf Abruf gefertigt',
          description:
            'Keine verstaubte Lagerware. Ihre Möbel werden innerhalb von 48 Stunden nach Bestelleingang in unserer modernen Werkstatt zugeschnitten, bezogen und frisch verpresst. Der HR45-Kaltschaum wird direkt nach der Aushärtung vakuumversiegelt.',
          badge: 'Direkthandwerk',
          metric: '48 Std.',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6 Flachboxen für die komplette Wohnung',
          description:
            'Ihr komplettes Wohn- und Schlafkonzept findet in 6 handlichen Flachpaketen Platz (< 24 kg pro Box, < 20 cm flach). Perfekt dimensioniert für enge Altbau-Treppenhäuser und Standardaufzüge.',
          badge: 'Flachpack-System',
          metric: '6 Boxen',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: 'Regulärer Paketdienst, keine Speditionszuschläge',
          description:
            'Durch Einhaltung internationaler Paketdienstgrenzen reisen Ihre Boxen mit DHL Express, FedEx oder DPD. Keine lästigen 4-Stunden-Zeitfenster, keine Stockwerkszuschläge.',
          badge: 'Standardpaket-Express',
          metric: '0 Überraschungen',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: 'Zollfreie DDP-Haustürlieferung',
          description:
            'Delivered Duty Paid (DDP). Seefracht, Zollabfertigung, Einfuhrzölle und Mehrwertsteuer sind vollständig vorbezahlt. Der Kassenpreis ist Ihr verbindlicher Endpreis.',
          badge: 'Zölle & Steuern Inklusive',
          metric: '14–18 Tage',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: '100 % werkzeuglose 60-Minuten-Schnappmontage',
          description:
            'Null Schrauben, null Inbusschlüssel. Vorinstallierte Snap-Lock-Beschläge aus Edelstahl rasten von Hand spürbar ein. ModuSofa in 15 Min., die komplette Wohnung in 60 Min. allein montiert.',
          badge: 'Snap-Lock-Mechanik',
          metric: '0 Schrauben',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: '100 Tage Probewohnen mit Spende statt Rücksendung',
          description:
            'Leben Sie 100 Tage mit Ihren Möbeln. Bei Nichtgefallen organisieren wir die kostenlose Abholung durch eine lokale Wohltätigkeitsorganisation und erstatten 100 % nach Spendenquittung.',
          badge: 'Nachhaltige Kreislaufwirtschaft',
          metric: '100 Nächte',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6 Flachboxen', label: 'Komplette Wohnungsausstattung', icon: 'package_2' },
        { metric: '60 Minuten', label: 'Werkzeuglose Solomontage', icon: 'timer' },
        { metric: '0 Schrauben', label: 'Mechanischer Snap-Lock-Verschluss', icon: 'handyman' },
        { metric: 'DDP Inklusive', label: 'Zölle und Steuern vorbezahlt', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: 'DER UNTERSCHIED',
        title: 'The Flat Set Ingenieurskunst vs. Traditioneller Möbelhandel',
        subtitle: 'Warum der Direktversand kompakter Flachboxen aus modernen Manufakturen herkömmliche Möbelhäuser übertrifft.',
        rows: [
          {
            label: 'Aufbauprozess',
            flatSetValue: '15–60 Min. Solomontage · 0 Schrauben · Integrierte Schnappbeschläge',
            traditionalValue: '3–6 Std. Aufbaufrust · 120+ Schrauben · Werkzeugkasten erforderlich',
          },
          {
            label: 'Lieferzeit',
            flatSetValue: '14–18 Tage klimaneutraler Express · DDP zollfrei bis zur Tür',
            traditionalValue: '8–16 Wochen Wartezeit · Teure Speditionszeitfenster',
          },
          {
            label: 'Polsterfrische',
            flatSetValue: 'Binnen 48 Std. auf Abruf gepresst · Keine Lagerermüdung',
            traditionalValue: '6–12 Monate in feuchten Übersee-Containern gelagert',
          },
          {
            label: '1-Zimmer-Gesamtkosten',
            flatSetValue: '$1.499 Komplettset · Kostenlose Musterbox mit $50 Gutschein',
            traditionalValue: '$3.800+ Einzelteile · Zusätzliche Fracht- und Trageaufschläge',
          },
        ],
      },
      bundlePromo: {
        eyebrow: 'KOMPLETTES WOHNKONZEPT',
        title: '1-Zimmer Move-In Komplettset',
        subtitle: 'ModuSofa 3-Sitzer + SnapBed Doppelbett + FlatCoffee Couchtisch + SnapSide Beistelltisch + EntryRack Flurgarderobe. In 6 Boxen geliefert.',
        discountCallout: '$300 Ersparnis gegenüber Einzelkauf',
        ctaLabel: '1-Zimmer-Set Konfigurieren',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: 'Brooklyn, NY',
          apartmentType: 'Altbau 4. Stock ohne Aufzug',
          quote: 'Ein 3-Sitzer-Sofa in meine Altbauwohnung mit 65 cm Türen zu bekommen, schien unmöglich – bis The Flat Set kam. 2 Flachboxen passten mühelos durchs Treppenhaus. In unter 15 Minuten ohne Anleitung aufgebaut.',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: 'London, UK',
          apartmentType: 'Modernes 1-Zimmer-Apartment',
          quote: 'Das DDP-Versprechen ist absolut zuverlässig – keine nachträglichen Zollbescheide. Die Weißeiche fühlt sich an wie Massivholz für Generationen, und der Breitcord ist faltenfrei.',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: 'Tokio, JP',
          apartmentType: 'Studio-Apartment',
          quote: 'Minimalistisch, extrem stabil und perfekt für schmale Aufzüge. Die Spendenrückgabe hat mir 100 % Vertrauen beim Online-Kauf gegeben.',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: '1-Zimmer Komplettset', url: '/1-bedroom-kit-builder', badge: 'Beliebt' },
        { label: 'ModuSofa 3-Sitzer', url: '/products/modusofa' },
        { label: 'Handwerk & Logistik', url: '/how-it-works-craft-logistics' },
        { label: 'Kostenlose Musterbox', url: '/free-swatch-box-material-discovery', badge: '$0 Gratis' },
        { label: 'FAQ', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6 Boxen · 60 Minuten · 0 Schrauben · DDP Zölle Inklusive',
      copyrightText: 'The Flat Set. Alle Rechte vorbehalten.',
      navItems: [
        { label: '1-Zimmer Komplettset', url: '/1-bedroom-kit-builder' },
        { label: 'ModuSofa 3-Sitzer', url: '/products/modusofa' },
        { label: 'SnapBed Bettgestell', url: '/products/snapbed' },
        { label: 'Handwerk & Logistik', url: '/how-it-works-craft-logistics' },
        { label: 'Kostenlose Musterbox', url: '/free-swatch-box-material-discovery' },
        { label: 'Häufige Fragen (FAQ)', url: '/faq' },
      ],
    },
  },

  // ==========================================
  // 日语 (ja)
  // ==========================================
  'ja': {
    faqs: [
      {
        q: '注文から配達までどのくらい日数がかかりますか？配送方法は？',
        a: 'ご注文確定後、48時間以内に専用工房で木材のCNC加工とウレタンの真空加圧を完了し、カーボンニュートラルな海上エクスプレスで直送されます。日本、北米、欧州の主要都市へは通常14〜18営業日でお届けします。全荷物は標準宅配サイズ（1箱24kg未満、厚さ20cm未満）に収められており、ヤマト・佐川・DHL等の宅配員がお部屋の前まで直接お届けします。',
      },
      {
        q: 'DDP（関税元払配達）には具体的に何が含まれていますか？',
        a: 'DDPとは、決済画面に表示される金額がお客様が支払う最終総額であることを保証する仕組みです。国際海上運賃、日本国内の通関手数料、輸入関税、消費税（10%）のすべてが含まれております。荷物の到着時に追加の関税請求書が届くことは一切ございません。',
      },
      {
        q: '本当に工具は不要ですか？組み立てはどれくらい簡単ですか？',
        a: '100%工具不要、ネジ不要、六角レンチも不要です。高精度CNC加工されたステンレス製スナップロック接合金具を採用しており、手でパーツ同士を合わせて押し込むだけで「カチッ」と強固にロックされます。3人掛けModuSofaは15分、1LDKの家具一式でもお一人で約60分で完成します。',
      },
      {
        q: '100日間トライアルと「返品代替寄付プログラム」の仕組みは？',
        a: 'ご自宅のリビングで実際の光や生活動線に合わせて100日間じっくりお試しいただけます。万一お部屋に合わない場合でも、重い家具を地球の裏側へ送り返して廃棄することはありません。提携する現地の認定慈善団体が無料で引き取りに伺い、寄付証明書を確認次第、お支払い金額の100%全額をご返金いたします。',
      },
      {
        q: 'どのような素材が使われていますか？耐久性は十分ですか？',
        a: 'すべての露出フレームにはFSC認証済みの北米産ホワイトオークまたはブラックウォールナット無垢材のみを使用し、安価なパーティクルボードは一切排除しています。クッションには高密度45kg/m³のHR45ウレタン（10万回の圧縮耐久試験済）を採用。生地はOEKO-TEX 100認証のブークレ、高耐久コーデュロイ、撥水テックファブリックをご用意しています。',
      },
      {
        q: '無料スウォッチボックスには何が入っていますか？50ドルクーポンの使い方は？',
        a: '4種類すべてのファブリック実物大サンプル、2種類の無垢材ウッドチップ（オーク＆ウォールナットの天然オイル仕上げ）、真空復元ウレタンのサンプルブロックが同梱されています。ボックスのフタ裏に記載された$50クーポンコードは、次回家具セットをご購入いただく際にそのまま割引としてご利用いただけます。',
      },
      {
        q: '引越しの際に何度も解体・再組立できますか？ガタつきませんか？',
        a: '木ネジで木部を削りながら固定する従来の家具とは異なり、The Flat Setのスナップロック金具は304ステンレスと冷延鋼板で構成されています。50回以上分解・再組立を繰り返しても、噛み合わせの公差は0.1mm以下を維持し、きしみやガタつきは生じません。',
      },
      {
        q: '配送中に万一破損や傷があった場合はどうすればよいですか？',
        a: '各ボックスにはハニカム構造のコーナー緩衝材と防湿シールドが施されています。万が一、配送中の事故により木部に傷や破損が生じた場合は、受取後7日以内に写真をカスタマーコンシェルジュまでお送りください。48時間以内に航空便にて無償で交換用モジュールを発送いたします。',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: '受注生産クラフト · 産地直送',
        title: '工房からリビングまで、わずか6つの薄型ボックスで。',
        subtitle:
          'すべての家具はご注文後に作り立てを真空圧縮。中間業者のマージンを完全排除し、全額関税込みのDDP直送で玄関先までお届けします。',
      },
      steps: [
        {
          stepNumber: '01',
          title: 'ご注文ごとの作り立て・フレッシュプレス',
          description:
            '埃っぽい倉庫在庫は持ちません。ご注文確認から48時間以内にCNC精密切削と張地の仕立てを行い、作り立てをそのまま真空パッキング。ウレタンの湿気による劣化を根絶します。',
          badge: '工房直送',
          metric: '48時間以内',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6箱に収まる1LDK全室パッケージ',
          description:
            'リビング・寝室・ダイニングの全アイテムが、超高密度な6つのフラットボックス（各24kg未満、厚さ20cm未満）に整然とパッキング。狭い階段や小型エレベーターもスムーズに通過します。',
          badge: 'コンパクト規格',
          metric: '標準6箱',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: '一般宅配便でお届け・大型チャーター料ゼロ',
          description:
            '国際宅配便の標準規定サイズ内に設計されているため、ヤマト・佐川・FedExなどの定期宅配便でお届け。不便な4時間拘束の大型トラック便や階上げ追加料金は不要です。',
          badge: '宅配便直行',
          metric: '追加料金ゼロ',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: '通関・関税すべて完納のDDP玄関先お届け',
          description:
            'Delivered Duty Paid（関税元払配達）。海上運賃、通関手続き、輸入関税、消費税はすべてお支払い済みです。チェックアウト時の金額が最終お支払い総額となります。',
          badge: '関税・消費税込み',
          metric: '14〜18日',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: '工具不要・1人約60分のスナップ自鎖組立て',
          description:
            'ネジゼロ、六角レンチゼロ。埋め込み済みのステンレス製スナップロック金具を手で噛み合わせるだけ。ModuSofaなら15分、お部屋全体の家具も約60分で組み立て完了します。',
          badge: 'スナップロック機構',
          metric: 'ネジ0本',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: '100日トライアル＆寄付による返品エコシステム',
          description:
            '普段の暮らしの中で100日間お試しください。合わない場合でも海を越えて廃棄処分することはありません。現地の認定慈善団体へ寄付いただき、証明書の確認で100%全額返金いたします。',
          badge: '循環型サステナビリティ',
          metric: '100日間',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6つの薄型箱', label: '1LDK全室の家具を完全収納', icon: 'package_2' },
        { metric: '60分組立て', label: '1人でできる完全工具不要組立', icon: 'timer' },
        { metric: 'ネジ0本', label: '精密ステンレス自鎖スナップロック', icon: 'handyman' },
        { metric: 'DDP関税込み', label: '輸入関税・消費税すべて元払済', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: '決定的な違い',
        title: 'The Flat Set の精密設計 vs 従来の家具店',
        subtitle: '最新のデジタル工房から薄型箱で直送される家具が、なぜ従来のショールームや組立家具を圧倒するのか。',
        rows: [
          {
            label: '組立て工程',
            flatSetValue: '1人15〜60分 · ネジ0本 · 工場埋込済スナップロック金具',
            traditionalValue: '3〜6時間の重労働 · ネジ120本以上 · 電動ドライバー必須',
          },
          {
            label: 'お届け日数',
            flatSetValue: '14〜18日 カーボンニュートラル便 · DDP関税全額込み玄関先渡し',
            traditionalValue: '8〜16週間の入荷待ち · 高額で時間拘束の厳しいトラック便',
          },
          {
            label: 'クッションの鮮度',
            flatSetValue: '注文後48時間以内に成形・真空圧着 · 保管によるヘタリなし',
            traditionalValue: 'コンテナや多湿倉庫に6〜12ヶ月保管 · 弾力性の低下',
          },
          {
            label: '1LDK一式費用',
            flatSetValue: '$1,499 全室6点セット · 無料スウォッチ箱（$50割引券付）',
            traditionalValue: '$3,800以上の単品積上げ · 高額な搬入・組立設置費用の加算',
          },
        ],
      },
      bundlePromo: {
        eyebrow: 'オールインワン新生活パッケージ',
        title: '1LDK ムーブイン・フルセット',
        subtitle: 'ModuSofa 3人掛け + SnapBed ベッドフレーム + FlatCoffee テーブル + SnapSide サイドテーブル + EntryRack 玄関シェルフ。6箱まとめてお届け。',
        discountCallout: '単品購入より$300おトク',
        ctaLabel: '1LDK家具セットをカスタマイズ',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: '米国 ニューヨーク',
          apartmentType: 'エレベーターなし 4階アパート',
          quote: 'ドア幅がわずか65cmしかない4階の部屋にソファを入れるのは無理だと諦めていましたが、The Flat Setの薄型2箱なら階段も楽々でした。説明書を見ずに15分足らずで完成しました。',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: '英国 ロンドン',
          apartmentType: 'モダン 1ベッドルーム',
          quote: 'DDP関税元払いの約束は本物でした。後から税金の請求が来ることは一切ありません。ホワイトオークの無垢材は代々受け継げるほど上質で、コーデュロイの生地も完璧です。',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: '日本 東京',
          apartmentType: '都内 ワンルーム',
          quote: '極限まで研ぎ澄まされたミニマリズム。非常に頑丈で、コンパクトな単身用エレベーターにもすんなり入りました。寄付による返品制度があるから安心して注文できました。',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: '1LDK家具セット', url: '/1-bedroom-kit-builder', badge: '人気' },
        { label: 'ModuSofa ソファ', url: '/products/modusofa' },
        { label: '設計と物流の秘密', url: '/how-it-works-craft-logistics' },
        { label: '生地サンプル箱', url: '/free-swatch-box-material-discovery', badge: '$0 無料' },
        { label: 'よくある質問', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6箱でお届け · 60分で完成 · ネジ0本 · DDP関税込み',
      copyrightText: 'The Flat Set. 無断転載を禁じます。',
      navItems: [
        { label: '1LDK家具セット', url: '/1-bedroom-kit-builder' },
        { label: 'ModuSofa ソファ', url: '/products/modusofa' },
        { label: 'SnapBed ベッド', url: '/products/snapbed' },
        { label: '設計と物流の秘密', url: '/how-it-works-craft-logistics' },
        { label: '無料生地サンプル箱', url: '/free-swatch-box-material-discovery' },
        { label: 'よくある質問 (FAQ)', url: '/faq' },
      ],
    },
  },

  // ==========================================
  // 阿拉伯语 (ar)
  // ==========================================
  'ar': {
    faqs: [
      {
        q: 'كم يستغرق الشحن والتوصيل؟ وكيف تتم إدارة العملية؟',
        a: 'يتم تصنيع كل قطعة خصيصاً عند الطلب وضغطها طازجة خلال 48 ساعة من تأكيد الشراء، ثم شحنها عبر خط بحري فائق السرعة وخالٍ من الانبعاثات الكربونية. يستغرق الوصول إلى المدن الرئيسية في الشرق الأوسط وأوروبا وأمريكا الشمالية من 14 إلى 18 يوماً مع دفع الرسوم الجمركية مسبقاً. تم تقسيم الصناديق لتتوافق مع معايير الطرود القياسية (أقل من 24 كجم للعلبة) ليقوم مندوب التوصيل بنقلها مباشرة إلى باب شقتك دون الحاجة لشاحنات نقل ثقيل.',
      },
      {
        q: 'ماذا تعني خدمة DDP (التسليم مع سداد الرسوم الجمركية) بالتحديد؟',
        a: 'يعني التسليم مع سداد الرسوم الجمركية (DDP) أن المبلغ النهائي المعروض عند إتمام الدفع هو المبلغ الإجمالي والمطلق الذي ستدفعه. يشمل الشحن الدولي، التخليص الجمركي، جميع رسوم الاستيراد، وضريبة القيمة المضافة. لن يطلب منك دفع أي فلس إضافي أو مستندات عند وصول الشحنة إلى بلدك.',
      },
      {
        q: 'هل التجميع خالٍ تماماً من الأدوات والبراغي؟',
        a: 'نعم، 100% بدون أي أدوات أو براغي أو مفاتيح ألن. نستخدم وصلات تعشيق ميكانيكية مسبقة التثبيت ومصنوعة من الفولاذ المقاوم للصدأ بتقنية CNC. بمجرد محاذاة القطع والضغط باليد تستقر القطع في مكانها بصوت نقرة قوي ومحكم. يستغرق تجميع أريكة ModuSofa 15 دقيقة فقط، والشقة الكاملة في 60 دقيقة لشخص واحد.',
      },
      {
        q: 'كيف تعمل فترة التجربة لمدة 100 ليلة وبرنامج التبرع بدلاً من الإرجاع؟',
        a: 'عش مع أثاثك لمدة 100 ليلة كاملة في ضوء منزلك اليومي. إذا لم يناسب أسلوب حياتك، فلن نقوم بشحن الأثاث الثقيل عبر المحيطات إلى مكبات النفايات. سنقوم بترتيب استلام مجاني من قبل جمعية خيرية محلية معتمدة، وبمجرد استلام إيصال التبرع، سنعيد لك 100% من المبلغ المدفوع فوراً.',
      },
      {
        q: 'ما هي المواد المستخدمة وهل هي متينة ومستدامة؟',
        a: 'جميع الهياكل المرئية مصنوعة من خشب البلوط الأبيض الصلب أو الجوز الأسود المعتمد بشهادة FSC، ولا نستخدم إطلاقاً الألواح المضغوطة الرديئة. المقاعد محشوة بإسفنج عالي المرونة بكثافة 45 كجم/م³ (HR45) خضع لاختبار الضغط 100,000 مرة. الأقمشة معتمدة بشهادة OEKO-TEX 100 وصديقة للبيئة.',
      },
      {
        q: 'ماذا يحتوي صندوق العينات المجاني؟ وكيف أستخدم قسيمة الـ 50 دولار؟',
        a: 'يحتوي الصندوق على عينات حقيقية للأقمشة الأربعة، وقطعتين من الخشب الصلب الطبيعي (البلوط الأبيض والجوز بزيت الشمع الطبيعي)، وكتلة اختبار لإسفنج HR45. يوجد داخل الغطاء رمز قسيمة بقيمة 50 دولاراً أمريكياً يمكن خصمه مباشرة من قيمة أي طلب أثاث مستقبلي.',
      },
      {
        q: 'هل يمكن فك الأثاث وإعادة تجميعه عدة مرات عند الانتقال؟',
        a: 'على عكس الأثاث التقليدي الذي تتآكل أليافه الخشبية مع البراغي، فإن مشابك Snap-Lock في The Flat Set مصنوعة من الفولاذ المقاوم للصدأ 304. حتى بعد الفك والتركيب أكثر من 50 مرة، تظل دقة التثبيت الميكانيكي في حدود 0.1 مم بدون أي تخلخل أو صرير.',
      },
      {
        q: 'ماذا أفعل في حالة تعرض أي قطعة للتلف أثناء الشحن؟',
        a: 'كل صندوق مجهز بزوايا حماية قرص العسل وطبقة عازلة للرطوبة. في حالة حدوث أي خدش نادر أو تلف أثناء النقل، ما عليك سوى إرسال صورة لخدمة العملاء خلال 7 أيام، وسنشحن لك وحدة بديلة مجاناً عبر الشحن الجوي السريع خلال 48 ساعة.',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: 'تصنيع فائق الدقة · تسليم مباشر',
        title: 'من الورشة الرقمية إلى غرفة معيشتك في 6 صناديق مسطحة.',
        subtitle:
          'يتم تصنيع كل قطعة عند الطلب وضغطها حديثاً، وشحنها بنظام DDP الشامل للرسوم والجمارك بدون أي وسطاء مباشرة إلى باب بيتك.',
      },
      steps: [
        {
          stepNumber: '01',
          title: 'صناعة عند الطلب وضغط طازج',
          description:
            'لا نقوم بتخزين بضائع في مستودعات متربة. يتم قص وتنجيد وتجميع أثاثك في ورشتنا المتطورة خلال 48 ساعة من الطلب، مع تفريغ الهواء فوراً لحماية الإسفنج من الرطوبة.',
          badge: 'صناعة مباشرة',
          metric: '48 ساعة',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6 صناديق مسطحة لشقة كاملة',
          description:
            'أثاث غرفة المعيشة والنوم والطعام معبأ بذكاء في 6 طرود مسطحة فائقة الكثافة (أقل من 24 كجم وسمك أقل من 20 سم). صممت لتمر بسهولة عبر أضيق السلالم والمصاعد.',
          badge: 'تغليف فائق النحافة',
          metric: '6 صناديق',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: 'شحن بريدي قياسي دون رسوم إضافية',
          description:
            'من خلال الالتزام بأبعاد الطرود القياسية، تصلك الشحنة عبر شركات الطرود السريعة (FedEx / UPS / DHL) دون الحاجة لمواعيد الشاحنات الكبيرة أو رسوم الصعود للسلالم.',
          badge: 'توصيل قياسي سريع',
          metric: 'صفر مفاجآت',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: 'توصيل DDP مع سداد الرسوم الجمركية بالكامل',
          description:
            'Delivered Duty Paid. الشحن البحري الدولي، الجمارك، الضرائب، ورسوم الاستيراد مدفوعة بنسبة 100%. السعر الذي تراه عند الدفع هو السعر النهائي تماماً.',
          badge: 'الجمارك والضرائب شاملة',
          metric: '14–18 يوماً',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: 'تجميع ذاتي خالٍ من الأدوات في 60 دقيقة',
          description:
            'صفر براغي، صفر مفاتيح ألن. مشابك Snap-Lock الميكانيكية المدمجة تنقر وتغلق بقوة يديك فقط. تجميع الأريكة في 15 دقيقة والشقة الكاملة في 60 دقيقة.',
          badge: 'تعشيق ميكانيكي',
          metric: '0 براغي',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: 'تجربة 100 ليلة والتبرع بديلاً عن الإرجاع',
          description:
            'عش مع أثاثك 100 ليلة. إذا لم يعجبك، لا نعيده عبر البحار لملء مكبات النفايات؛ بل ننظم استلامه مجاناً لصالح جمعية خيرية محلية ونعيد لك كامل أموالك.',
          badge: 'استدامة تدويرية',
          metric: '100 ليلة',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6 صناديق مسطحة', label: 'تتسع لشقة كاملة بغرفة نوم', icon: 'package_2' },
        { metric: '60 دقيقة', label: 'تجميع فردي بدون أدوات', icon: 'timer' },
        { metric: '0 براغي', label: 'إغلاق ميكانيكي بالكبس Snap-Lock', icon: 'handyman' },
        { metric: 'DDP شامل', label: 'الرسوم الجمركية والضرائب مدفوعة مسبقاً', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: 'الفارق الجوهري',
        title: 'هندسة The Flat Set مقابل معارض الأثاث التقليدية',
        subtitle: 'لماذا يتفوق الأثاث المسطح المشحون مباشرة من الورش الحديثة على صالات العرض والأثاث المجمع بالبراغي.',
        rows: [
          {
            label: 'عملية التجميع',
            flatSetValue: '15–60 دقيقة لشخص واحد · صفر براغي · مشابك كبس مدمجة',
            traditionalValue: '3–6 ساعات مرهقة · 120+ برغي · مفكات وأدوات مطلوبة',
          },
          {
            label: 'وقت التوصيل',
            flatSetValue: '14–18 يوماً شحن خالٍ من الانبعاثات · DDP شامل حتى باب بيتك',
            traditionalValue: '8–16 أسبوعاً انتظار للمستودعات · شاحنات توصيل مكلفة',
          },
          {
            label: 'نضارة الحشوة',
            flatSetValue: 'ضغط طازج خلال 48 ساعة من الطلب · لا ترهل من التخزين',
            traditionalValue: 'مخزن لمدة 6–12 شهراً في حاويات رطبة · إجهاد الإسفنج',
          },
          {
            label: 'تكلفة شقة كاملة',
            flatSetValue: '$1,499 للشقة كاملة · صندوق عينات مجاني مع قسيمة $50',
            traditionalValue: '$3,800+ أسعار تراكمية مع رسوم صعود ونقل باهظة',
          },
        ],
      },
      bundlePromo: {
        eyebrow: 'منظومة منزلية متكاملة',
        title: 'باقة تأثيث شقة غرفة نوم كاملة',
        subtitle: 'أريكة ModuSofa 3 مقاعد + سرير SnapBed + طاولة FlatCoffee + طاولة جانبية SnapSide + رف EntryRack. 6 صناديق تصل معاً.',
        discountCallout: 'وفر $300 مقارنة بشراء القطع منفصلة',
        ctaLabel: 'تخصيص باقة الانتقال لشقتك',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: 'بروكلين، نيويورك',
          apartmentType: 'طابق رابع بدون مصعد',
          quote: 'كان إدخال أريكة 3 مقاعد عبر باب بعرض 65 سم في الطابق الرابع مستحيلاً حتى وجدنا The Flat Set. صعد الصندوقان المسطحان الدرج بسهولة وتجمعا في 15 دقيقة فقط بدون دليل.',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: 'لندن، المملكة المتحدة',
          apartmentType: 'شقة حديثة غرفة نوم واحدة',
          quote: 'وعد DDP حقيقي تماماً — لم تصلني أي فواتير جمارك لاحقة. خشب البلوط الأبيض الصلب يشعرك بأنه أثاث للأجيال وقماش المخمل المضلع خالٍ من أي تجاعيد.',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: 'طوكيو، اليابان',
          apartmentType: 'استوديو شقة',
          quote: 'تصميم بسيط للغاية وقوي ومتين ودخل في المصعد الصغير بكل أريحية. سياسة التبرع الخيري بدلاً من الإرجاع منحتني ثقة مطلقة للشراء.',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: 'باقة تأثيث الشقة', url: '/1-bedroom-kit-builder', badge: 'الأكثر طلباً' },
        { label: 'أريكة ModuSofa', url: '/products/modusofa' },
        { label: 'الحرفة واللوجستيات', url: '/how-it-works-craft-logistics' },
        { label: 'صندوق العينات', url: '/free-swatch-box-material-discovery', badge: '$0 مجاناً' },
        { label: 'الأسئلة الشائعة', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6 صناديق · 60 دقيقة · 0 براغي · DDP جمارك شاملة',
      copyrightText: 'The Flat Set. جميع الحقوق محفوظة.',
      navItems: [
        { label: 'باقة تأثيث الشقة', url: '/1-bedroom-kit-builder' },
        { label: 'أريكة ModuSofa', url: '/products/modusofa' },
        { label: 'سرير SnapBed', url: '/products/snapbed' },
        { label: 'الحرفة واللوجستيات', url: '/how-it-works-craft-logistics' },
        { label: 'صندوق العينات المجاني', url: '/free-swatch-box-material-discovery' },
        { label: 'الأسئلة الشائعة (FAQ)', url: '/faq' },
      ],
    },
  },

  // ==========================================
  // 俄语 (ru)
  // ==========================================
  'ru': {
    faqs: [
      {
        q: 'Сколько времени занимает доставка и как устроен логистический процесс?',
        a: 'Каждое изделие изготавливается на заказ и вакуумируется в течение 48 часов после подтверждения покупки, а затем отправляется морским экспрессом с нулевым углеродным следом. В крупные города Европы, Северной Америки и Азии доставка занимает 14–18 дней с предоплатой всех таможенных сборов. Заказ разбит на стандартные посылки (< 24 кг в коробке), которые курьер доставит прямо к двери квартиры.',
      },
      {
        q: 'Что конкретно включает в себя доставка по схеме DDP (Delivered Duty Paid)?',
        a: 'DDP означает, что сумма в корзине при оформлении заказа — это окончательная цена «под ключ». В нее включены фрахт, таможенное оформление, все импортные пошлины и НДС. По прибытии посылки в вашу страну с вас не потребуют ни одного дополнительного документа или скрытого сбора.',
      },
      {
        q: 'Действительно ли сборка происходит без единого инструмента?',
        a: 'Да, на 100%. Никаких винтов, саморезов или шестигранных ключей. Мы используем прецизионную механическую систему замков Snap-Lock из нержавеющей стали. Достаточно совместить пазы руками и нажать до характерного щелчка. 3-местный диван ModuSofa собирается за 15 минут, а весь комплект для 1-комнатной квартиры — за 60 минут в одиночку.',
      },
      {
        q: 'Как работает 100-дневный тест-драйв и «возврат через благотворительность»?',
        a: 'Живите с мебелью 100 дней в привычном освещении дома. Если она вам не подойдет, мы не повезем громоздкие коробки обратно через океан на свалку. Мы организуем бесплатный вывоз сертифицированным местным благотворительным фондом и после подтверждения передачи вернем вам 100% стоимости.',
      },
      {
        q: 'Из каких материалов изготовлена мебель и насколько она надежна?',
        a: 'Все видимые каркасы выполнены из массива белого дуба или американского ореха, сертифицированного FSC. Мы категорически не используем ДСП или МДФ. В сиденьях применен высокоэластичный латексоподобный ППУ плотностью 45 кг/м³ (HR45), рассчитанный на 100 000 циклов сжатия. Ткани имеют стандарт безопасности OEKO-TEX 100.',
      },
      {
        q: 'Что входит в бесплатный набор образцов и как применить ваучер на $50?',
        a: 'Набор включает образцы всех 4 тканей, 2 спила натурального массива дерева (дуб и орех с защитным масловоском) и тестовый блок пены HR45. На крышке коробки напечатан промокод на $50, который вычитается из суммы любого будущего заказа мебели.',
      },
      {
        q: 'Можно ли разбирать мебель при переездах? Не расшатаются ли пазы?',
        a: 'В отличие от традиционной мебели, где саморезы разрушают древесину, замки The Flat Set выполнены из стали 304. Даже после 50 переездов механический зазор замков остается в пределах 0,1 мм — без люфтов и скрипа.',
      },
      {
        q: 'Что делать, если деталь случайно повредилась при транспортировке?',
        a: 'Каждая коробка усилена сотовыми демпферами и влагозащитной пленкой. Если при доставке возникнет дефект, пришлите фото в консьерж-сервис в течение 7 дней, и мы отправим вам замену авиапочтой в течение 48 часов бесплатно.',
      },
    ],
    howItWorks: {
      hero: {
        eyebrow: 'ТОЧНОЕ РЕМЕСЛО · ПРЯМАЯ ДОСТАВКА',
        title: 'Из цифровой мастерской в вашу гостиную всего в 6 плоских коробках.',
        subtitle:
          'Каждый предмет создается по запросу, спрессовывается свежим и доставляется экспрессом с полной оплатой пошлин DDP без посредников и салонных наценок.',
      },
      steps: [
        {
          stepNumber: '01',
          title: 'Свежая компрессия по запросу',
          description:
            'Мы не храним пыльные запасы на складах. Мебель раскраивается, обивается и вакуумируется в течение 48 часов после заказа. Пена HR45 запечатывается сразу после формовки для защиты от влаги.',
          badge: 'Прямое ремесло',
          metric: '48 часов',
          icon: 'precision_manufacturing',
        },
        {
          stepNumber: '02',
          title: '6 плоских коробок для всей квартиры',
          description:
            'Мебель для спальни, гостиной и столовой компактно упакована в 6 ультраплотных коробок (< 24 кг и < 20 см в толщину). Они легко проходят по узким лестницам и в небольшие лифты.',
          badge: 'Плоская упаковка',
          metric: '6 коробок',
          icon: 'inventory_2',
        },
        {
          stepNumber: '03',
          title: 'Стандартная посылка, без доплат за габариты',
          description:
            'Благодаря соблюдению стандартных габаритов посылка идет через экспресс-службы (FedEx, UPS, DPD). Не нужно ждать грузовой транспорт часами или платить за подъем на этаж.',
          badge: 'Экспресс-доставка',
          metric: '0 сюрпризов',
          icon: 'local_shipping',
        },
        {
          stepNumber: '04',
          title: 'Доставка DDP с полной оплатой пошлин',
          description:
            'Delivered Duty Paid. Международный фрахт, таможня, пошлины и налоги оплачены на 100%. Цена в чеке является окончательной.',
          badge: 'Все пошлины включены',
          metric: '14–18 дней',
          icon: 'verified_user',
        },
        {
          stepNumber: '05',
          title: '100% сборка без инструмента за 60 минут',
          description:
            'Никаких винтов или ключей. Встроенные стальные замки Snap-Lock защелкиваются вручную. Диван собирается за 15 мин, а комплект на всю квартиру — за 60 мин одним человеком.',
          badge: 'Механика Snap-Lock',
          metric: '0 винтов',
          icon: 'build_circle',
        },
        {
          stepNumber: '06',
          title: '100 дней теста и передача на благотворительность',
          description:
            'Тестируйте мебель 100 дней. Если она вам не подойдет, мы передадим ее проверенной благотворительной организации и вернем 100% оплаты после получения акта передачи.',
          badge: 'Циркулярная экосистема',
          metric: '100 ночей',
          icon: 'volunteer_activism',
        },
      ],
    },
    homepage: {
      trustPillars: [
        { metric: '6 плоских коробок', label: 'Мебель для всей 1-комнатной квартиры', icon: 'package_2' },
        { metric: '60 минут', label: 'Сборка в одиночку без инструмента', icon: 'timer' },
        { metric: '0 винтов', label: 'Механический самозажимной замок', icon: 'handyman' },
        { metric: 'DDP включено', label: 'Пошлины и сборы полностью оплачены', icon: 'local_shipping' },
      ],
      comparisonMatrix: {
        eyebrow: 'ГЛАВНОЕ ОТЛИЧИЕ',
        title: 'Инженерия The Flat Set против традиционных мебельных салонов',
        subtitle: 'Почему доставка плоских коробок напрямую из современных мастерских превосходит мебельные гипермаркеты.',
        rows: [
          {
            label: 'Процесс сборки',
            flatSetValue: '15–60 мин сборки вручную · 0 винтов · Замки встроенные',
            traditionalValue: '3–6 часов с отверткой · 120+ деталей · Нужен шуруповерт',
          },
          {
            label: 'Сроки доставки',
            flatSetValue: '14–18 дней экспресс · DDP без доплат до двери',
            traditionalValue: '8–16 недель ожидания поставки · Дорогая грузовая доставка',
          },
          {
            label: 'Свежесть пены',
            flatSetValue: 'Прессование в течение 48 ч после заказа · Без слеживания',
            traditionalValue: '6–12 месяцев на влажных складах · Усталость поролона',
          },
          {
            label: 'Цена за квартиру',
            flatSetValue: '$1,499 за весь гарнитур · Бесплатные образцы с купоном на $50',
            traditionalValue: '$3,800+ по отдельности · Доплаты за подъем и сборку',
          },
        ],
      },
      bundlePromo: {
        eyebrow: 'ГОТОВОЕ РЕШЕНИЕ',
        title: 'Комплект новосела для 1-комнатной квартиры',
        subtitle: 'Диван ModuSofa + кровать SnapBed + журнальный столик FlatCoffee + приставной столик SnapSide + вешалка EntryRack. Все в 6 коробках.',
        discountCallout: 'Экономия $300 по сравнению с покупкой по отдельности',
        ctaLabel: 'Собрать комплект для квартиры',
      },
      testimonials: [
        {
          author: 'Elena R.',
          location: 'Бруклин, Нью-Йорк',
          apartmentType: '4-й этаж без лифта',
          quote: 'Занести диван в квартиру на 4-м этаже с узким проемом 65 см казалось невозможным, пока мы не нашли The Flat Set. 2 плоские коробки легко поднялись по лестнице и собрались за 15 минут без инструкции.',
          rating: 5,
        },
        {
          author: 'Marcus T.',
          location: 'Лондон, Великобритания',
          apartmentType: 'Современная квартира-студия',
          quote: 'Обещание DDP выполнено на 100% — никаких таможенных доплат после получения. Массив дуба монолитен, как фамильная мебель, а вельвет безупречен.',
          rating: 5,
        },
        {
          author: 'Kenji S.',
          location: 'Токио, Япония',
          apartmentType: 'Студия',
          quote: 'Безупречный минимализм, абсолютная устойчивость, легко поместился в крохотный японский лифт. Эко-возврат дал полную уверенность при заказе.',
          rating: 5,
        },
      ],
    },
    header: {
      navItems: [
        { label: 'Комплект для квартиры', url: '/1-bedroom-kit-builder', badge: 'Хит' },
        { label: 'Диван ModuSofa', url: '/products/modusofa' },
        { label: 'Ремесло и логистика', url: '/how-it-works-craft-logistics' },
        { label: 'Набор образцов', url: '/free-swatch-box-material-discovery', badge: '$0 Бесплатно' },
        { label: 'Вопросы и ответы', url: '/faq' },
      ],
    },
    footer: {
      brandSlogan: '6 коробок · 60 минут · 0 винтов · DDP пошлины включены',
      copyrightText: 'The Flat Set. Все права защищены.',
      navItems: [
        { label: 'Комплект для квартиры', url: '/1-bedroom-kit-builder' },
        { label: 'Диван ModuSofa', url: '/products/modusofa' },
        { label: 'Кровать SnapBed', url: '/products/snapbed' },
        { label: 'Ремесло и логистика', url: '/how-it-works-craft-logistics' },
        { label: 'Бесплатные образцы', url: '/free-swatch-box-material-discovery' },
        { label: 'Вопросы и ответы (FAQ)', url: '/faq' },
      ],
    },
  },
}
