'use client'

import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The signature set-piece of the “From Chaos to Clarity” concept:
 * seven strewn, scanned statement pages fly across the stage, straighten,
 * and dock into the rows of a pristine spreadsheet — then the analysis
 * layer flags a repeated cash withdrawal in amber.
 *
 * Mechanics:
 * - Chaos poses are fixed constants (SSR-safe, no hydration mismatch).
 * - At trigger time we measure each page and its target row, then write
 *   per-page --tx/--ty custom properties. All motion is CSS transitions
 *   on transform/opacity only, staggered with per-element --d delays.
 * - The sequence runs once when the stage scrolls into view; a Replay
 *   control resets the stage (transitions disabled), re-measures, and
 *   runs it again.
 */

/** Animation phases: idle (chaos) → run (flight + docking) → flagged. */
type Phase = 'idle' | 'run' | 'flagged'

/** Fixed chaos poses for the strewn pages (percent offsets + rotation). */
const PAGE_POSES = [
  { left: '6%', top: '10%', rot: -8, variant: 1 },
  { left: '46%', top: '4%', rot: 6, variant: 2 },
  { left: '16%', top: '34%', rot: -3, variant: 3 },
  { left: '56%', top: '30%', rot: 11, variant: 1 },
  { left: '4%', top: '58%', rot: 4, variant: 2 },
  { left: '40%', top: '56%', rot: -7, variant: 3 },
  { left: '26%', top: '16%', rot: 14, variant: 2 },
]

/** The rows the pages dock into: realistic, categorised statement lines. */
const ROWS = [
  { date: '14.03.19', desc: 'WOOLWORTHS 1024 CHATSWOOD', debit: '$84.62', credit: '', amount: '−$84.62', cat: 'Groceries', src: 'p. 214', flag: false },
  { date: '03.04.19', desc: 'ATM WDL — KINGS CROSS', debit: '$800.00', credit: '', amount: '−$800.00', cat: 'Cash', src: 'p. 231', flag: false },
  { date: '03.04.19', desc: 'SALARY — MERIDIAN PTY LTD', debit: '', credit: '$4,120.00', amount: '+$4,120.00', cat: 'Income', src: 'p. 231', flag: false },
  { date: '17.04.19', desc: 'TRANSFER TO ACC ···4471', debit: '$5,000.00', credit: '', amount: '−$5,000.00', cat: 'Transfer', src: 'p. 236', flag: false },
  { date: '29.04.19', desc: 'SPORTSBET DEPOSIT', debit: '$250.00', credit: '', amount: '−$250.00', cat: 'Gambling', src: 'p. 240', flag: false },
  { date: '02.05.19', desc: 'WISE — INR→AUD SETTLEMENT', debit: '', credit: '$9,384.15', amount: '+$9,384.15', cat: 'FX match', src: 'p. 244', flag: false },
  { date: '11.05.19', desc: 'ATM WDL — KINGS CROSS', debit: '$900.00', credit: '', amount: '−$900.00', cat: 'Cash', src: 'p. 252', flag: true },
]

/** Stagger between consecutive page departures, in milliseconds. */
const STAGGER_MS = 110

/** Delay before the amber flag fires, covering the full docking run. */
const FLAG_AT_MS = 2400


