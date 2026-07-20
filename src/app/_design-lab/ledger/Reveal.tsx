'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Scroll-reveal wrapper for “The Ledger”.
 *
 * Add the `is-inview` class exactly once when the block enters the
 * viewport; ledger.css keys every entrance (rule draws, fade-ups,
 * staggered children) off that single class so the observer stays cheap.
 */
export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Observe once and disconnect immediately after triggering: reveals
    // never reverse, so keeping the observer alive would be waste.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-inview')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.18 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`lg-reveal ${className}`}>
      {children}
    </div>
  )
}
