'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

/**
 * The reconciling statement table — engine edition.
 *
 * The set-piece the user liked on /ledger/, reborn in obsidian and gold:
 * statement lines are entered row by row, category chips stamp on, the
 * $9,500 cash withdrawal is flagged by a continuous crimson rule drawing
 * itself around the row, and a double-gold rule closes the reconciled
 * balance. One IntersectionObserver adds `.is-run`; every subsequent frame
 * is CSS keyframes on transform/opacity only.
 *
 * The flag rule is an SVG rect WITHOUT a viewBox, sized by CSS, drawn via
 * pathLength + dash-offset with vector-effect: non-scaling-stroke — so the
 * stroke stays continuous and undistorted at any row width (the original
 * /ledger/ used preserveAspectRatio='none', which fragmented the stroke).
 */

type LedgerLine = {
  date: string
  desc: string
  /** Signed amount string; credits carry + and render in brighter gold. */
  amount: string
  credit?: boolean
  balance: string
  chip: string
  flagged?: boolean
}

/** Seven verified statement lines; the running balances reconcile exactly
 *  (23,965.59 → 13,098.05) and demonstrate the real capability set. */
const LINES: LedgerLine[] = [
  { date: '03 Mar 24', desc: 'WOOLWORTHS 1224 CHATSWOOD', amount: '−214.63', balance: '23,965.59', chip: 'Groceries' },
  { date: '04 Mar 24', desc: 'TRANSFER TO J HARPER - NETBANK', amount: '−3,000.00', balance: '20,965.59', chip: 'Related acct' },
  {
    date: '07 Mar 24',
    desc: 'ATM WITHDRAWAL - CROWS NEST',
    amount: '−9,500.00',
    balance: '11,465.59',
    chip: 'Cash',
    flagged: true,
  },
  {
    date: '11 Mar 24',
    desc: 'SALARY - MERIDIAN CONSULTING',
    amount: '+8,412.90',
    credit: true,
    balance: '19,878.49',
    chip: 'Income',
  },
  { date: '13 Mar 24', desc: 'WISE TRANSFER AUD→INR REF 8841', amount: '−5,200.00', balance: '14,678.49', chip: 'Cross-currency' },
  { date: '18 Mar 24', desc: 'SPORTSBET DEPOSIT 0092', amount: '−400.00', balance: '14,278.49', chip: 'Gambling' },
  { date: '21 Mar 24', desc: 'BPAY - STRATA PLAN 55211', amount: '−1,180.44', balance: '13,098.05', chip: 'Property' },
]

export default function LedgerPlate() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Fire the whole choreography once, when a third of the plate is seen
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-run')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="eng-lt" ref={ref}>
      {/* Masthead: exhibit designation + rotating status caption */}
      <div className="eng-lt-mast">
        <span className="eng-lt-label">Extract - consolidated statement lines</span>
        <span className="eng-lt-status" aria-hidden="true">
          <span className="eng-lt-s1">Entering statement lines</span>
          <span className="eng-lt-s2">Categorising</span>
          <span className="eng-lt-s3">Reconciled - one line flagged</span>
        </span>
      </div>

      {/* Column headers echo the delivered Excel schema */}
      <div className="eng-lt-row eng-lt-head" role="presentation">
        <div>Date</div>
        <div>Description</div>
        <div className="eng-lt-amount">Amount</div>
        <div className="eng-lt-balance">Balance</div>
        <div className="eng-lt-cathead">Category</div>
      </div>

      {LINES.map((line, index) => (
        <div key={line.desc} className={`eng-lt-wrap${line.flagged ? ' is-flagged' : ''}`}>
          <div className="eng-lt-row eng-lt-data" style={{ '--i': index } as CSSProperties}>
            <div className="eng-lt-date">{line.date}</div>
            <div className="eng-lt-desc">{line.desc}</div>
            <div className={`eng-lt-amount${line.credit ? ' is-credit' : ''}`}>{line.amount}</div>
            <div className="eng-lt-balance">{line.balance}</div>
            <span
              className={`eng-lt-chip${line.flagged ? ' is-flag-chip' : ''}`}
              style={{ '--i': index } as CSSProperties}
            >
              {line.chip}
            </span>
          </div>

          {/* Continuous crimson rule drawing itself around the flagged row */}
          {line.flagged && (
            <>
              <svg className="eng-lt-flag" aria-hidden="true">
                <rect pathLength={1} />
              </svg>
              <p className="eng-lt-note">flagged - see source, p. 214</p>
            </>
          )}
        </div>
      ))}

      {/* Double-gold closing rule: the ledger agrees with itself */}
      <div className="eng-lt-total">
        <span className="eng-lt-total-label">Closing balance - reconciled to source</span>
        <span className="eng-lt-total-value">13,098.05</span>
      </div>

      <figcaption className="eng-lt-caption">
        Extract 04 · rendered from cba_joint_8802_mar24.pdf and 41 companion statements
      </figcaption>
    </figure>
  )
}
