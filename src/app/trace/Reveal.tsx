'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

/**
 * Observe the wrapped block and add `is-in` once it scrolls into view.
 *
 * The component is intentionally style-agnostic: it only toggles the class.
 * Callers opt into the default rise-and-fade motion by also passing the
 * `rv` class, or hang bespoke CSS animations off `.is-in` (as the
 * money-flow diagram does). `delay` staggers siblings via a CSS variable.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.18,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reveal once, then stop observing - replays on scroll feel gimmicky.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return (
    <div ref={ref} className={clsx(className, inView && 'is-in')} style={{ '--rv-delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  )
}
