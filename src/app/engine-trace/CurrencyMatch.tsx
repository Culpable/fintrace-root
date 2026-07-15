/**
 * Cross-currency match — reconstructed. The second investigative set-piece,
 * rendered entirely in the engine's obsidian-and-gold language.
 *
 * A rupee amount leaves an overseas HDFC account, passes through Wise and
 * lands in an Australian ANZ account as dollars. The amount chip physically
 * travels the dotted route (CSS motion path in SVG user units, so it scales
 * with the viewBox), swaps currency mid-journey at the Wise node, and a
 * MATCHED plate stamps in at arrival. All animation is pure CSS, armed when
 * the parent <Reveal> gains `.is-visible`, then looping on a long cycle.
 *
 * Server component by design: the SVG is static markup; CSS does the work.
 */
export default function CurrencyMatch() {
  return (
    <div className="ecm-wrap">
      <p className="ecm-kicker">Cross-currency match — reconstructed</p>
      <svg
        className="ecm"
        viewBox="0 0 520 176"
        role="img"
        aria-label="A rupee transfer matched to an Australian dollar deposit via Wise"
      >
        {/* Dotted route with marching dashes flowing in the money's direction */}
        <path className="ecm-path" d="M 46 104 Q 153 38 260 104 Q 367 38 474 104" fill="none" />

        {/* Station 1: the overseas source account */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="46" cy="104" r="9" />
          <circle className="ecm-dot" cx="46" cy="104" r="4.5" />
          <text className="ecm-name" x="46" y="130" textAnchor="middle">
            HDFC ****3321
          </text>
          <text className="ecm-sub" x="46" y="148" textAnchor="middle">
            OUT ₹15,40,000 · 04 APR
          </text>
        </g>

        {/* Station 2: the FX bridge where the currency swap happens */}
        <g className="ecm-st ecm-st2">
          <circle className="ecm-ring" cx="260" cy="104" r="9" />
          <circle className="ecm-dot" cx="260" cy="104" r="4.5" />
          <text className="ecm-name" x="260" y="130" textAnchor="middle">
            WISE
          </text>
          <text className="ecm-sub" x="260" y="148" textAnchor="middle">
            FX 0.01818
          </text>
        </g>

        {/* Station 3: the Australian destination account */}
        <g className="ecm-st ecm-st3">
          <circle className="ecm-ring" cx="474" cy="104" r="9" />
          <circle className="ecm-dot" cx="474" cy="104" r="4.5" />
          <text className="ecm-name" x="474" y="130" textAnchor="middle">
            ANZ ****4417
          </text>
          <text className="ecm-sub" x="474" y="148" textAnchor="middle">
            IN A$28,004 · 04 APR
          </text>
        </g>

        {/* The travelling amount chip: rupees out, dollars in */}
        <g className="ecm-chip">
          <rect x="-48" y="-44" width="96" height="24" rx="3" />
          <text className="ecm-amt ecm-amt-inr" x="0" y="-27" textAnchor="middle">
            ₹15,40,000
          </text>
          <text className="ecm-amt ecm-amt-aud" x="0" y="-27" textAnchor="middle">
            A$28,004
          </text>
        </g>

        {/* Verdict plate at the destination once the chip lands */}
        <g className="ecm-match">
          <rect x="430" y="44" width="88" height="24" rx="2" />
          <text x="474" y="60" textAnchor="middle">
            MATCHED
          </text>
        </g>
      </svg>
      <p className="ecm-caption">
        Same funds, two currencies — matched automatically, with source pages cited for both sides.
      </p>
    </div>
  )
}
