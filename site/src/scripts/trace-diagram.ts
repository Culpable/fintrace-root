import { NODES, PATH_IDS, AMBIENT_EDGES } from '@/data/trace.ts'

/* Thread timeline (seconds): wait, draw, hold with pins lit, fade, repeat. */
const DELAY = 1.0
const DRAW = 6.5
const HOLD_END = 12.8
const CYCLE = 15

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

type Pt = { x: number; y: number }

const root = document.querySelector<HTMLElement>('.tnet-root')
const canvas = root?.querySelector<HTMLCanvasElement>('.tnet-canvas')

if (root && canvas) {
  mountTraceDiagram(root, canvas)
}

/**
 * Drive the diagram. `applyHops` replaces the React `hops` state: it toggles
 * the same classes on the prerendered label and note spans that the JSX
 * conditions produced, using the `data-path-index` and `data-hop-index`
 * attributes so the script needs no node table of its own.
 */
function mountTraceDiagram(root: HTMLElement, canvas: HTMLCanvasElement) {
  const labels = [...root.querySelectorAll<HTMLElement>('.tnet-label[data-path-index]')]
  const notes = [...root.querySelectorAll<HTMLElement>('.tnet-note[data-hop-index]')]

  const applyHops = (hops: number) => {
    for (const label of labels) {
      const pathIndex = Number(label.dataset.pathIndex)
      const hot = pathIndex <= hops && hops > 0
      label.classList.toggle('is-hot', hot)
      label.classList.toggle('is-flagged', hot && label.dataset.flagged !== undefined)
    }
    for (const note of notes) {
      note.classList.toggle('is-on', hops >= Number(note.dataset.hopIndex))
    }
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  /* ---- Geometry, rebuilt on every resize ---- */
  let w = 0
  let h = 0
  let pts: Pt[] = []
  // 64 sampled points per curved edge: cheap polyline drawing + pulse positions.
  let edgeSamples: Pt[][] = []
  // The traced route as one concatenated sample list with cumulative lengths.
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

  /** Control point offset perpendicular to the chord — the "string sag". */
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

    // Rebuild the traced route from its four segments with gentler sag so
    // the annotations (positioned at chord midpoints) stay close to it.
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

  /* ---- Deterministic ambient pulses (no per-frame allocation) ---- */
  const pulses = AMBIENT_EDGES.flatMap((_, i) => {
    const count = i % 3 === 0 ? 2 : 1
    return Array.from({ length: count }, (_, k) => ({
      edge: i,
      speed: 0.035 + ((i * 29 + k * 17) % 47) / 900,
      phase: ((i * 53 + k * 41) % 100) / 100,
      bright: (i + k) % 5 === 2,
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
  // Loop-clock moments each path node was reached, for the sonar rings.
  let reachTimes: number[] = []

  const frame = (now: number) => {
    if (!running) return
    // Clamp dt into [0, 0.05]: never negative (first-frame rAF timestamps
    // can precede the start time in Chrome) and never a resume jump.
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
        applyHops(0)
      }
    }

    ctx.clearRect(0, 0, w, h)

    // 1) Ambient edges — barely-there gold strings between accounts.
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(212, 169, 78, 0.10)'
    for (const seg of edgeSamples) {
      ctx.beginPath()
      ctx.moveTo(seg[0].x, seg[0].y)
      for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i].x, seg[i].y)
      ctx.stroke()
    }

    // 2) Ordinary transaction pulses drifting along the edges.
    for (const p of pulses) {
      const t = (clock * p.speed + p.phase) % 1
      const seg = edgeSamples[p.edge]
      const pt = seg[Math.floor(t * (seg.length - 1))]
      ctx.fillStyle = p.bright ? 'rgba(240, 212, 145, 0.5)' : 'rgba(243, 236, 221, 0.28)'
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }

    // 3) Account nodes.
    for (let i = 0; i < pts.length; i++) {
      ctx.fillStyle = 'rgba(243, 236, 221, 0.45)'
      ctx.beginPath()
      ctx.arc(pts[i].x, pts[i].y, 2.2, 0, Math.PI * 2)
      ctx.fill()
      if (NODES[i].onPath) {
        ctx.strokeStyle = 'rgba(240, 212, 145, 0.22)'
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, 5.5, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // 4) The golden thread, drawn to the eased progress point. The first
    //    segment (into CASH) renders crimson — the flagged hop.
    const p = Math.min(1, Math.max(0, (cycleT - DELAY) / DRAW))
    const drawnLen = easeInOutCubic(p) * totalLen
    const fade = cycleT > HOLD_END ? Math.max(0, 1 - (cycleT - HOLD_END) / (CYCLE - HOLD_END)) : 1

    if (drawnLen > 0 && fade > 0) {
      // Walk the cumulative table to the last fully-drawn sample, then
      // interpolate a partial point so the tip advances smoothly.
      let idx = 0
      while (idx < pathCum.length - 1 && pathCum[idx + 1] <= drawnLen) idx++
      const tip: Pt = { x: pathPts[idx].x, y: pathPts[idx].y }
      if (idx < pathPts.length - 1) {
        const segLen = pathCum[idx + 1] - pathCum[idx] || 1
        const f = Math.min(1, (drawnLen - pathCum[idx]) / segLen)
        tip.x += (pathPts[idx + 1].x - pathPts[idx].x) * f
        tip.y += (pathPts[idx + 1].y - pathPts[idx].y) * f
      }

      // Index of the last sample inside the flagged first segment.
      let flagEndIdx = 0
      while (flagEndIdx < pathCum.length - 1 && pathCum[flagEndIdx + 1] <= segEndLen[0]) flagEndIdx++

      /** Stroke the thread between two sample indices, with a live tip. */
      const strokeRange = (from: number, to: number, width: number, colour: string, withTip: boolean) => {
        ctx.lineWidth = width
        ctx.strokeStyle = colour
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pathPts[from].x, pathPts[from].y)
        for (let i = from + 1; i <= to; i++) ctx.lineTo(pathPts[i].x, pathPts[i].y)
        if (withTip) ctx.lineTo(tip.x, tip.y)
        ctx.stroke()
      }

      const crimsonTo = Math.min(idx, flagEndIdx)
      const crimsonTipped = idx <= flagEndIdx
      // Crimson pass: glow then core, only as far as the flagged segment runs.
      strokeRange(0, crimsonTo, 5, `rgba(179, 35, 31, ${0.16 * fade})`, crimsonTipped)
      strokeRange(0, crimsonTo, 1.6, `rgba(199, 62, 58, ${0.92 * fade})`, crimsonTipped)
      // Gold pass: picks up where the flagged segment ends.
      if (idx > flagEndIdx) {
        strokeRange(flagEndIdx, idx, 5, `rgba(212, 169, 78, ${0.16 * fade})`, true)
        strokeRange(flagEndIdx, idx, 1.6, `rgba(240, 212, 145, ${0.95 * fade})`, true)
      }

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
        applyHops(completed)
      }
      prevDrawn = drawnLen

      // 5) Pins + expanding sonar rings on every reached path node. The
      //    flagged CASH node pins crimson; every other pin is gold.
      for (let s = 0; s <= completed && s < PATH_IDS.length; s++) {
        const node = pts[PATH_IDS[s]]
        const flagged = NODES[PATH_IDS[s]].flagged
        const pin = flagged ? `rgba(199, 62, 58, ${0.95 * fade})` : `rgba(240, 212, 145, ${0.95 * fade})`
        ctx.fillStyle = pin
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2.8, 0, Math.PI * 2)
        ctx.fill()
        const reach = reachTimes[s]
        if (reach !== undefined) {
          const age = clock - reach
          if (age < 0.9) {
            ctx.strokeStyle = flagged
              ? `rgba(199, 62, 58, ${(1 - age / 0.9) * 0.5 * fade})`
              : `rgba(212, 169, 78, ${(1 - age / 0.9) * 0.5 * fade})`
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

  const ro = new ResizeObserver(rebuild)
  ro.observe(root)
  rebuild()

  // Release the observers and the loop when the document is discarded, which
  // is the equivalent of the React effect's cleanup on navigation away.
  window.addEventListener('pagehide', () => {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  })
}

export {}
