'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

/**
 * Signature hero set-piece for the "Follow the Money" concept.
 *
 * A full-bleed 2D-canvas evidence graph: account nodes joined by faintly
 * pulsing edges (ordinary transaction traffic), over which a red thread
 * progressively draws itself along one suspicious route - joint account →
 * cash → related account → Wise → overseas - like investigator's string on
 * a pinboard, but algorithmically precise. Node labels and per-hop amount
 * annotations are HTML (crisp text, easy styling) positioned with the same
 * normalised coordinates the canvas uses, inside a shared parallax layer
 * so canvas and labels always move as one.
 */

type GraphNode = {
  id: number
  label: string
  /** Normalised position within the hero canvas (0..1 on both axes). */
  x: number
  y: number
  /** Node sits on the suspicious route traced by the red thread. */
  onPath?: boolean
  /** Declutter small screens: label hidden below the md breakpoint. */
  hideOnMobile?: boolean
}

/* Node placement keeps the left column clear for the headline on desktop. */
const NODES: GraphNode[] = [
  { id: 0, label: 'CBA JOINT ****8802', x: 0.6, y: 0.22, onPath: true },
  { id: 1, label: 'CASH', x: 0.745, y: 0.13, onPath: true },
  { id: 2, label: 'NAB ****1130', x: 0.885, y: 0.27, onPath: true },
  { id: 3, label: 'WISE AUD', x: 0.79, y: 0.5, onPath: true },
  { id: 4, label: 'HDFC ****3321 · INR', x: 0.895, y: 0.73, onPath: true },
  { id: 5, label: 'ANZ ****4417', x: 0.625, y: 0.645 },
  { id: 6, label: 'WBC ****5546', x: 0.72, y: 0.87, hideOnMobile: true },
  { id: 7, label: 'CRYPTO EXCH', x: 0.94, y: 0.1, hideOnMobile: true },
  { id: 8, label: 'AMEX ****9010', x: 0.54, y: 0.42, hideOnMobile: true },
  { id: 9, label: 'PAYPAL', x: 0.46, y: 0.845, hideOnMobile: true },
]

/** The suspicious route, in visit order, as node ids. */
const PATH_IDS = [0, 1, 2, 3, 4]

/** Ambient edges - the first four double as the traced route's segments. */
const AMBIENT_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 8],
  [8, 5],
  [5, 3],
  [2, 7],
  [6, 5],
  [9, 5],
  [6, 3],
  [7, 3],
  [9, 0],
  [8, 3],
]

/** One evidence annotation per traced segment, revealed as the thread lands each hop. */
const ANNOTATIONS = [
  { text: 'A$9,500 · 14 MAR 2021', dx: -86, dy: -30, hideOnMobile: false },
  { text: 'A$9,400 · 16 MAR 2021', dx: 16, dy: -22, hideOnMobile: true },
  { text: 'A$28,000 · 02 APR 2021', dx: 18, dy: -6, hideOnMobile: false },
  { text: '₹15,40,000 · 04 APR 2021 · FX MATCH', dx: -40, dy: 18, hideOnMobile: false },
]

