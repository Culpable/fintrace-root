/**
 * Account-network trace set-piece data.
 *
 * Shared by `TraceDiagram.astro`, which prerenders the labels and notes on the
 * normalised grid, and `src/scripts/trace-diagram.ts`, which draws the canvas
 * on the same grid - so the two never disagree about a position.
 */

export type GraphNode = {
  id: number
  label: string
  /** Normalised position within the panel (0..1 on both axes). */
  x: number
  y: number
  /** Node sits on the traced route. */
  onPath?: boolean
  /** The flagged node — pin and label render crimson once reached. */
  flagged?: boolean
  /** Place the label on the route-free side of the node; default below. */
  labelSide?: 'above'
  /** Shift the desktop label horizontally away from its route thread. */
  labelDx?: number
  /** Nudge the desktop label vertically while retaining its chosen side. */
  labelDy?: number
  /** Override the horizontal shift when the compact layout is active. */
  mobileLabelDx?: number
  /** Override the vertical nudge when the compact layout is active. */
  mobileLabelDy?: number
  /** Declutter small screens: label hidden below the md breakpoint. */
  hideOnMobile?: boolean
}

export type TraceAnnotation = {
  text: string
  dx: number
  dy: number
  mobileDx?: number
  mobileDy?: number
  flagged: boolean
  hideOnMobile: boolean
  /** Closes the trace: resolves brighter than the hops before it. */
  matched?: boolean
}

/* Nodes spread across the full panel width — this diagram owns its section,
   so there is no headline column to keep clear. */
export const NODES: GraphNode[] = [
  { id: 0, label: 'CBA JOINT ****5826', x: 0.1, y: 0.3, onPath: true, mobileLabelDx: 30 },
  { id: 1, label: 'CASH', x: 0.28, y: 0.14, onPath: true, flagged: true, labelSide: 'above' },
  { id: 2, label: 'NAB ****8324', x: 0.46, y: 0.34, onPath: true, labelDx: -60, mobileLabelDy: 12 },
  { id: 3, label: 'INTL TRANSFER', x: 0.63, y: 0.62, onPath: true, labelDx: 20, mobileLabelDx: 30 },
  { id: 4, label: 'DEUTSCHE ****9878 · EUR', x: 0.87, y: 0.44, onPath: true, labelSide: 'above', mobileLabelDx: -25 },
  { id: 5, label: 'ANZ ****7504', x: 0.24, y: 0.66, hideOnMobile: true },
  { id: 6, label: 'WBC ****3897', x: 0.48, y: 0.82, hideOnMobile: true },
  { id: 7, label: 'CRYPTO EXCH', x: 0.72, y: 0.16, hideOnMobile: true },
  { id: 8, label: 'AMEX ****8772', x: 0.08, y: 0.78, hideOnMobile: true },
  { id: 9, label: 'PAYPAL', x: 0.9, y: 0.8, hideOnMobile: true },
]

/** The traced route, in visit order, as node ids. */
export const PATH_IDS = [0, 1, 2, 3, 4]

/** Ambient edges — the first four double as the traced route's segments. */
export const AMBIENT_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 3],
  [8, 5],
  [2, 7],
  [6, 5],
  [6, 3],
  [7, 4],
  [9, 4],
  [8, 0],
  [9, 6],
]

/** One evidence annotation per traced segment, revealed as the thread lands. */
export const ANNOTATIONS: TraceAnnotation[] = [
  {
    text: 'A$9,500 · 07 MAR 2024 · SEE P. 214',
    dx: -72,
    dy: -26,
    mobileDx: -30,
    mobileDy: -34,
    flagged: true,
    hideOnMobile: false,
  },
  { text: 'A$9,400 · 09 MAR 2024', dx: 14, dy: -20, flagged: false, hideOnMobile: true },
  {
    text: 'A$28,000 · 02 APR 2024',
    dx: 16,
    dy: -4,
    mobileDx: -20,
    mobileDy: 14,
    flagged: false,
    hideOnMobile: false,
  },
  {
    text: '€16,800 · 04 APR 2024 · FX MATCH',
    dx: -48,
    dy: 22,
    mobileDx: -140,
    mobileDy: 62,
    flagged: false,
    hideOnMobile: false,
    matched: true,
  },
]
