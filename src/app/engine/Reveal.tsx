'use client'

import { createElement, useCallback, type ElementType, type ReactNode, type CSSProperties } from 'react'
import clsx from 'clsx'

type RevealProps = {
  /** Element type to render so lists/sections keep semantic markup */
  as?: ElementType
  className?: string
  /** Stagger delay in milliseconds, exposed to CSS as --reveal-delay */
  delay?: number
  children: ReactNode
  id?: string
}

/**
 * Scroll-triggered reveal wrapper.
 *
 * Adds the `is-visible` class the first time the element enters the viewport,
 * then disconnects its observer — each element animates exactly once and no
 * observer keeps running after the entrance completes. All visual motion is
 * defined in engine.css (transform/opacity only) so this component stays a
 * pure trigger.
 */
export default function Reveal({ as = 'div', className, delay = 0, children, id }: RevealProps) {
  // Attach the observer through a React 19 callback ref (with its cleanup
  // returned directly), so no ref object is ever read or passed during render.
  const handleRef = useCallback((el: HTMLElement | null) => {
    if (!el) return

    // Trigger slightly before the element is fully in view so the animation
    // is already moving as the user reaches it — feels intentional, not late.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            io.disconnect()
          }
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Use createElement so the polymorphic `as` prop can carry a ref without
  // per-tag ref-type gymnastics under strict TypeScript.
  return createElement(
    as,
    {
      ref: handleRef,
      id,
      className: clsx('eng-reveal', className),
      style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
    },
    children,
  )
}