/* Thread timeline (seconds): wait, draw, hold with pins lit, fade, repeat. */
const DELAY = 1.2
const DRAW = 7
const HOLD_END = 14.2
const CYCLE = 16

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function TraceNetwork() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Number of completed hops - drives annotation and label "hot" states.
  const [hops, setHops] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    const para = parallaxRef.current
    const canvas = canvasRef.current
    if (!root || !para || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Pt = { x: number; y: number }

    /* ---- Geometry, rebuilt on every resize ---- */
    let w = 0
    let h = 0
    let pts: Pt[] = []
    // 64 sampled points per curved edge: cheap polyline drawing + particle positions.
    let edgeSamples: Pt[][] = []
    // The red route as one concatenated sample list with cumulative lengths.
    let pathPts: Pt[] = []
    let pathCum: number[] = []
    let segEndLen: number[] = []
    let totalLen = 0

    /** Sample a quadratic bezier a→b bowed via control point c. */
    const sampleQuad = (a: Pt, c: Pt, b: Pt, n: number): Pt[] => {
      const out: Pt[] = []
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const u = 1 - t
        out.push({
          x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
          y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
        })
      }
      return out
    }

    /** Control point offset perpendicular to the chord - the "string sag". */
    const controlFor = (a: Pt, b: Pt, i: number, gain: number): Pt => {
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      const sign = i % 2 === 0 ? 1 : -1
      return { x: mx + (-dy / len) * len * gain * sign, y: my + (dx / len) * len * gain * sign }
    }

    const rebuild = () => {
      const rect = root.getBoundingClientRect()
      w = rect.width
      h = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      pts = NODES.map((n) => ({ x: n.x * w, y: n.y * h }))
      edgeSamples = AMBIENT_EDGES.map(([a, b], i) => sampleQuad(pts[a], controlFor(pts[a], pts[b], i, 0.1), pts[b], 64))

      // Rebuild the red route from its four segments with gentler sag so the
      // annotations (positioned at chord midpoints) stay close to the thread.
      pathPts = []
      pathCum = [0]
      segEndLen = []
      for (let s = 0; s < PATH_IDS.length - 1; s++) {
        const a = pts[PATH_IDS[s]]
        const b = pts[PATH_IDS[s + 1]]
        const seg = sampleQuad(a, controlFor(a, b, s, 0.08), b, 64)
        // Skip the duplicated join point after the first segment.
        const start = s === 0 ? 0 : 1
        for (let i = start; i < seg.length; i++) {
          const p = seg[i]
          if (pathPts.length > 0) {
            const q = pathPts[pathPts.length - 1]
            pathCum.push(pathCum[pathCum.length - 1] + Math.hypot(p.x - q.x, p.y - q.y))
          }
          pathPts.push(p)
        }
        segEndLen.push(pathCum[pathCum.length - 1])
      }
      totalLen = pathCum[pathCum.length - 1] || 1
    }

    /* ---- Deterministic ambient particles (no Math.random - stable builds) ---- */
    const particles = AMBIENT_EDGES.flatMap((_, i) => {
      const count = i % 3 === 0 ? 2 : 1
      return Array.from({ length: count }, (_, k) => ({
        edge: i,
        speed: 0.035 + ((i * 29 + k * 17) % 47) / 900,
        phase: ((i * 53 + k * 41) % 100) / 100,
        amber: (i + k) % 5 === 2,
      }))
    })

    /* ---- Animation loop with its own clock (pausable, drift-free) ---- */
    let raf = 0
    let running = false
    let inView = false
    let last = 0
    let clock = 0
    let cycleT = 0
    let prevCycleT = -1
    let prevDrawn = 0
    let hopsLocal = 0
    // Wall-clock (loop-clock) moments each path node was reached, for ring pulses.
    let reachTimes: number[] = []

    /* ---- Pointer parallax: eased towards the target inside the same loop ---- */
    let txT = 0
    let tyT = 0
    let tx = 0
    let ty = 0

    const frame = (now: number) => {
      if (!running) return
      // Clamp dt into [0, 0.05]: the upper bound stops a background-tab resume
      // fast-forwarding the scene; the lower bound guards against the first rAF
      // timestamp landing BEFORE the performance.now() captured in syncRunning
      // (a real Chrome quirk), which would drive the clock negative and index
      // the edge-sample arrays at -1.
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000 || 0))
      last = now
      clock += dt
      prevCycleT = cycleT
      cycleT = (cycleT + dt) % CYCLE

      // New cycle: clear hop state so annotations retract before the redraw.
      if (cycleT < prevCycleT) {
        prevDrawn = 0
        reachTimes = []
        if (hopsLocal !== 0) {
          hopsLocal = 0
          setHops(0)
        }
      }

      // Ease the parallax offset and move canvas + labels as one layer.
      tx += (txT - tx) * 0.06
      ty += (tyT - ty) * 0.06
      para.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`

      ctx.clearRect(0, 0, w, h)

      // 1) Ambient edges - barely-there strings between accounts.
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(154, 165, 193, 0.10)'
      for (const seg of edgeSamples) {
        ctx.beginPath()
        ctx.moveTo(seg[0].x, seg[0].y)
        for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y)
        ctx.stroke()
      }

      // 2) Ordinary transaction pulses drifting along the edges.
      for (const p of particles) {
        const t = (clock * p.speed + p.phase) % 1
        const seg = edgeSamples[p.edge]
        const pt = seg[Math.floor(t * (seg.length - 1))]
        ctx.fillStyle = p.amber ? 'rgba(217, 164, 65, 0.55)' : 'rgba(232, 236, 246, 0.32)'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // 3) Account nodes.
      for (let i = 0; i < pts.length; i++) {
        ctx.fillStyle = 'rgba(232, 236, 246, 0.5)'
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        if (NODES[i].onPath) {
          ctx.strokeStyle = 'rgba(232, 236, 246, 0.22)'
          ctx.beginPath()
          ctx.arc(pts[i].x, pts[i].y, 5.5, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // 4) The red thread, drawn to the eased progress point.
      const p = Math.min(1, Math.max(0, (cycleT - DELAY) / DRAW))
      const drawnLen = easeInOutCubic(p) * totalLen
      const fade = cycleT > HOLD_END ? Math.max(0, 1 - (cycleT - HOLD_END) / (CYCLE - HOLD_END)) : 1

      if (drawnLen > 0 && fade > 0) {
        // Walk the cumulative table to the last fully-drawn sample, then
        // interpolate a partial point so the tip advances smoothly.
        let idx = 0
        while (idx < pathCum.length - 1 && pathCum[idx + 1] <= drawnLen) idx++
        const tip: Pt = { ...pathPts[idx] }
        if (idx < pathPts.length - 1) {
          const segLen = pathCum[idx + 1] - pathCum[idx] || 1
          const f = Math.min(1, (drawnLen - pathCum[idx]) / segLen)
          tip.x += (pathPts[idx + 1].x - pathPts[idx].x) * f
          tip.y += (pathPts[idx + 1].y - pathPts[idx].y) * f
        }

        const drawThread = (width: number, alpha: number) => {
          ctx.lineWidth = width
          ctx.strokeStyle = `rgba(217, 43, 43, ${alpha})`
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(pathPts[0].x, pathPts[0].y)
          for (let i = 1; i <= idx; i++) ctx.lineTo(pathPts[i].x, pathPts[i].y)
          ctx.lineTo(tip.x, tip.y)
          ctx.stroke()
        }
        drawThread(5, 0.14 * fade) // soft glow pass
        drawThread(1.6, 0.95 * fade) // crisp core pass

        // Detect newly-completed hops and record their timestamps for rings.
        let completed = 0
        for (let s = 0; s < segEndLen.length; s++) {
          if (drawnLen >= segEndLen[s]) completed = s + 1
          if (prevDrawn < segEndLen[s] && drawnLen >= segEndLen[s]) reachTimes[s + 1] = clock
        }
        // The origin node lights up the moment drawing starts.
        if (prevDrawn <= 0 && drawnLen > 0) reachTimes[0] = clock
        if (completed !== hopsLocal) {
          hopsLocal = completed
          setHops(completed)
        }
        prevDrawn = drawnLen

        // 5) Red pins + expanding sonar rings on every reached path node.
        for (let s = 0; s <= completed && s < PATH_IDS.length; s++) {
          const node = pts[PATH_IDS[s]]
          ctx.fillStyle = `rgba(217, 43, 43, ${0.95 * fade})`
          ctx.beginPath()
          ctx.arc(node.x, node.y, 2.8, 0, Math.PI * 2)
          ctx.fill()
          const reach = reachTimes[s]
          if (reach !== undefined) {
            const age = clock - reach
            if (age < 0.9) {
              ctx.strokeStyle = `rgba(217, 43, 43, ${(1 - age / 0.9) * 0.5 * fade})`
              ctx.lineWidth = 1.2
              ctx.beginPath()
              ctx.arc(node.x, node.y, 4 + age * 34, 0, Math.PI * 2)
              ctx.stroke()
            }
          }
        }
      }

      raf = requestAnimationFrame(frame)
    }

    /* ---- Run only while visible: on-screen AND tab in the foreground ---- */
    const syncRunning = () => {
      const should = inView && !document.hidden
      if (should && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false
        syncRunning()
      },
      { threshold: 0 },
    )
    io.observe(root)

    const onVisibility = () => syncRunning()
    document.addEventListener('visibilitychange', onVisibility)

    const onPointerMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      txT = ((e.clientX - r.left) / r.width - 0.5) * 14
      tyT = ((e.clientY - r.top) / r.height - 0.5) * 10
    }
    const onPointerLeave = () => {
      txT = 0
      tyT = 0
    }
    root.addEventListener('pointermove', onPointerMove, { passive: true })
    root.addEventListener('pointerleave', onPointerLeave, { passive: true })

    const ro = new ResizeObserver(rebuild)
    ro.observe(root)
    rebuild()

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className="tn-root" aria-hidden="true">
      <div ref={parallaxRef} className="tn-parallax">
        <canvas ref={canvasRef} className="tn-canvas" />
        <div className="tn-layer">
          {/* Account labels ride the same normalised grid as the canvas dots. */}
          {NODES.map((node) => {
            const pathIdx = PATH_IDS.indexOf(node.id)
            const hot = pathIdx !== -1 && pathIdx <= hops && hops > 0
            return (
              <span
                key={node.id}
                className={clsx('tn-label', hot && 'is-hot', node.hideOnMobile && 'tn-md-only')}
                style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
              >
                {node.label}
              </span>
            )
          })}
          {/* Amount/date evidence notes appear as each hop completes. */}
          {ANNOTATIONS.map((a, i) => {
            const n1 = NODES[PATH_IDS[i]]
            const n2 = NODES[PATH_IDS[i + 1]]
            return (
              <span
                key={a.text}
                className={clsx('tn-note', hops >= i + 1 && 'is-on', a.hideOnMobile && 'tn-md-only')}
                style={{
                  left: `calc(${((n1.x + n2.x) / 2) * 100}% + ${a.dx}px)`,
                  top: `calc(${((n1.y + n2.y) / 2) * 100}% + ${a.dy}px)`,
                }}
              >
                {a.text}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
