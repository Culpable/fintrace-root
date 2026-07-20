'use client'

import clsx from 'clsx'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/**
 * Generic scroll-reveal wrapper for “The Exhibit”.
 *
 * Add the `is-in` class the first time the element enters the viewport,
 * then disconnect the observer so the animation never re-runs. All the
 * actual motion lives in exhibit.css keyed off `.ex-reveal.is-in`, which
 * lets each section define its own entrance (fade, slide, stamp) purely
 * in CSS while sharing a single observer implementation.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  /** Stagger offset in milliseconds, consumed by CSS as --ex-d */
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Fire once when ~12% of the element crosses into the lower viewport
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            io.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={clsx('ex-reveal', className)}
      style={delay ? ({ '--ex-d': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
