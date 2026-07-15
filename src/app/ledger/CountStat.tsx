'use client'

import { useEffect, useRef } from 'react'

/**
 * Animated statistic numeral for the proof band.
 *
 * Count from `from` to `to` with an ease-out curve the first time the
 * numeral scrolls into view. Rendering targets a single text node via ref,
 * so the animation never re-renders React state. requestAnimationFrame is
 * throttled by the browser when the tab is hidden, which naturally pauses
 * the count without extra bookkeeping.
 */
export default function CountStat({
  from = 0,
  to,
  duration = 1400,
  decimals = 0,
}: {
  from?: number
  to: number
  duration?: number
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let raf = 0

    // Format with en-AU grouping so large figures read like ledger entries.
    const format = (value: number) =>
      value.toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

    const run = () => {
      let start: number | null = null

      const tick = (now: number) => {
        if (start === null) start = now
        const progress = Math.min((now - start) / duration, 1)
        // Ease-out cubic: fast start, gentle settle — reads as “reconciling”.
        const eased = 1 - Math.pow(1 - progress, 3)
        node.textContent = format(from + (to - from) * eased)
        if (progress < 1) raf = requestAnimationFrame(tick)
      }

      raf = requestAnimationFrame(tick)
    }

    // Start counting only when the numeral is actually seen, and only once.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
            observer.disconnect()
          }
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [from, to, duration, decimals])

  // Render the starting value so markup is meaningful before hydration.
  return <span ref={ref}>{from.toLocaleString('en-AU', { minimumFractionDigits: decimals })}</span>
}
