'use client'

import { useEffect, useRef } from 'react'
import { useClubMotion } from './motion-context'
import { readPaused } from './motion-store'

/** Animation is progressive enhancement: no content is hidden before observation. */
export function RoomScene({
  children,
  path,
}: {
  children: React.ReactNode
  path: string
}) {
  const root = useRef<HTMLElement>(null)
  const enteredPath = useRef<string | null>(null)
  const seen = useRef(new WeakSet<HTMLElement>())
  const { paused } = useClubMotion()
  useEffect(() => {
    const main = root.current
    if (
      !main ||
      paused ||
      readPaused() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !main.animate
    )
      return
    const animations = new Set<Animation>()
    const track = (
      element: HTMLElement,
      frames: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const animation = element.animate(frames, options)
      animations.add(animation)
      animation.onfinish = () => {
        animations.delete(animation)
        element.dataset.chessReveal = 'settled'
      }
    }
    if (enteredPath.current !== path) {
      enteredPath.current = path
      seen.current = new WeakSet<HTMLElement>()
      track(
        main,
        [
          {
            transform: 'perspective(1600px) rotateY(-2deg) translateX(18px)',
            opacity: 0.6,
          },
          {
            transform: 'perspective(1600px) rotateY(0) translateX(0)',
            opacity: 1,
          },
        ],
        { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' },
      )
    }
    if (!('IntersectionObserver' in window))
      return () => animations.forEach((animation) => animation.cancel())
    const observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          observer.unobserve(element)
          if (seen.current.has(element)) continue
          seen.current.add(element)
          const base = getComputedStyle(element).transform
          const final = base === 'none' ? '' : base
          const kind = element.matches('.chess-folio')
            ? 'folio'
            : element.matches('.chess-scoresheet,.chess-notebook-row')
              ? 'sheet'
              : 'panel'
          element.dataset.chessReveal = kind
          const transform =
            kind === 'folio'
              ? `perspective(1100px) translateY(28px) rotateY(-12deg) rotateZ(-1deg) ${final}`
              : kind === 'sheet'
                ? `translateY(22px) rotate(2deg) ${final}`
                : `perspective(1400px) translateY(16px) rotateX(4deg) ${final}`
          track(
            element,
            [
              { transform, opacity: 0.35 },
              { transform: base, opacity: 1 },
            ],
            {
              duration: kind === 'folio' ? 740 : 620,
              delay: Math.min(stagger++ * 85, 170),
              easing: 'cubic-bezier(.16,1,.3,1)',
              fill: 'backwards',
            },
          )
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' },
    )
    main
      .querySelectorAll<HTMLElement>(
        '.chess-section-heading,.chess-folio,.chess-scoresheet,.chess-notebook-row,.chess-invitation,.chess-letter,.chess-document,.chess-portrait',
      )
      .forEach((element) => observer.observe(element))
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
    }
  }, [path, paused])
  return (
    <main ref={root} id="chess-content" className="chess-content" tabIndex={-1}>
      {children}
    </main>
  )
}
