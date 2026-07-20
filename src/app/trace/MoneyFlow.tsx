/**
 * Cross-currency match diagram - the secondary set-piece.
 *
 * A rupee amount leaves an overseas HDFC account, passes through an international money transfer and
 * lands in an Australian ANZ account as dollars. The amount chip physically
 * travels the dotted route (CSS motion path in SVG user units, so it scales
 * with the viewBox), swaps currency mid-journey at the transfer-service node, and a
 * MATCHED verdict stamps in at arrival. All animation is pure CSS, armed
 * when a parent <Reveal> adds `.is-in`.
 *
 * Server component by design: the SVG is static markup; CSS does the work.
 */
export default function MoneyFlow() {
  return (
    <div className="mf-wrap">
      <svg className="mf" viewBox="0 0 520 168" role="img" aria-label="A rupee transfer matched to an Australian dollar deposit through an international money transfer">
        {/* Dotted route with marching dashes flowing in the money's direction */}
        <path className="mf-path" d="M 46 96 Q 153 30 260 96 Q 367 30 474 96" fill="none" />

        {/* Station 1: the overseas source account */}
        <g className="mf-st">
          <circle className="mf-ring" cx="46" cy="96" r="9" />
          <circle className="mf-dot" cx="46" cy="96" r="4.5" />
          <text className="mf-name" x="46" y="122" textAnchor="middle">
            HDFC ****9878
          </text>
          <text className="mf-sub" x="46" y="140" textAnchor="middle">
            OUT ₹15,40,000 · 04 APR
          </text>
        </g>

        {/* Station 2: the FX bridge where the currency swap happens */}
        <g className="mf-st mf-st2">
          <circle className="mf-ring" cx="260" cy="96" r="9" />
          <circle className="mf-dot" cx="260" cy="96" r="4.5" />
          <text className="mf-name" x="260" y="122" textAnchor="middle">
            INTL TRANSFER
          </text>
          <text className="mf-sub" x="260" y="140" textAnchor="middle">
            FX 0.01818
          </text>
        </g>

        {/* Station 3: the Australian destination account */}
        <g className="mf-st mf-st3">
          <circle className="mf-ring" cx="474" cy="96" r="9" />
          <circle className="mf-dot" cx="474" cy="96" r="4.5" />
          <text className="mf-name" x="474" y="122" textAnchor="middle">
            ANZ ****7504
          </text>
          <text className="mf-sub" x="474" y="140" textAnchor="middle">
            IN A$28,004 · 04 APR
          </text>
        </g>

        {/* The travelling amount chip: rupees out, dollars in */}
        <g className="mf-chip">
          <rect x="-48" y="-42" width="96" height="24" rx="4" />
          <text className="mf-amt mf-amt-inr" x="0" y="-25" textAnchor="middle">
            ₹15,40,000
          </text>
          <text className="mf-amt mf-amt-aud" x="0" y="-25" textAnchor="middle">
            A$28,004
          </text>
        </g>

        {/* Verdict stamp at the destination once the chip lands */}
        <g className="mf-match">
          <rect x="432" y="38" width="84" height="22" rx="2" />
          <text x="474" y="53" textAnchor="middle">
            MATCHED
          </text>
        </g>
      </svg>
      <p className="mf-caption">Same funds, two currencies — matched automatically, with source pages for both sides.</p>
    </div>
  )
}
