/**
 * Cross-currency match — reconstructed. The investigative set-piece, rendered
 * entirely in the engine's obsidian-and-gold language.
 *
 * The A$28,000 international-transfer hop from the trace above is expanded here: dollars leave
 * NAB, convert at an exact 0.6000 rate and land at Deutsche Bank as €16,800 two days
 * later. The amount chip physically travels the dotted route (CSS motion path
 * in SVG user units, so it scales with the viewBox), swaps currency
 * mid-journey at the transfer-service node, and a MATCHED plate stamps in at arrival. All
 * animation is pure CSS, armed when the parent <Reveal> gains `.is-visible`,
 * then looping on a long cycle.
 *
 * Two layouts, one choreography
 * -----------------------------
 * The diagram ships as two SVGs selected by `display` at 768px, mirroring the
 * hero's wide/compact fallback contract. Both run the identical class names and
 * therefore the identical keyframes; only geometry differs, and every geometric
 * difference is carried by the `.ecm-wide` / `.ecm-compact` scope in CSS rather
 * than by a media query.
 *
 * The compact layout exists because the wide one is width-bound: three stations
 * on one row inside a fixed viewBox meant phone labels could not exceed 17 user
 * units before "INTL TRANSFER" and "DEUTSCHE ****9878" closed to within a few
 * units of each other. Splitting each station label across two lines roughly
 * halves the width every station needs, which buys back enough room to shrink
 * the viewBox and render the labels around 60% larger on a phone.
 *
 * The currency swap is the set-piece's payoff, so it is staged rather than
 * cross-faded, borrowing the hero's scanning-gate language:
 *
 * - The route is drawn as two legs. The AUD leg is recessed gold, the EUR leg
 *   bright gold, so the colour of the trail itself records where the money
 *   changed currency.
 * - A gold beam sweeps the chip window at the FX node; the amounts roll like a
 *   mechanical counter behind it, clipped to the window so the roll reads as a
 *   machine resolving a figure rather than two labels dissolving into each other.
 * - The chip carries two stacked plates rather than one recoloured plate:
 *   unmatched (dark fill, champagne rule) and matched (gold wash, bright rule).
 * - The FX rate lifts out of supporting grey for exactly the conversion beat:
 *   it is the evidence that justifies the match, so it should not sit inert
 *   while the figure above it changes.
 *
 * Arrival is the verdict, and it is the one place this system leaves gold. The
 * ping ring at the destination and the MATCHED plate fire on the same frame in
 * the same verified green, and a hairline connector drops from the plate to the
 * chip so the verdict reads as an annotation on that amount rather than a second
 * floating label. The plate's rule draws itself closed via pathLength dash — the
 * same technique the flagged ledger row uses — instead of simply fading in.
 *
 * Ids are prefixed `ecmnet-` and suffixed per layout because SVG paint-server
 * and clip ids resolve document-wide: both SVGs are in the DOM at all times and
 * must never collide.
 *
 * Server component by design: the SVG is static markup; CSS does the work.
 */

type Station = {
  /** Centre of the node on the route. */
  cx: number
  /** Station name, one entry per rendered line. */
  nameLines: string[]
  /** Supporting metadata, one entry per rendered line. */
  subLines: string[]
  /** Which ping ring this station owns, if any. */
  ping?: 'fx' | 'dest'
  /** Marks the sub-label that carries a state animation. */
  subClass?: string
}

type MatchLayout = {
  /** Scope class carrying every geometric difference in CSS. */
  variant: 'wide' | 'compact'
  /** Suffix keeping this layout's clip and gradient ids unique. */
  key: string
  viewBox: string
  /** Shared y of all three nodes. */
  nodeY: number
  /** Dollar leg and euro leg, drawn separately so each can carry its own tone. */
  legAud: string
  legEur: string
  /** Baseline of the first name line and the gap to each following line. */
  nameY: number
  nameGap: number
  /** Baseline of the first sub line and the gap to each following line. */
  subY: number
  subGap: number
  /** Amount chip plate and its clip window, in chip-local units. */
  chip: { x: number; y: number; w: number; h: number }
  /** Sweep band, in chip-local units; its travel distance lives in CSS. */
  beam: { x: number; w: number }
  /** MATCHED verdict plate and its text baseline. */
  plate: { x: number; y: number; w: number; h: number; textY: number }
  /** Hairline joining the verdict plate to the chip below it. */
  link: { x: number; y1: number; y2: number }
  stations: Station[]
}

