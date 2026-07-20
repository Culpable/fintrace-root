/**
 * Cross-currency match — reconstructed. The second investigative set-piece,
 * rendered entirely in the engine's obsidian-and-gold language.
 *
 * A rupee amount leaves an overseas HDFC account, passes through an international money transfer and
 * lands in an Australian ANZ account as dollars. The amount chip physically
 * travels the dotted route (CSS motion path in SVG user units, so it scales
 * with the viewBox), swaps currency mid-journey at the transfer-service node, and a
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
        viewBox="0 0 560 200"
        role="img"
        aria-label="A rupee transfer matched to an Australian dollar deposit through an international money transfer"
      >
        {/* Dotted route with marching dashes flowing in the money's direction */}
        <path className="ecm-path" d="M 76 118 Q 178 52 280 118 Q 382 52 484 118" fill="none" />

        {/* Station 1: the overseas source account */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="76" cy="118" r="9" />
          <circle className="ecm-dot" cx="76" cy="118" r="4.5" />
          <text className="ecm-name" x="76" y="144" textAnchor="middle">
            HDFC ****9878
          </text>
          <text className="ecm-sub" x="76" y="162" textAnchor="middle">
            OUT ₹15,40,000 · 04 APR
          </text>
        </g>

        {/* Station 2: the FX bridge where the currency swap happens */}
        <g className="ecm-st ecm-st2">
          <circle className="ecm-ring" cx="280" cy="118" r="9" />
          <circle className="ecm-dot" cx="280" cy="118" r="4.5" />
          <text className="ecm-name" x="280" y="144" textAnchor="middle">
            INTL TRANSFER
          </text>
          <text className="ecm-sub" x="280" y="162" textAnchor="middle">
            FX 0.01818
          </text>
        </g>

        {/* Station 3: the Australian destination account */}
        <g className="ecm-st ecm-st3">
          <circle className="ecm-ring" cx="484" cy="118" r="9" />
          <circle className="ecm-dot" cx="484" cy="118" r="4.5" />
          <text className="ecm-name" x="484" y="144" textAnchor="middle">
            ANZ ****7504
          </text>
          <text className="ecm-sub" x="484" y="162" textAnchor="middle">
            IN A$28,004 · 04 APR
          </text>
        </g>

        {/* The travelling amount chip: rupees out, dollars in. At landing the
            chip occupies y 78–102 — clear of the MATCHED plate above it. */}
        <g className="ecm-chip">
          <rect x="-48" y="-40" width="96" height="24" rx="3" />
          <text className="ecm-amt ecm-amt-inr" x="0" y="-23" textAnchor="middle">
            ₹15,40,000
          </text>
          <text className="ecm-amt ecm-amt-aud" x="0" y="-23" textAnchor="middle">
            A$28,004
          </text>
        </g>

        {/* Verdict plate at the destination once the chip lands — stacked
            above the landed chip with clear air between the two */}
        <g className="ecm-match">
          <rect x="440" y="40" width="88" height="24" rx="2" />
          <text x="484" y="56" textAnchor="middle">
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
