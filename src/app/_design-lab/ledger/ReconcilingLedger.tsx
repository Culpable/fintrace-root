'use client'

import { useEffect, useRef } from 'react'

/**
 * Signature set-piece: a ledger that reconciles itself.
 *
 * Choreography (all timings live in ledger.css, keyed off `.is-run`):
 *   1. Statement lines are “entered” row by row (staggered rise).
 *   2. Category chips stamp onto each line.
 *   3. The $9,500 cash withdrawal is flagged — a red rule draws itself
 *      around the row and a marginal note appears in the editor’s hand.
 *   4. The closing balance stamps beneath a double rule: reconciled.
 *
 * The component only decides WHEN the sequence starts (via one
 * IntersectionObserver adding `.is-run`); every frame after that is pure
 * compositor-friendly CSS, so the set-piece costs nothing on the main thread.
 */

type LedgerLine = {
  date: string
  desc: string
  /** Signed amount string; credits are prefixed with + and tinted forest. */
  amount: string
  credit?: boolean
  balance: string
  chip: string
  flagged?: boolean
}

/** Seven statement lines chosen to demonstrate the real capability set:
 *  groceries auto-categorised, a related-account transfer, a flagged cash
 *  withdrawal, salary, a cross-currency transfer, gambling, property. */
const LINES: LedgerLine[] = [
  { date: '03 Mar 24', desc: 'WOOLWORTHS 3646 CHATSWOOD', amount: '−214.63', balance: '23,965.59', chip: 'Groceries' },
  { date: '04 Mar 24', desc: 'TRANSFER TO J HARPER — NETBANK', amount: '−3,000.00', balance: '20,965.59', chip: 'Related acct' },
  {
    date: '07 Mar 24',
    desc: 'ATM WITHDRAWAL — CROWS NEST',
    amount: '−9,500.00',
    balance: '11,465.59',
    chip: 'Cash',
    flagged: true,
  },
  {
    date: '11 Mar 24',
    desc: 'SALARY — MERIDIAN CONSULTING',
    amount: '+8,412.90',
    credit: true,
    balance: '19,878.49',
    chip: 'Income',
  },
  { date: '13 Mar 24', desc: 'INTL TRANSFER AUD→INR REF 8991', amount: '−5,200.00', balance: '14,678.49', chip: 'Cross-currency' },
  { date: '18 Mar 24', desc: 'SPORTSBET DEPOSIT 0645', amount: '−400.00', balance: '14,278.49', chip: 'Gambling' },
  { date: '21 Mar 24', desc: 'BPAY — STRATA PLAN 38254', amount: '−1,180.44', balance: '13,098.05', chip: 'Property' },
]

export default function ReconcilingLedger() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Fire the whole choreography once, when a third of the table is seen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-run')
            observer.disconnect()
          }
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="lg-ledger" ref={ref}>
      {/* Table masthead: source annotation + live status caption. */}
      <div className="lg-ledger-title-row">
        <span className="lg-label">Exhibit — consolidated statement lines</span>
        <span className="lg-ledger-status" aria-hidden="true">
          <span className="lg-status-1">Entering statement lines</span>
          <span className="lg-status-2">Categorising</span>
          <span className="lg-status-3">Reconciled — one line flagged</span>
        </span>
      </div>

      {/* Column headers echo the delivered Excel schema. */}
      <div className="lg-row lg-row-head" role="presentation">
        <div>Date</div>
        <div>Description</div>
        <div className="lg-cell-amount">Amount</div>
        <div className="lg-cell-balance">Balance</div>
        <div>Category</div>
      </div>

      {LINES.map((line, index) => (
        <div key={line.desc} className={`lg-row-wrap${line.flagged ? ' is-flagged' : ''}`}>
          <div className="lg-row lg-row-data" style={{ '--i': index } as React.CSSProperties}>
            <div className="lg-cell-date">{line.date}</div>
            <div className="lg-cell-desc">{line.desc}</div>
            <div className={`lg-cell-amount${line.credit ? ' is-credit' : ''}`}>{line.amount}</div>
            <div className="lg-cell-balance">{line.balance}</div>
            <span
              className={`lg-chip${line.flagged ? ' is-flag-chip' : ''}`}
              style={{ '--i': index } as React.CSSProperties}
            >
              {line.chip}
            </span>
          </div>

          {/* Red rule drawing itself around the flagged withdrawal. */}
          {line.flagged && (
            <>
              <svg className="lg-flag-svg" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0.2" y="0.4" width="99.6" height="9.2" pathLength={1} />
              </svg>
              <p className="lg-flag-note">flagged — see source, p. 214</p>
            </>
          )}
        </div>
      ))}

      {/* Double-ruled closing line: the ledger agrees with itself. */}
      <div className="lg-total">
        <span className="lg-total-label">Closing balance — reconciled to source</span>
        <span className="lg-total-value">13,098.05</span>
      </div>

      <figcaption className="lg-ledger-caption">
        Fig. 1 — Statement lines extracted, categorised and reconciled by FinTrace. Column order follows the
        delivered spreadsheet.
      </figcaption>
    </figure>
  )
}