const STATION_COPY = {
  source: { name: 'NAB ****8324', sub: 'OUT A$28,000 · 02 APR' },
  bridge: { name: 'INTL TRANSFER', sub: 'FX 0.6000' },
  destination: { name: 'DEUTSCHE ****9878', sub: 'IN €16,800 · 04 APR' },
} as const

/** Desktop and tablet: three stations on one row, single-line labels. */
const WIDE: MatchLayout = {
  variant: 'wide',
  key: 'w',
  viewBox: '-20 0 600 200',
  nodeY: 118,
  legAud: 'M 76 118 Q 178 52 280 118',
  legEur: 'M 280 118 Q 382 52 484 118',
  nameY: 146,
  nameGap: 0,
  subY: 168,
  subGap: 0,
  chip: { x: -50, y: -43, w: 100, h: 26 },
  beam: { x: -64, w: 26 },
  plate: { x: 438, y: 38, w: 92, h: 26, textY: 55 },
  link: { x: 484, y1: 64, y2: 75 },
  stations: [
    { cx: 76, nameLines: [STATION_COPY.source.name], subLines: [STATION_COPY.source.sub] },
    {
      cx: 280,
      nameLines: [STATION_COPY.bridge.name],
      subLines: [STATION_COPY.bridge.sub],
      ping: 'fx',
      subClass: 'ecm-sub-fx',
    },
    {
      cx: 484,
      nameLines: [STATION_COPY.destination.name],
      subLines: [STATION_COPY.destination.sub],
      ping: 'dest',
      subClass: 'ecm-sub-eur',
    },
  ],
}

/** Phone: the same three stations, each label broken across two lines so the
 *  row stops being width-bound and the type can grow. */
const COMPACT: MatchLayout = {
  variant: 'compact',
  key: 'c',
  viewBox: '0 0 380 210',
  nodeY: 96,
  legAud: 'M 54 96 Q 122 46 190 96',
  legEur: 'M 190 96 Q 258 46 326 96',
  nameY: 128,
  nameGap: 20,
  subY: 172,
  subGap: 18,
  chip: { x: -58, y: -46, w: 116, h: 30 },
  beam: { x: -72, w: 26 },
  plate: { x: 280, y: 12, w: 92, h: 26, textY: 29 },
  link: { x: 326, y1: 38, y2: 50 },
  stations: [
    { cx: 54, nameLines: ['NAB', '****8324'], subLines: ['OUT A$28,000', '02 APR'] },
    { cx: 190, nameLines: ['INTL', 'TRANSFER'], subLines: [STATION_COPY.bridge.sub], ping: 'fx', subClass: 'ecm-sub-fx' },
    {
      cx: 326,
      nameLines: ['DEUTSCHE', '****9878'],
      subLines: ['IN €16,800', '04 APR'],
      ping: 'dest',
      subClass: 'ecm-sub-eur',
    },
  ],
}

