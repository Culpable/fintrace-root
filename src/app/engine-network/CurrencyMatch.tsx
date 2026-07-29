/**
 * Cross-currency match — reconstructed. The investigative set-piece, rendered
 * entirely in the engine's obsidian-and-gold language.
 *
 * The A$28,000 international-transfer hop from the trace above is expanded here: dollars leave
 * NAB, convert at an exact 0.6000 rate and land at Deutsche Bank as €16,800 two days
 * later. The amount chip physically travels the dotted route (CSS motion path
 * in SVG user units, so it scales with the viewBox), swaps currency
 * mid-journey at the transfer-service node, and a MATCHED plate stamps in at arrival. The
 * plate sits a clear band above the chip's landing spot so verdict and amount
 * never overlap, and the viewBox carries enough side padding that no station
 * label clips. All animation is pure CSS, armed when the parent <Reveal>
 * gains `.is-visible`, then looping on a long cycle.
 *
 * The currency swap is the set-piece's payoff, so it is staged rather than
 * cross-faded, borrowing the hero's scanning-gate language:
 *
 * - The route is drawn as two legs. The AUD leg is recessed gold, the EUR leg
 *   bright gold, so the colour of the trail itself records where the money
 *   changed currency.
 * - A gold beam sweeps the chip window at the FX node; the amounts roll like a
 *   mechanical counter behind it (old value up and out, new value up and in),
 *   clipped to the window so the roll reads as a machine resolving a figure
 *   rather than two labels dissolving into each other.
 * - The chip carries two stacked plates rather than one recoloured plate:
 *   unmatched (dark fill, champagne rule) and matched (gold wash, bright rule).
 *   Cross-fading opacity keeps the state change off the paint-heavy properties.
 * - Ping rings expand once at the FX node on conversion and once at the
 *   destination on arrival, marking each event before the MATCHED plate stamps.
 *
 * Ids are prefixed `ecmnet-` because SVG paint-server and clip ids resolve
 * document-wide and must not collide during client-side navigation.
 *
 * Server component by design: the SVG is static markup; CSS does the work.
 */
export default function CurrencyMatch() {
  return (
    <div className="ecm-wrap">
      <p className="ecm-kicker">Cross-currency match — reconstructed</p>
      <svg
        className="ecm"
        viewBox="-20 0 600 200"
        role="img"
        aria-label="An Australian dollar transfer matched to a euro deposit through an international money transfer"
      >
        <defs>
          {/* Window the rolling amounts and the sweep are clipped to, so both
              read as motion inside the chip rather than loose SVG text */}
          <clipPath id="ecmnet-chip-window">
            <rect className="ecm-window" x="-50" y="-43" width="100" height="26" rx="3" />
          </clipPath>

          {/* Soft gold beam: transparent at both edges so the sweep reads as
              light travelling across the plate, not a bar sliding over it */}
          <linearGradient id="ecmnet-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f0d491" stopOpacity="0" />
            <stop offset="45%" stopColor="#f0d491" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#fff6e0" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#f0d491" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Leg one: dollars. Recessed gold — the side of the trail before the swap */}
        <path className="ecm-path ecm-path-aud" d="M 76 118 Q 178 52 280 118" fill="none" />

        {/* Leg two: euros. Bright gold — the same funds, now converted */}
        <path className="ecm-path ecm-path-eur" d="M 280 118 Q 382 52 484 118" fill="none" />

        {/* Station 1: the Australian source account */}
        <g className="ecm-st">
          <circle className="ecm-ring" cx="76" cy="118" r="9" />
          <circle className="ecm-dot" cx="76" cy="118" r="4.5" />
          <text className="ecm-name" x="76" y="146" textAnchor="middle">
            NAB ****8324
          </text>
          <text className="ecm-sub" x="76" y="168" textAnchor="middle">
            OUT A$28,000 · 02 APR
          </text>
        </g>

        {/* Station 2: the FX bridge where the currency swap happens */}
        <g className="ecm-st">
          <circle className="ecm-ping ecm-ping-fx" cx="280" cy="118" r="9" />
          <circle className="ecm-ring" cx="280" cy="118" r="9" />
          <circle className="ecm-dot" cx="280" cy="118" r="4.5" />
          <text className="ecm-name" x="280" y="146" textAnchor="middle">
            INTL TRANSFER
          </text>
          <text className="ecm-sub" x="280" y="168" textAnchor="middle">
            FX 0.6000
          </text>
        </g>

        {/* Station 3: the overseas destination account */}
        <g className="ecm-st">
          <circle className="ecm-ping ecm-ping-dest" cx="484" cy="118" r="9" />
          <circle className="ecm-ring" cx="484" cy="118" r="9" />
          <circle className="ecm-dot" cx="484" cy="118" r="4.5" />
          <text className="ecm-name" x="484" y="146" textAnchor="middle">
            DEUTSCHE ****9878
          </text>
          <text className="ecm-sub ecm-sub-eur" x="484" y="168" textAnchor="middle">
            IN €16,800 · 04 APR
          </text>
        </g>

        {/* The travelling amount chip: dollars out, euros in */}
        <g className="ecm-chip">
          {/* Unmatched plate: dark fill, champagne rule */}
          <rect className="ecm-box ecm-box-aud" x="-50" y="-43" width="100" height="26" rx="3" />
          {/* Matched plate: gold wash, bright rule — cross-faded in on conversion */}
          <rect className="ecm-box ecm-box-eur" x="-50" y="-43" width="100" height="26" rx="3" />

          <g clipPath="url(#ecmnet-chip-window)">
            <text className="ecm-amt ecm-amt-aud" x="0" y="-25" textAnchor="middle">
              A$28,000
            </text>
            <text className="ecm-amt ecm-amt-eur" x="0" y="-25" textAnchor="middle">
              €16,800
            </text>
            <rect className="ecm-beam" x="-64" y="-43" width="26" height="26" fill="url(#ecmnet-beam)" />
          </g>
        </g>

        {/* Verdict plate, stamped in its own band above the landed chip */}
        <g className="ecm-match">
          <rect x="438" y="38" width="92" height="26" rx="2" />
          <text x="484" y="55" textAnchor="middle">
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
