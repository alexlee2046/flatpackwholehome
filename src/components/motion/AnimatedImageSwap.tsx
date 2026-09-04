'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

gsap.registerPlugin(useGSAP)

type AnimatedImageSwapProps = {
  alt: string
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes: string
  src: string
}

export function AnimatedImageSwap({
  alt,
  className = '',
  imageClassName = 'object-cover',
  priority = false,
  sizes,
  src,
}: AnimatedImageSwapProps) {
  const root = useRef<HTMLDivElement>(null)
  const currentLayer = useRef<HTMLDivElement>(null)
  const incomingLayer = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [images, setImages] = useState<{
    current: { alt: string; src: string }
    incoming: { alt: string; src: string } | null
    requested: string
  }>({ current: { alt, src }, incoming: null, requested: src })

  if (images.requested !== src) {
    setImages(
      images.current.src === src
        ? { current: { alt, src }, incoming: null, requested: src }
        : { ...images, incoming: { alt, src }, requested: src },
    )
  } else if (!images.incoming && images.current.src === src && images.current.alt !== alt) {
    setImages({ ...images, current: { alt, src } })
  }

  useGSAP(() => () => timeline.current?.kill(), { scope: root })

  useGSAP(
    () => {
      timeline.current?.kill()
      gsap.killTweensOf([currentLayer.current, incomingLayer.current])
      if (currentLayer.current) {
        gsap.set(currentLayer.current, {
          autoAlpha: 1,
          clearProps: 'opacity,visibility,willChange',
          scale: 1,
        })
      }
    },
    { dependencies: [src], scope: root },
  )

  const revealIncoming = () => {
    const next = images.incoming
    if (!next || next.src !== src || !incomingLayer.current) return
    const nextLayer = incomingLayer.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    timeline.current?.kill()
    gsap.killTweensOf(nextLayer)
    gsap.set(nextLayer, { autoAlpha: 0, scale: reduceMotion ? 1 : 0.985, willChange: 'transform,opacity' })

    timeline.current = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        if (root.current?.dataset.requestedSrc === next.src) {
          setImages({ current: next, incoming: null, requested: next.src })
        }
      },
    })
    timeline.current.to(
      nextLayer,
      {
        autoAlpha: 1,
        scale: 1,
        duration: reduceMotion ? 0.12 : 0.36,
        ease: 'power3.out',
        // Keep the fully-visible inline opacity through React's keyed layer
        // promotion. It is cleared before the next swap, after this layer has
        // become the stable current image.
        clearProps: 'transform,willChange',
      },
      0,
    )
  }

  const layers = images.incoming
    ? [
        { ...images.current, role: 'current' as const },
        { ...images.incoming, role: 'incoming' as const },
      ]
    : [{ ...images.current, role: 'current' as const }]

  return (
    <div
      className={twMerge('relative overflow-hidden', className)}
      data-animated-image-swap=""
      data-requested-src={src}
      ref={root}
    >
      {layers.map((layer) => {
        const isIncoming = layer.role === 'incoming'
        return (
          <div
            className={twMerge('absolute inset-0', isIncoming && 'invisible')}
            data-image-layer={layer.role}
            key={layer.src}
            ref={isIncoming ? incomingLayer : currentLayer}
          >
            <Image
              alt={layer.alt}
              className={imageClassName}
              fill
              onLoad={isIncoming ? revealIncoming : undefined}
              priority={priority}
              sizes={sizes}
              src={layer.src}
            />
          </div>
        )
      })}
    </div>
  )
}