function MatchDiagram({ layout }: { layout: MatchLayout }) {
  const { chip, beam, plate, link, key } = layout
  const windowId = `ecmnet-window-${key}`
  const beamId = `ecmnet-beam-${key}`

  return (
    <svg
      className={`ecm ecm-${layout.variant}`}
      viewBox={layout.viewBox}
      role="img"
      aria-label="An Australian dollar transfer matched to a euro deposit through an international money transfer"
    >
      <defs>
        {/* Window the rolling amounts and the sweep are clipped to, so both
            read as motion inside the chip rather than loose SVG text */}
        <clipPath id={windowId}>
          <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx="3" />
        </clipPath>

        {/* Soft gold beam: transparent at both edges so the sweep reads as
            light travelling across the plate, not a bar sliding over it */}
        <linearGradient id={beamId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0d491" stopOpacity="0" />
          <stop offset="45%" stopColor="#f0d491" stopOpacity="0.62" />
          <stop offset="55%" stopColor="#fff6e0" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#f0d491" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Leg one: dollars. Recessed gold — the trail before the swap */}
      <path className="ecm-path ecm-path-aud" d={layout.legAud} fill="none" />

      {/* Leg two: euros. Bright gold — the same funds, now converted */}
      <path className="ecm-path ecm-path-eur" d={layout.legEur} fill="none" />

      {layout.stations.map((station) => (
        <g className="ecm-st" key={station.cx}>
          {station.ping ? (
            <circle className={`ecm-ping ecm-ping-${station.ping}`} cx={station.cx} cy={layout.nodeY} r="9" />
          ) : null}
          <circle className="ecm-ring" cx={station.cx} cy={layout.nodeY} r="9" />
          <circle className="ecm-dot" cx={station.cx} cy={layout.nodeY} r="4.5" />

          {station.nameLines.map((line, index) => (
            <text
              className="ecm-name"
              key={line}
              x={station.cx}
              y={layout.nameY + index * layout.nameGap}
              textAnchor="middle"
            >
              {line}
            </text>
          ))}

          {station.subLines.map((line, index) => (
            <text
              className={station.subClass ? `ecm-sub ${station.subClass}` : 'ecm-sub'}
              key={line}
              x={station.cx}
              y={layout.subY + index * layout.subGap}
              textAnchor="middle"
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* The travelling amount chip: dollars out, euros in */}
      <g className="ecm-chip">
        {/* Unmatched plate: dark fill, champagne rule */}
        <rect className="ecm-box ecm-box-aud" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx="3" />
        {/* Matched plate: gold wash, bright rule — cross-faded in on conversion */}
        <rect className="ecm-box ecm-box-eur" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx="3" />

        <g clipPath={`url(#${windowId})`}>
          <text className="ecm-amt ecm-amt-aud" x="0" y={chip.y + chip.h / 2 + 5} textAnchor="middle">
            A$28,000
          </text>
          <text className="ecm-amt ecm-amt-eur" x="0" y={chip.y + chip.h / 2 + 5} textAnchor="middle">
            €16,800
          </text>
          <rect
            className="ecm-beam"
            x={beam.x}
            y={chip.y}
            width={beam.w}
            height={chip.h}
            fill={`url(#${beamId})`}
          />
        </g>
      </g>

      {/* Verdict: the one green in the system, fired on the same frame as the
          destination ping and tied to the chip by its own hairline */}
      <g className="ecm-match">
        <line className="ecm-link" x1={link.x} y1={link.y1} x2={link.x} y2={link.y2} />
        <rect className="ecm-match-fill" x={plate.x} y={plate.y} width={plate.w} height={plate.h} rx="2" />
        {/* pathLength normalises the perimeter to 100 so one dash keyframe draws
            the rule closed at any plate width — the flagged ledger row's technique */}
        <rect
          className="ecm-match-rule"
          x={plate.x}
          y={plate.y}
          width={plate.w}
          height={plate.h}
          rx="2"
          pathLength={100}
        />
        <text className="ecm-match-text" x={plate.x + plate.w / 2} y={plate.textY} textAnchor="middle">
          MATCHED
        </text>
      </g>
    </svg>
  )
}

export default function CurrencyMatch() {
  return (
    <div className="ecm-wrap">
      <p className="ecm-kicker">Cross-currency match — reconstructed</p>
      <MatchDiagram layout={WIDE} />
      <MatchDiagram layout={COMPACT} />
      <p className="ecm-caption">
        Same funds, two currencies: matched automatically, with source pages cited for both sides.
      </p>
    </div>
  )
}
