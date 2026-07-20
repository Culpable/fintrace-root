'use client'

import { useEffect, useState } from 'react'

/** One labelled line in the typed evidence register. */
export type RegisterRow = {
  label: string
  value: string
  /** Render the value in stamp red for emphasis */
  accent?: boolean
}

/**
 * Typed “matter register” beneath the hero headline.
 *
 * Type every row’s value sequentially, character by character, with a
 * blinking block caret that travels with the text and keeps blinking on
 * the final row once complete — like a clerk finishing a docket entry.
 *
 * Timing runs on requestAnimationFrame so the effect pauses automatically
 * when the tab is hidden; the per-frame delta is clamped so returning to
 * the tab never dumps the remaining characters in one jump.
 */
export default function HeroRegister({
  rows,
  startDelay = 0,
  charsPerSecond = 30,
}: {
  rows: RegisterRow[]
  /** Milliseconds to wait before the first character appears */
  startDelay?: number
  charsPerSecond?: number
}) {
  // Count of characters typed so far across the whole row sequence
  const [typed, setTyped] = useState(0)
  const total = rows.reduce((sum, row) => sum + row.value.length, 0)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    // Start negative so the initial delay falls out of the same accumulator
    let elapsed = -startDelay
    const perChar = 1000 / charsPerSecond

    const tick = (ts: number) => {
      if (last !== null) {
        // Clamp the delta: rAF pauses on hidden tabs, and an unclamped
        // resume would instantly complete the animation
        elapsed += Math.min(ts - last, 100)
      }
      last = ts
      const count = Math.min(Math.max(0, Math.floor(elapsed / perChar)), total)
      // Skip state updates on frames where no new character landed
      setTyped((prev) => (count === prev ? prev : count))
      if (count < total) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [startDelay, charsPerSecond, total])

  // Determine how many characters of each row are visible and which row
  // currently owns the caret (the row being typed, or the last row once done)
  const done = typed >= total
  // Walk the rows in a plain loop (not a closure) so the running character
  // offset never mutates a variable captured by a nested function.
  const slices: string[] = []
  let consumed = 0
  for (const row of rows) {
    slices.push(row.value.slice(0, Math.max(0, Math.min(typed - consumed, row.value.length))))
    consumed += row.value.length
  }
  const activeIndex = done ? rows.length - 1 : slices.findIndex((shown, i) => shown.length < rows[i].value.length)

  return (
    <dl className="ex-register" aria-label="Matter register">
      {rows.map((row, index) => (
        <div className="ex-register-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd className={row.accent ? 'ex-register-accent' : undefined}>
            {slices[index]}
            {index === activeIndex && <span className="ex-caret" aria-hidden />}
          </dd>
        </div>
      ))}
    </dl>
  )
}
