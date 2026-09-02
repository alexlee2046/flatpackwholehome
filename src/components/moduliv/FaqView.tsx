'use client'

import { Link } from '@/i18n/navigation'
import React, { useState } from 'react'

const FAQ_ITEMS = [
  {
    a: 'Your pieces are crafted within 48 hours of ordering, then travel by carbon-offset ocean express: 14–18 days, door to door. You get tracking at every stage and a delivery window — not a “sometime Tuesday.”',
    q: 'How long does delivery take?',
  },
  {
    a: 'Delivered Duty Paid: customs, duties and taxes are included in the price you see. Our broker clears your boxes and pays every fee — nothing is owed at the door, ever, and no surprise invoice arrives from a shipping agent two weeks later.',
    q: 'What exactly does “DDP” mean?',
  },
  {
    a: 'Really. 0 screws, 0 Allen keys, 0 hardware bags — stainless-steel Snap-Lock brackets are pre-mounted and every piece clicks together by hand. The ModuSofa takes about 5 minutes; the full 6-box, 1-bedroom kit takes most people about 60 minutes, solo. The median we measure is 58.',
    q: 'Do I really need zero tools to assemble it?',
  },
  {
    a: 'Live with it for 100 nights — nap on it, spill on it, let the cat claim it. If it doesn’t fit your life, tell us within the trial and we refund in full. No restocking fees, no “returns only if unassembled in original packaging.”',
    q: 'What if I don’t love it — how do returns work?',
  },
  {
    a: 'We practise donation-over-return: trucking a sofa back across an ocean to a landfill is the worst possible ending. We arrange free pickup by a local charity partner and issue your full refund on the donation receipt. Your piece starts a second life; you get your money back.',
    q: 'What happens to the furniture itself?',
  },
  {
    a: 'FSC®-certified solid white oak, CNC-milled to 0.1 mm tolerances and finished with water-based matte lacquer; nickel-free stainless-steel Snap-Lock brackets; HR45 high-resilience foam, fresh-pressed and vacuum-sealed the day it cures; and OEKO-TEX® certified covers that zip off for washing. Oak frames carry a 5-year warranty; fabrics and zips, 2 years.',
    q: 'What are the pieces made of?',
  },
  {
    a: 'Order the free Curated Swatch Box — four full-weave fabrics, two foam slices, oak and walnut chips. The box is free ($5 expedited airmail). Inside the lid is your $50 voucher, single-use, valid 60 days from delivery, redeemable on any sofa, bed or bundle — and it stacks on top of Move-In Bundle pricing.',
    q: 'How does the free swatch box and $50 voucher work?',
  },
  {
    a: 'Standard ocean freight: 14–18 days, fully carbon-offset, DDP included. Need it sooner? Expedited air-cargo is available at checkout for certain metro areas (5–7 days, +$220).',
    q: 'What shipping options do you offer?',
  },
]

export function FaqView() {
  const [search, setSearch] = useState('')

  const filtered = FAQ_ITEMS.filter((item) => {
    const q = search.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

  return (
    <main
      className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-8 pb-section-gap"
      id="main"
      tabIndex={-1}
    >
      <nav className="flex items-center gap-2 text-sm font-label-md text-on-surface-variant mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">FAQ</span>
      </nav>

      <header className="mb-12 max-w-2xl">
        <span className="block font-label-md text-label-md text-primary tracking-[0.1em] uppercase mb-4">
          THE PLAIN-LANGUAGE VERSION
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
          Questions, Answered Without a Sales Call.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Shipping times, assembly, returns, materials, duties, and your $50 swatch voucher — the eight things people actually ask, answered the way we&apos;d answer a friend.
        </p>
      </header>

      <div className="max-w-md mb-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm rounded focus:outline-none focus:border-primary"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter questions (e.g. shipping, duties, refund)..."
            type="search"
            value={search}
          />
        </div>
      </div>

      <div className="max-w-3xl border-t border-outline-variant/40" id="faq-accordion-container">
        {filtered.map((item, idx) => (
          <details
            className="group border-b border-outline-variant/40"
            key={item.q}
            open={idx === 0 || !!search}
          >
            <summary className="flex justify-between items-center py-6 cursor-pointer list-none gap-6">
              <span className="font-headline-sm text-[20px] text-on-surface">{item.q}</span>
              <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180">
                arrow_downward
              </span>
            </summary>
            <p className="font-body-md text-body-md text-on-surface-variant pb-6 pr-8">{item.a}</p>
          </details>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-on-surface-variant">
            No questions matching &ldquo;{search}&rdquo;. Feel free to email our studio directly at hello@moduliv.studio.
          </div>
        )}
      </div>
    </main>
  )
}
