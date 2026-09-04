'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React, { useRef } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function HomeMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const scope = root.current
      if (!scope) return

      const mm = gsap.matchMedia()
      mm.add(
        {
          desktop: '(min-width: 768px)',
          mobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean
            mobile: boolean
            reduceMotion: boolean
          }
          const heroItems = gsap.utils.toArray<HTMLElement>('[data-home-hero-copy]')
          const heroImage = scope.querySelector<HTMLElement>('[data-home-hero-image]')
          const hero = scope.querySelector<HTMLElement>('[data-home-hero]')

          if (reduceMotion) {
            gsap.fromTo(
              [...heroItems, ...(heroImage ? [heroImage] : [])],
              { autoAlpha: 0.86 },
              { autoAlpha: 1, duration: 0.16, stagger: 0.015, clearProps: 'opacity,visibility' },
            )
          } else {
            const intro = gsap.timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () => {
                hero?.setAttribute('data-motion-state', 'complete')
                gsap.set([...heroItems, ...(heroImage ? [heroImage] : [])], { clearProps: 'willChange' })
              },
            })
            intro.fromTo(
              heroItems,
              { autoAlpha: 0, y: desktop ? 18 : 10 },
              {
                autoAlpha: 1,
                y: 0,
                duration: desktop ? 0.42 : 0.32,
                stagger: { amount: 0.24 },
                willChange: 'transform,opacity',
              },
              0,
            )
            if (heroImage) {
              intro.fromTo(
                heroImage,
                { clipPath: 'inset(0 50% 0 0)', scale: desktop ? 1.025 : 1.012 },
                {
                  clipPath: 'inset(0 0% 0 0)',
                  scale: 1,
                  duration: desktop ? 0.75 : 0.55,
                  willChange: 'clip-path,transform',
                },
                0.03,
              )
            }
          }

          const stats = gsap.utils.toArray<HTMLElement>('[data-home-stat]')
          const dividers = gsap.utils.toArray<HTMLElement>('[data-home-stat-divider]')
          if (stats.length) {
            const statsTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: '[data-home-stats]',
                start: 'top 82%',
                once: true,
                refreshPriority: 1,
              },
              onComplete: () => gsap.set([...stats, ...dividers], { clearProps: 'willChange' }),
            })
            statsTimeline.fromTo(
              stats,
              { autoAlpha: 0, y: reduceMotion ? 0 : desktop ? 12 : 6 },
              {
                autoAlpha: 1,
                y: 0,
                duration: reduceMotion ? 0.14 : 0.38,
                ease: 'power3.out',
                stagger: { amount: reduceMotion ? 0.04 : 0.24 },
                willChange: 'transform,opacity',
              },
            )
            if (dividers.length && !reduceMotion) {
              statsTimeline.fromTo(
                dividers,
                { scaleY: 0, transformOrigin: 'center top' },
                { scaleY: 1, duration: 0.38, ease: 'power3.out', stagger: 0.05, willChange: 'transform' },
                0.05,
              )
            }
          }

          const comparisonCells = gsap.utils.toArray<HTMLElement>('[data-comparison-focus]')
          if (comparisonCells.length) {
            gsap.fromTo(
              comparisonCells,
              { autoAlpha: 0.72, x: reduceMotion ? 0 : desktop ? 12 : 6 },
              {
                autoAlpha: 1,
                x: 0,
                duration: reduceMotion ? 0.14 : 0.42,
                ease: 'power3.out',
                stagger: { amount: reduceMotion ? 0.03 : 0.18 },
                willChange: 'transform,opacity',
                clearProps: 'transform,opacity,visibility,willChange',
                scrollTrigger: {
                  trigger: '[data-home-comparison]',
                  start: 'top 78%',
                  once: true,
                  refreshPriority: 2,
                },
              },
            )
          }

          const bundleImage = scope.querySelector<HTMLElement>('[data-home-bundle-image]')
          if (bundleImage) {
            gsap.fromTo(
              bundleImage,
              { clipPath: reduceMotion ? 'inset(0 0 0 0)' : 'inset(0 18% 0 0)' },
              {
                clipPath: 'inset(0 0% 0 0)',
                duration: reduceMotion ? 0.14 : 0.58,
                ease: 'power3.out',
                willChange: reduceMotion ? 'opacity' : 'clip-path',
                clearProps: 'clipPath,willChange',
                scrollTrigger: {
                  trigger: '[data-home-bundle]',
                  start: 'top 80%',
                  once: true,
                  refreshPriority: 3,
                },
              },
            )
          }
        },
        scope,
      )

      let refreshed = false
      const refreshOnce = () => {
        if (refreshed) return
        refreshed = true
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }
      if (document.readyState === 'complete') refreshOnce()
      else window.addEventListener('load', refreshOnce, { once: true })

      return () => {
        window.removeEventListener('load', refreshOnce)
        mm.revert()
      }
    },
    { scope: root },
  )

  return <div ref={root}>{children}</div>
}
