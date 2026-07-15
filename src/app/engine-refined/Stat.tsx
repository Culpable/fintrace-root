'use client'

import { useEffect, useRef } from 'react'

type StatProps = {
  /** Starting value shown before (and during) the count animation */
  from?: number
  /** Final value the counter settles on */
  to: number
  /** Animation length in milliseconds */
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Animated numeral for the proof plate.
 *
 * Counts from `from` to `to` the first time it scrolls into view — including
 * downwards (the signature 50 → 10 hours stat runs the meter backwards).
 * Renders the starting value on the server so static export markup is real
 * content, then animates via requestAnimationFrame with an ease-out curve.
 */
export default function Stat({ from = 0, to, duration = 1800, prefix = '', suffix = '', className }: StatProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let rafId = 0

    // Start counting only when the numeral is properly on screen so the
    // movement is actually witnessed, then never re-run.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        io.disconnect()
        const startedAt = performance.now()

        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration)
          // Ease-out quartic: fast movement early, a slow satisfying settle.
          const eased = 1 - Math.pow(1 - progress, 4)
          el.textContent = `${prefix}${Math.round(from + (to - from) * eased)}${suffix}`
          if (progress < 1) rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [from, to, duration, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {from}
      {suffix}
    </span>
  )
}
