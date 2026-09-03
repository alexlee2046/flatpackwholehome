'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

const CITIES = [
  { name: 'Los Angeles, CA', taxRate: 0.1025, label: '加州洛杉矶 (10.25%)' },
  { name: 'New York City, NY', taxRate: 0.08875, label: '纽约市 (8.875%)' },
  { name: 'Chicago, IL', taxRate: 0.10, label: '芝加哥 (10.00%)' },
  { name: 'Seattle, WA', taxRate: 0.101, label: '西雅图 (10.10%)' },
  { name: 'Austin, TX', taxRate: 0.0825, label: '奥斯汀 (8.25%)' },
  { name: 'Portland, OR', taxRate: 0.0, label: '波特兰 (0% 免税)' },
]

const TRANSPORT_MODES = [
  { id: 'uhaul', name: 'U-Haul 租货车自提 + 油费 ($115)', cost: 115 },
  { id: 'ikea-truck', name: '宜家官方同城卡车派送 ($79)', cost: 79 },
  { id: 'own-car', name: '自备大车/朋友帮忙 ($0)', cost: 0 },
]

export function IkeaComparisonView() {
  const tNav = useTranslations('Navigation')
  const [selectedCityIndex, setSelectedCityIndex] = useState(0)
  const [selectedTransportId, setSelectedTransportId] = useState('uhaul')

  const currentCity = CITIES[selectedCityIndex]
  const currentTransport = TRANSPORT_MODES.find((m) => m.id === selectedTransportId) || TRANSPORT_MODES[0]

  // Math variables
  const ikeaSubtotal = 1894.0
  const flatSetSubtotal = 1499.0
  const tagSavings = ikeaSubtotal - flatSetSubtotal // $395.00
  const tagSavingsPercent = ((tagSavings / ikeaSubtotal) * 100).toFixed(1) // 20.8%

  const ikeaTax = ikeaSubtotal * currentCity.taxRate
  const ikeaLandedTotal = ikeaSubtotal + ikeaTax + currentTransport.cost
  const totalLandedSavings = ikeaLandedTotal - flatSetSubtotal
  const landedSavingsPercent = ((totalLandedSavings / ikeaLandedTotal) * 100).toFixed(1)

  return (
    <div className="w-full bg-[#F9F8F6] text-[#1a1c1d] pb-24">
      {/* Header Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-12 pt-8">
        <nav className="flex items-center text-sm font-label-md text-neutral-500 mb-6 gap-2">
          <Link className="hover:text-primary transition-colors" href="/">
            Home
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-neutral-900 font-medium">Why We're 20% Cheaper Than IKEA</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Pricing Transparency &amp; Direct-From-Atelier Economics
          </div>
          <h1 className="font-display-lg text-[32px] sm:text-[54px] leading-[1.12] text-neutral-900 mb-6 font-semibold">
            为什么我们不仅比当地宜家便宜 20%，
            <br className="hidden sm:inline" />
            还能让您的到手开销立省超 30%？
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed font-normal max-w-3xl">
            宜家的标价并不等于您的实际买单成本。我们将全套一室一厅压缩进 <strong>6 个标准小纸箱（0.51 CBM）</strong>，
            通过 DDP 双清海派直达您的家门，砍掉所有中间环节与超大件运费罚款。
          </p>
        </header>

        {/* Interactive Simulator Card */}
        <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 border-b border-neutral-100">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
                Live Cost Simulator
              </span>
              <h2 className="text-2xl font-bold text-neutral-900">
                美国当地宜家到手真实开销模拟器
              </h2>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-neutral-500">所在城市消费税：</label>
                <select
                  value={selectedCityIndex}
                  onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-primary"
                >
                  {CITIES.map((c, idx) => (
                    <option key={c.name} value={idx}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-neutral-500">前往当地宜家自提方式：</label>
                <select
                  value={selectedTransportId}
                  onChange={(e) => setSelectedTransportId(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-primary"
                >
                  {TRANSPORT_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Simulator Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {/* IKEA Side */}
            <div className="rounded-xl p-6 bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-neutral-700 text-sm uppercase tracking-wider">
                  当地宜家实体店买全套
                </span>
                <span className="text-xs px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-full font-semibold">
                  自提 / 卡车送货
                </span>
              </div>
              <div className="space-y-3 text-sm text-neutral-600 mb-6">
                <div className="flex justify-between">
                  <span>5大件家具货架标价小计：</span>
                  <span className="font-semibold text-neutral-900">${ikeaSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>当地州税与市税 ({(currentCity.taxRate * 100).toFixed(2)}%)：</span>
                  <span className="font-semibold">+${ikeaTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>提货交通/运费成本：</span>
                  <span className="font-semibold">+${currentTransport.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-xs">
                  <span>组装耗时（需工具与螺丝）：</span>
                  <span>约 4~6 小时 (或 TaskRabbit $250+)</span>
                </div>
              </div>
              <div className="border-t border-neutral-200 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-900">实付到手总花费：</span>
                <span className="text-2xl font-extrabold text-neutral-900">
                  ${ikeaLandedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* The Flat Set Side */}
            <div className="rounded-xl p-6 bg-primary/5 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
                Direct Atelier DDP
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-primary text-sm uppercase tracking-wider">
                  The Flat Set 6箱一室一厅全屋套
                </span>
              </div>
              <div className="space-y-3 text-sm text-neutral-600 mb-6">
                <div className="flex justify-between">
                  <span>全套全包一口价 (6大件)：</span>
                  <span className="font-semibold text-neutral-900">${flatSetSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>进口关税与消费税 (DDP 双清包税)：</span>
                  <span className="font-bold">$0.00 (全包)</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>国际海派门到门派送 (102kg/6箱)：</span>
                  <span className="font-bold">$0.00 (包邮)</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>专利自锁结构组装：</span>
                  <span className="text-primary font-bold">单人 60 分钟 · 0 螺丝</span>
                </div>
              </div>
              <div className="border-t border-primary/20 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-primary">您只需支付：</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-primary">
                    ${flatSetSubtotal.toFixed(2)}
                  </span>
                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    比当地宜家直省 ${totalLandedSavings.toFixed(2)} ({landedSavingsPercent}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Granular Breakdown Table Section */}
        <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                Package Breakdown &amp; BOM Economics
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                一室一厅全屋套餐 ($1,499) 逐件分摊定价、目标采购价与毛利全景表
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                汇率按 1 USD ≈ 7.20 RMB 测算 · DDP 海派运费按 <strong>18 RMB/kg ($2.50/kg)</strong> 高安全线精算
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              全套出厂毛利率: 77.7% · 履约毛利率: 60.6% (DDP @ 18元/kg)
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 sm:-mx-10 mb-8">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-neutral-50 border-y border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-600">
                  <th className="py-3.5 px-6">箱号 / 包含单品</th>
                  <th className="py-3.5 px-4 text-right">单买零售价</th>
                  <th className="py-3.5 px-4 text-right">套餐分摊价</th>
                  <th className="py-3.5 px-4 text-right">目标采购价 (BOM)</th>
                  <th className="py-3.5 px-4 text-right">DDP海派 (18元/kg)</th>
                  <th className="py-3.5 px-4 text-right">出厂毛利 (毛利率)</th>
                  <th className="py-3.5 px-6 text-right">履约贡献毛利 (毛利率)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 text-sm text-neutral-700 font-medium">
                <tr className="hover:bg-neutral-50/80 transition">
                  <td className="py-4 px-6 font-semibold text-neutral-900">
                    Box 1 &amp; 2: ModuSofa<br />
                    <span className="text-xs font-normal text-neutral-500">3人位模块沙发 (38.5kg / 2箱)</span>
                  </td>
                  <td className="py-4 px-4 text-right text-neutral-600">$699.00</td>
                  <td className="py-4 px-4 text-right font-bold text-primary">$599.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                    $115.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥828 元</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sky-700 font-semibold">
                    $96.25<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥693 元</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                    $484.00<br />
                    <span className="text-[11px] font-bold text-emerald-600">80.8%</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-neutral-900">
                    $387.75<br />
                    <span className="text-[11px] font-bold text-emerald-700">64.7%</span>
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80 transition">
                  <td className="py-4 px-6 font-semibold text-neutral-900">
                    Box 3: FlatCoffee<br />
                    <span className="text-xs font-normal text-neutral-500">CNC 榫卯咖啡几 (14.0kg / 1箱)</span>
                  </td>
                  <td className="py-4 px-4 text-right text-neutral-600">$149.00</td>
                  <td className="py-4 px-4 text-right font-bold text-primary">$129.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                    $32.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥230 元</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sky-700 font-semibold">
                    $35.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥252 元</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                    $97.00<br />
                    <span className="text-[11px] font-bold text-emerald-600">75.2%</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-neutral-900">
                    $62.00<br />
                    <span className="text-[11px] font-bold text-emerald-700">48.1%</span>
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80 transition">
                  <td className="py-4 px-6 font-semibold text-neutral-900">
                    Box 4: ModuMedia<br />
                    <span className="text-xs font-normal text-neutral-500">模块双门电视柜 (18.0kg / 1箱)</span>
                  </td>
                  <td className="py-4 px-4 text-right text-neutral-600">$249.00</td>
                  <td className="py-4 px-4 text-right font-bold text-primary">$219.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                    $58.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥418 元</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sky-700 font-semibold">
                    $45.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥324 元</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                    $161.00<br />
                    <span className="text-[11px] font-bold text-emerald-600">73.5%</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-neutral-900">
                    $116.00<br />
                    <span className="text-[11px] font-bold text-emerald-700">53.0%</span>
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80 transition">
                  <td className="py-4 px-6 font-semibold text-neutral-900">
                    Box 5: SnapBed<br />
                    <span className="text-xs font-normal text-neutral-500">Queen 自锁软包大床 (19.5kg / 1箱)</span>
                  </td>
                  <td className="py-4 px-4 text-right text-neutral-600">$349.00</td>
                  <td className="py-4 px-4 text-right font-bold text-primary">$379.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                    $95.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥684 元</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sky-700 font-semibold">
                    $48.75<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥351 元</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                    $284.00<br />
                    <span className="text-[11px] font-bold text-emerald-600">74.9%</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-neutral-900">
                    $235.25<br />
                    <span className="text-[11px] font-bold text-emerald-700">62.1%</span>
                  </td>
                </tr>

                <tr className="hover:bg-neutral-50/80 transition">
                  <td className="py-4 px-6 font-semibold text-neutral-900">
                    Box 6: FloatNight<br />
                    <span className="text-xs font-normal text-neutral-500">悬浮快装床头柜一对 (12.0kg / 1箱)</span>
                  </td>
                  <td className="py-4 px-4 text-right text-neutral-600">$199.00</td>
                  <td className="py-4 px-4 text-right font-bold text-primary">$173.00</td>
                  <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                    $35.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥252 元</span>
                  </td>
                  <td className="py-4 px-4 text-right text-sky-700 font-semibold">
                    $30.00<br />
                    <span className="text-[11px] font-normal text-neutral-400">¥216 元</span>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                    $138.00<br />
                    <span className="text-[11px] font-bold text-emerald-600">79.8%</span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-neutral-900">
                    $108.00<br />
                    <span className="text-[11px] font-bold text-emerald-700">62.4%</span>
                  </td>
                </tr>

                {/* Total Row */}
                <tr className="bg-primary/5 font-bold text-neutral-900">
                  <td className="py-5 px-6 text-primary">
                    ★ 全套 6 箱套装合计<br />
                    <span className="text-xs font-normal text-primary/80">全套 0.51 CBM / 102.0kg</span>
                  </td>
                  <td className="py-5 px-4 text-right font-semibold text-neutral-500 line-through">$1,645.00</td>
                  <td className="py-5 px-4 text-right font-extrabold text-xl text-primary">$1,499.00</td>
                  <td className="py-5 px-4 text-right font-extrabold text-neutral-900">
                    $335.00<br />
                    <span className="text-xs text-neutral-600 font-normal">¥2,412 元</span>
                  </td>
                  <td className="py-5 px-4 text-right font-extrabold text-sky-800">
                    $255.00<br />
                    <span className="text-xs text-neutral-600 font-normal">¥1,836 元 (18元/kg)</span>
                  </td>
                  <td className="py-5 px-4 text-right font-extrabold text-emerald-800">
                    $1,164.00<br />
                    <span className="text-xs font-bold text-emerald-600">77.7%</span>
                  </td>
                  <td className="py-5 px-6 text-right font-extrabold text-xl text-neutral-900">
                    $909.00<br />
                    <span className="text-xs font-bold text-emerald-700">60.6% (履约贡献毛利)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Factory Procurement Cards */}
          <div className="border-t border-neutral-200 pt-8">
            <div className="max-w-2xl mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">
                目标出厂采购价 (BOM) 工艺与选材底牌
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                明确各部件用料及对标产业带，工厂采购谈判底线标准
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-neutral-900 text-sm">ModuSofa 3人沙发</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    $115 (¥828)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mb-2">产业带：广东佛山顺德 / 九江镇</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• 35D/40D 复合切片高弹海绵 (约 ¥200)</li>
                  <li>• 碳钢冲压底框 + 自锁铰链 (约 ¥150)</li>
                  <li>• 羊羔绒/雪尼尔拆洗面料 8米 (约 ¥220)</li>
                  <li>• 现压即时真空包装袋 + 外箱 (约 ¥60)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-neutral-900 text-sm">SnapBed Queen大床</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    $95 (¥684)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mb-2">产业带：江西赣州南康 / 佛山</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• 哑光喷涂碳钢快装边梁 (约 ¥240)</li>
                  <li>• 12mm 桦木实木排骨条+静音带 (约 ¥120)</li>
                  <li>• 薄款高回弹海绵软包床头屏 (约 ¥180)</li>
                  <li>• 长条形扁平防震纸箱 (约 ¥45)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-neutral-900 text-sm">ModuMedia 电视柜</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    $58 (¥418)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mb-2">产业带：山东临沂 / 江苏徐州</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• E0 级 15mm 桦木多层板 CNC (约 ¥240)</li>
                  <li>• 出厂预装阻尼铰链+反弹器 (约 ¥50)</li>
                  <li>• 一体理线槽 + 超薄平装箱 (约 ¥30)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-neutral-900 text-sm">FlatCoffee 咖啡几</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    $32 (¥230)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mb-2">产业带：广东佛山 / 江西赣州</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• 18mm 白橡纹多层板 (约 ¥140)</li>
                  <li>• CNC 精密十字榫卯 (0 五金螺丝)</li>
                  <li>• 环保水性哑光清漆 (约 ¥40)</li>
                  <li>• 厚度仅 6cm 极薄抗压扁箱 (约 ¥25)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-neutral-900 text-sm">FloatNight 悬浮床头柜(对)</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    $35 (¥252)
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-semibold mb-2">产业带：山东临沂 / 佛山</p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• 12mm 极简抽屉盒单只约 ¥100 (两只 ¥200)</li>
                  <li>• 免打孔自锁挂接五金</li>
                  <li>• 双只合一紧凑小方箱 (约 ¥25)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-emerald-950 text-sm">★ 增购款: RollMattress 床垫</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    加购 $349 (BOM $85)
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-semibold mb-2">加购贡献毛利：$209 (59.9% @ 18元/kg)</p>
                <ul className="text-xs text-emerald-900/80 space-y-1">
                  <li>• 独立袋装弹簧 + 凝胶记忆棉 (¥612 元)</li>
                  <li>• 22kg 真空卷包圆柱箱，DDP海派约 $55 (¥396)</li>
                  <li>• 用户加购后全屋客单价提升至 <strong>$1,848</strong></li>
                  <li>• 无额外投流成本，纯利润直增 <strong>$164+</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Unit Economics Waterfall Section */}
        <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm mb-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
              Financial Robustness
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
              比宜家便宜 20% 后，财务模型还能撑住吗？
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              以核心爆款 $1,499.00（一室一厅 6 箱套）美线 DDP 海派按 <strong>18 RMB/kg ($255.00)</strong> 高安全线全链路测算：
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600">1. 工厂制造 BOM 出厂成本 (沙发+床架+柜几)</span>
                  <span className="text-neutral-900 font-bold">$335.00 (22.3%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-400 rounded-full" style={{ width: '22.3%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600">2. 国际 DDP 海派专线门到门 (102kg @ 18 RMB/kg = ¥1,836元)</span>
                  <span className="text-neutral-900 font-bold">$255.00 (17.0%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '17.0%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600">3. 独立站营销获客 CAC (Meta / Google 投流)</span>
                  <span className="text-neutral-900 font-bold">$220.00 (14.7%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '14.7%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600">4. 支付网关通道与平台扣点 (Stripe 2.9% + Shopify 2%)</span>
                  <span className="text-neutral-900 font-bold">$73.00 (4.9%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-300 rounded-full" style={{ width: '4.9%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-600">5. 售后备件、面料小样盒与以捐代退准备金</span>
                  <span className="text-neutral-900 font-bold">$45.00 (3.0%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: '3.0%' }}></div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700 uppercase tracking-wider">
                    ★ 单套最终纯净利润 (Net Profit Margin: 37.8%)
                  </span>
                  <span className="text-emerald-700 font-extrabold text-sm">$566.00 (37.8%)</span>
                </div>
                <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '37.8%' }}></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-xl border border-neutral-200 text-neutral-700 text-sm leading-relaxed space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                为什么即使按 18 元/kg，还能保留 37.8% 净利？
              </div>
              <p>
                即使按照 <strong>18 RMB/kg ($2.50/kg)</strong> 的高安全线保守标准测算跨国海派（包含旺季附加费与美东远途派送），全套 6 箱运费增加到 <strong>$255 美元</strong>。
              </p>
              <p>
                但得益于<strong>高弹海绵真空压缩（体积缩减 70%）+ 0.51 CBM 紧凑箱规</strong>，我们彻底避开了卡车 Freight 超大件罚款，全套单套依然能狂揽 <strong>$566 美金（约 4,070 元人民币）纯利润</strong>！
              </p>
              <div className="pt-3">
                <Link
                  href="/1-bedroom-kit-builder"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-primary text-white font-label-md text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors"
                >
                  <span>立即定制一室一厅全套 ($1,499)</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