export default function HeroTransformation() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])
  const timeoutsRef = useRef<number[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [noAnim, setNoAnim] = useState(false)

  /** Track a timeout so unmount/replay can always cancel it. */
  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms))
  }, [])

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  /**
   * Measure the flight vector for every page while the stage is idle:
   * translate the page’s centre onto a docking point just inside the
   * left edge of its target row. Rotation happens about the centre, so
   * centre-to-centre deltas stay exact regardless of the chaos pose.
   */
  const measure = useCallback(() => {
    PAGE_POSES.forEach((_, i) => {
      const page = pageRefs.current[i]
      const row = rowRefs.current[i]
      if (!page || !row) return
      const pageRect = page.getBoundingClientRect()
      const rowRect = row.getBoundingClientRect()
      const tx = rowRect.left + 34 - (pageRect.left + pageRect.width / 2)
      const ty = rowRect.top + rowRect.height / 2 - (pageRect.top + pageRect.height / 2)
      page.style.setProperty('--tx', `${tx}px`)
      page.style.setProperty('--ty', `${ty}px`)
      page.style.setProperty('--d', `${i * STAGGER_MS}ms`)
    })
  }, [])

  /** Measure, launch the flight, then flag the cash pattern at the end. */
  const run = useCallback(() => {
    measure()
    setPhase('run')
    schedule(() => setPhase('flagged'), FLAG_AT_MS)
  }, [measure, schedule])

  /**
   * Replay: cancel pending work, snap back to chaos with transitions
   * disabled, then re-measure and run again on the next paint.
   */
  const replay = useCallback(() => {
    clearTimeouts()
    setNoAnim(true)
    setPhase('idle')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setNoAnim(false)
        requestAnimationFrame(() => run())
      })
    })
  }, [clearTimeouts, run])

  // Fire the sequence once, shortly after the stage enters the viewport.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect()
          schedule(run, 400)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      clearTimeouts()
    }
  }, [run, schedule, clearTimeouts])

  return (
    <div ref={stageRef} data-phase={phase} className={clsx('cl-stage cl-ruled', noAnim && 'cl-noanim')}>
      {/* Instrument header: input/output labels + replay control */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="cl-microlabel">Input — 3,214 pages · 41 PDFs · any order</span>
        <span className="cl-microlabel hidden lg:inline">Output — 1 spreadsheet · every line sourced</span>
        <button type="button" onClick={replay} className="cl-replay" aria-label="Replay the transformation">
          Replay
        </button>
      </div>

      <div className="cl-stage-body">
        {/* Chaos zone: the strewn scanned pages */}
        <div className="cl-pile" aria-hidden="true">
          {PAGE_POSES.map((pose, i) => (
            <div
              key={i}
              ref={(el) => {
                pageRefs.current[i] = el
              }}
              className={`cl-page cl-page--v${pose.variant}`}
              style={{ left: pose.left, top: pose.top, '--rot': `${pose.rot}deg` } as React.CSSProperties}
            >
              <div className="cl-page-head" />
              <div className="cl-page-lines" />
              <div className="cl-page-table" />
            </div>
          ))}

          {/* Once the pile empties, confirm what just happened. */}
          <div className="cl-pile-note">
            <span className="cl-microlabel" style={{ color: 'var(--ink)' }}>
              3,214 pages processed
            </span>
            <span className="cl-microlabel">No pre-sorting. No prep.</span>
          </div>
        </div>

        {/* Order zone: the spreadsheet the pages dock into */}
        <div className="cl-sheetwrap">
          <table className="cl-sheet">
            {/* Widths live on the header cells: with table-layout fixed the
                rendered first-row cells define the columns, so display:none
                on a th removes its column cleanly per breakpoint. */}
            <thead>
              <tr>
                <th className="cl-col-desk w-[80px]">Date</th>
                <th>Description</th>
                <th className="cl-th-num cl-col-desk w-[90px]">Debit</th>
                <th className="cl-th-num cl-col-desk w-[96px]">Credit</th>
                <th className="cl-th-num cl-col-mob w-[84px]">Amount</th>
                <th className="w-[88px]">Category</th>
                <th className="cl-col-desk w-[56px]">Src</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={i}
                  ref={(el) => {
                    rowRefs.current[i] = el
                  }}
                  className={clsx('cl-tr', row.flag && 'cl-tr--flag')}
                  style={{ '--d': `${i * STAGGER_MS}ms` } as React.CSSProperties}
                >
                  <td className="cl-td-date cl-col-desk">
                    <span className="cl-cell">{row.date}</span>
                  </td>
                  <td>
                    <span className="cl-cell">
                      {row.desc}
                      {row.flag && <span className="cl-flagtag">Flagged — cash pattern</span>}
                    </span>
                  </td>
                  <td className="cl-td-num cl-col-desk">
                    <span className="cl-cell">{row.debit}</span>
                  </td>
                  <td className="cl-td-num cl-col-desk">
                    <span className="cl-cell">{row.credit}</span>
                  </td>
                  <td className="cl-td-num cl-col-mob">
                    <span className="cl-cell">{row.amount}</span>
                  </td>
                  <td>
                    <span className="cl-cell">
                      <span className="cl-chip">{row.cat}</span>
                    </span>
                  </td>
                  <td className="cl-td-src cl-col-desk">
                    <span className="cl-cell">{row.src}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
