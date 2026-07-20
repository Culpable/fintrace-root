'use client'

import { useEffect, useRef, useState } from 'react'

/** Ease-out cubic - fast start, settled landing, right for counters. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Count from zero to `end` when the element enters the viewport.
 * Rendered with tabular figures so digits do not jitter horizontally.
 */
export default function Stat({
  end,
  prefix = '',
  suffix = '',
  duration = 1400,
}: {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        // Drive the count with rAF; snap to the exact target on the last frame.
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration)
          setValue(Math.round(easeOutCubic(p) * end))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [end, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-AU')}
      {suffix}
    </span>
  )
}
