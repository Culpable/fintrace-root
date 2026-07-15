'use client'

import { useState } from 'react'

/**
 * Specimen finding card that flips to its source document.
 *
 * The front states a finding exactly as it appears in a FinTrace report;
 * flipping reveals a mock bank-statement excerpt with the substantiating
 * line highlighted and its file/page reference — the traceability promise
 * made physical. The flip is a compositor-friendly 3D rotation; front and
 * back share one grid cell so the card keeps natural height on all
 * viewports without absolute positioning.
 */
export default function FindingFlip() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="ex-flip" data-flipped={flipped || undefined}>
      <div className="ex-flip-inner">
        {/* FRONT — the finding as reported */}
        <div className="ex-flip-face ex-flip-front">
          <p className="ex-flip-kicker">Finding 12 of 31 — cash pattern</p>
          <p className="ex-flip-body">
            $48,700 withdrawn in cash across 14 branch visits, March to June 2019 — amounts structured just
            beneath the $10,000 reporting threshold.
          </p>
          <button type="button" className="ex-flip-btn" onClick={() => setFlipped(true)} aria-expanded={flipped}>
            Verify source →
          </button>
        </div>

        {/* BACK — the substantiating statement excerpt */}
        <div className="ex-flip-face ex-flip-back">
          <p className="ex-flip-kicker">
            Source document — <span className="ex-red">verified</span>
          </p>
          {/* Mock statement excerpt: the middle row substantiates the finding */}
          <table className="ex-flip-table">
            <caption className="sr-only">Excerpt of bank statement showing the flagged withdrawal</caption>
            <tbody>
              <tr>
                <td>10 JUN 2019</td>
                <td>EFTPOS WOOLWORTHS 3121</td>
                <td>$86.40</td>
              </tr>
              <tr className="ex-flip-hit">
                <td>12 JUN 2019</td>
                <td>CASH WITHDRAWAL — BRANCH 402</td>
                <td>$3,500.00</td>
              </tr>
              <tr>
                <td>14 JUN 2019</td>
                <td>TRANSFER TO A/C ···7791</td>
                <td>$1,200.00</td>
              </tr>
            </tbody>
          </table>
          <p className="ex-flip-source">SOURCE: westpac_2019_q3.pdf — p. 214, line 8</p>
          <button type="button" className="ex-flip-btn" onClick={() => setFlipped(false)}>
            ← Return to finding
          </button>
        </div>
      </div>
    </div>
  )
}
