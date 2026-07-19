/**
 * Cross-currency match — reconstructed. The investigative set-piece, rendered
 * entirely in the engine's obsidian-and-gold language.
 *
 * The A$28,000 Wise hop from the trace above is expanded here: dollars leave
 * NAB, convert at an exact 65.00 rate and land at HDFC as ₹18,20,000 two days
 * later. The amount chip physically travels the dotted route (CSS motion path
 * in SVG user units, so it scales with the viewBox), swaps currency
 * mid-journey at the Wise node, and a MATCHED plate stamps in at arrival. The
 * plate sits a clear band above the chip's landing spot so verdict and amount
 * never overlap, and the viewBox carries enough side padding that no station
 * label clips. All animation is pure CSS, armed when the parent <Reveal>
 * gains `.is-visible`, then looping on a long cycle.
 *
 * Server component by design: the SVG is static markup; CSS does the work.
 */
export default function CurrencyMatch() {
  return (
    <div className="ecm-wrap">
      <p className="ecm-kicker">Cross-currency match - reconstructed</p>
      <svg
        className="ecm"
        viewBox="0 0 560 200"
        role="img"
        aria-label="An Australian dollar transfer matched to a rupee deposit via Wise"
      >
        {/* Dotted route with marching dashes flowing in the money's direction */}
        <path className="ecm-path" d="M 76 118 Q 178 52 280 118 Q 382 52 484 118" fill="none" />

        {/* Station 1: the Australian source account */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="76" cy="118" r="9" />
          <circle className="ecm-dot" cx="76" cy="118" r="4.5" />
          <text className="ecm-name" x="76" y="144" textAnchor="middle">
            NAB ****1130
          </text>
          <text className="ecm-sub" x="76" y="162" textAnchor="middle">
            OUT A$28,000 · 02 APR
          </text>
        </g>

        {/* Station 2: the FX bridge where the currency swap happens */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="280" cy="118" r="9" />
          <circle className="ecm-dot" cx="280" cy="118" r="4.5" />
          <text className="ecm-name" x="280" y="144" textAnchor="middle">
            WISE
          </text>
          <text className="ecm-sub" x="280" y="162" textAnchor="middle">
            FX 65.00
          </text>
        </g>

        {/* Station 3: the overseas destination account */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="484" cy="118" r="9" />
          <circle className="ecm-dot" cx="484" cy="118" r="4.5" />
          <text className="ecm-name" x="484" y="144" textAnchor="middle">
            HDFC ****3321
          </text>
          <text className="ecm-sub" x="484" y="162" textAnchor="middle">
            IN ₹18,20,000 · 04 APR
          </text>
        </g>

        {/* The travelling amount chip: dollars out, rupees in */}
        <g className="ecm-chip">
          <rect x="-48" y="-40" width="96" height="24" rx="3" />
          <text className="ecm-amt ecm-amt-out" x="0" y="-23" textAnchor="middle">
            A$28,000
          </text>
          <text className="ecm-amt ecm-amt-in" x="0" y="-23" textAnchor="middle">
            ₹18,20,000
          </text>
        </g>

        {/* Verdict plate, stamped in its own band above the landed chip */}
        <g className="ecm-match">
          <rect x="440" y="40" width="88" height="24" rx="2" />
          <text x="484" y="56" textAnchor="middle">
            MATCHED
          </text>
        </g>
      </svg>
      <p className="ecm-caption">
        Same funds, two currencies: matched automatically, with source pages cited for both sides.
      </p>
    </div>
  )
}
