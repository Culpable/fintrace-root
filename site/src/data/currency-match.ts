/**
 * Cross-currency match geometry.
 *
 * Two layouts, one choreography: the diagram ships as two SVGs selected by
 * `display` at 768px. Both run identical class names and therefore identical
 * keyframes; only geometry differs, and every geometric difference is carried
 * by the `.ecm-wide` / `.ecm-compact` scope in CSS rather than a media query.
 */

export type Station = {
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

export type MatchLayout = {
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

export const STATION_COPY = {
  source: { name: 'NAB ****8324', sub: 'OUT A$28,000 · 02 APR' },
  bridge: { name: 'INTL TRANSFER', sub: 'FX 0.6000' },
  destination: { name: 'DEUTSCHE ****9878', sub: 'IN €16,800 · 04 APR' },
} as const

/** Desktop and tablet: three stations on one row, single-line labels. */
export const WIDE: MatchLayout = {
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
export const COMPACT: MatchLayout = {
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
