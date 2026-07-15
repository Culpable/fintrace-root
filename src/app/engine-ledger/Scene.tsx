'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type SceneProps = {
  /** Notify the parent once the first frame has rendered so the canvas can fade in */
  onReady?: () => void
}

/* ---------------------------------------------------------------------------
 * Helpers — deliberately module-scoped so the render loop allocates nothing.
 * ------------------------------------------------------------------------- */

/** Linear interpolation between a and b. */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Hermite smoothstep clamped to [0, 1] — used for all flow easings. */
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Draw a miniature bank statement onto a canvas and wrap it as a texture:
 * warm paper, a bold header rule, and alternating ruled "transaction" lines.
 * Baking the artwork keeps the documents unlit (cheap) yet clearly readable
 * as paper statements rather than abstract planes.
 */
function makePaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 168
  const ctx = canvas.getContext('2d')!

  // Soft top-lit paper gradient
  const paper = ctx.createLinearGradient(0, 0, 0, 168)
  paper.addColorStop(0, '#f7f1e3')
  paper.addColorStop(1, '#e3dac4')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, 128, 168)

  // Bank header block
  ctx.fillStyle = 'rgba(42, 35, 24, 0.6)'
  ctx.fillRect(12, 15, 64, 6)

  // Ruled statement lines — alternate long and short rows so the texture
  // reads as tabular data even at a distance
  ctx.fillStyle = 'rgba(42, 35, 24, 0.22)'
  for (let y = 36; y < 148; y += 9) {
    const isShortRow = y % 18 === 0
    ctx.fillRect(12, y, isShortRow ? 72 : 104, 2.5)
  }

  // Right-hand amount column, slightly darker, suggesting debit/credit figures
  ctx.fillStyle = 'rgba(42, 35, 24, 0.34)'
  for (let y = 36; y < 148; y += 18) {
    ctx.fillRect(96, y, 20, 2.5)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Radial glow texture used for the gate halo sprites (cheap bloom substitute). */
function makeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(244, 221, 160, 0.9)')
  gradient.addColorStop(0.25, 'rgba(222, 181, 95, 0.38)')
  gradient.addColorStop(0.6, 'rgba(190, 148, 66, 0.1)')
  gradient.addColorStop(1, 'rgba(190, 148, 66, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

/** Small soft dot texture for the ambient dust motes. */
function makeDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 245, 220, 1)')
  gradient.addColorStop(0.35, 'rgba(240, 212, 145, 0.55)')
  gradient.addColorStop(1, 'rgba(240, 212, 145, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

/* ---------------------------------------------------------------------------
 * The spreadsheet the gate writes into.
 * ------------------------------------------------------------------------- */

/**
 * Ledger rows entered onto the sheet, in landing order. Grounded in what the
 * product actually finds: auto-categorised groceries and fuel, salary, a Wise
 * cross-currency transfer, gambling — and the flagged ATM withdrawal at index
 * 2, drawn in crimson as the anomaly the engine catches.
 */
const SHEET_ROWS = [
  { date: '03 MAR', desc: 'WOOLWORTHS 1224 CHATSWOOD', debit: '214.63', credit: '', tag: 'GROCERIES', flag: false },
  { date: '04 MAR', desc: 'SALARY — MERIDIAN PTY LTD', debit: '', credit: '8,412.90', tag: 'INCOME', flag: false },
  { date: '07 MAR', desc: 'ATM WITHDRAWAL — CROWS NEST', debit: '9,500.00', credit: '', tag: 'CASH', flag: true },
  { date: '09 MAR', desc: 'BP CONNECT MOSMAN', debit: '86.40', credit: '', tag: 'FUEL', flag: false },
  { date: '11 MAR', desc: 'TRANSFER — J SACINO ****4417', debit: '3,000.00', credit: '', tag: 'INTERNAL', flag: false },
  { date: '13 MAR', desc: 'WISE AUD→INR REF 8841', debit: '5,200.00', credit: '', tag: 'CROSS-CCY', flag: false },
  { date: '14 MAR', desc: 'SPORTSBET DEPOSIT', debit: '500.00', credit: '', tag: 'GAMBLING', flag: false },
  { date: '15 MAR', desc: 'RENT RECEIVED — NEUTRAL BAY', debit: '', credit: '650.00', tag: 'INCOME', flag: false },
]

// Canvas layout for the baked sheet. 1024x330 matches the 8.4:2.7 plane, so
// text renders without stretch. One header band plus eight 36px row bands.
const SHEET_W = 1024
const SHEET_H = 330
const HEADER_H = 42
const ROW_H = 36
const GUTTER_W = 40
// Column separators (canvas x): gutter | date | description | debit | credit | category
const COL_X = [GUTTER_W, 152, 612, 752, 884]

/**
 * Draw the spreadsheet with the first `rowsVisible` rows entered. The header,
 * gridlines, row numbers and column structure are always present — an empty
 * sheet still reads as a spreadsheet — and `highlightIndex` marks the row
 * that just landed with a brighter entry band. Called only when a row lands
 * or the cycle resets, never per frame.
 */
function drawSheet(ctx: CanvasRenderingContext2D, rowsVisible: number, highlightIndex: number) {
  // Obsidian plate ground with a faint top light so the sheet reads as a surface
  const plate = ctx.createLinearGradient(0, 0, 0, SHEET_H)
  plate.addColorStop(0, 'rgba(24, 19, 13, 0.96)')
  plate.addColorStop(1, 'rgba(15, 12, 8, 0.96)')
  ctx.clearRect(0, 0, SHEET_W, SHEET_H)
  ctx.fillStyle = plate
  ctx.fillRect(0, 0, SHEET_W, SHEET_H)

  // Header band + row-number gutter, slightly lifted from the plate
  ctx.fillStyle = 'rgba(212, 169, 78, 0.12)'
  ctx.fillRect(0, 0, SHEET_W, HEADER_H)
  ctx.fillStyle = 'rgba(212, 169, 78, 0.05)'
  ctx.fillRect(0, HEADER_H, GUTTER_W, SHEET_H - HEADER_H)

  // Alternating row shading beneath the data so the bands scan as rows
  ctx.fillStyle = 'rgba(243, 236, 221, 0.03)'
  for (let i = 1; i < SHEET_ROWS.length; i += 2) {
    ctx.fillRect(GUTTER_W, HEADER_H + i * ROW_H, SHEET_W - GUTTER_W, ROW_H)
  }

  // Crimson wash + entry highlight sit under the gridlines
  ctx.textBaseline = 'middle'
  for (let i = 0; i < rowsVisible; i++) {
    const top = HEADER_H + i * ROW_H
    if (SHEET_ROWS[i].flag) {
      ctx.fillStyle = 'rgba(224, 80, 58, 0.09)'
      ctx.fillRect(GUTTER_W, top, SHEET_W - GUTTER_W, ROW_H)
    }
    if (i === highlightIndex) {
      ctx.fillStyle = 'rgba(240, 212, 145, 0.1)'
      ctx.fillRect(GUTTER_W, top, SHEET_W - GUTTER_W, ROW_H)
      ctx.fillStyle = '#f0d491'
      ctx.fillRect(GUTTER_W + 1, top + 4, 4, ROW_H - 8)
    }
  }

  // Gridlines: every row boundary and column separator, plus a firmer frame
  ctx.fillStyle = 'rgba(212, 169, 78, 0.26)'
  for (let i = 0; i <= SHEET_ROWS.length; i++) {
    ctx.fillRect(0, HEADER_H + i * ROW_H - 1, SHEET_W, 1)
  }
  for (const x of COL_X) {
    ctx.fillRect(x, 0, 1, SHEET_H)
  }
  ctx.strokeStyle = 'rgba(212, 169, 78, 0.5)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, SHEET_W - 2, SHEET_H - 2)

  // Column headers in bright gold mono
  ctx.fillStyle = 'rgba(240, 212, 145, 0.95)'
  ctx.font = '600 15px Menlo, monospace'
  ctx.textAlign = 'left'
  ctx.fillText('DATE', 52, HEADER_H / 2 + 1)
  ctx.fillText('DESCRIPTION', 164, HEADER_H / 2 + 1)
  ctx.textAlign = 'right'
  ctx.fillText('DEBIT', 740, HEADER_H / 2 + 1)
  ctx.fillText('CREDIT', 872, HEADER_H / 2 + 1)
  ctx.textAlign = 'center'
  ctx.fillText('CATEGORY', 954, HEADER_H / 2 + 1)
  ctx.fillStyle = 'rgba(163, 154, 141, 0.8)'
  ctx.font = '400 13px Menlo, monospace'
  ctx.fillText('#', GUTTER_W / 2, HEADER_H / 2 + 1)

  // Row numbers stay for every band — an empty numbered row is still a sheet
  for (let i = 0; i < SHEET_ROWS.length; i++) {
    const mid = HEADER_H + i * ROW_H + ROW_H / 2 + 1
    ctx.fillStyle = 'rgba(163, 154, 141, 0.65)'
    ctx.font = '400 13px Menlo, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(String(i + 1), GUTTER_W / 2, mid)
  }

  // Entered rows: date + description left, amounts right-aligned in their
  // columns, category as a small outlined chip. The flagged row runs crimson.
  for (let i = 0; i < rowsVisible; i++) {
    const row = SHEET_ROWS[i]
    const mid = HEADER_H + i * ROW_H + ROW_H / 2 + 1
    const ink = row.flag ? '#e0503a' : 'rgba(228, 197, 132, 0.88)'
    const inkBright = row.flag ? '#e0503a' : '#f0d491'

    ctx.textAlign = 'left'
    ctx.font = '400 15px Menlo, monospace'
    ctx.fillStyle = ink
    ctx.fillText(row.date, 52, mid)
    ctx.font = '400 16px Menlo, monospace'
    ctx.fillText(row.desc, 164, mid)

    ctx.textAlign = 'right'
    ctx.font = '600 16px Menlo, monospace'
    ctx.fillStyle = inkBright
    if (row.debit) ctx.fillText(row.debit, 740, mid)
    if (row.credit) ctx.fillText(row.credit, 872, mid)

    // Category chip: measure the tag so the outline hugs the text
    ctx.font = '400 11px Menlo, monospace'
    const tagWidth = ctx.measureText(row.tag).width
    const chipW = tagWidth + 16
    ctx.strokeStyle = row.flag ? 'rgba(224, 80, 58, 0.75)' : 'rgba(212, 169, 78, 0.55)'
    ctx.lineWidth = 1
    ctx.strokeRect(954 - chipW / 2, mid - 10, chipW, 20)
    ctx.textAlign = 'center'
    ctx.fillStyle = row.flag ? '#e0503a' : 'rgba(228, 197, 132, 0.85)'
    ctx.fillText(row.tag, 954, mid)
  }
  ctx.textAlign = 'left'
}

/* ---------------------------------------------------------------------------
 * The Evidence Engine hero scene — LEDGER VARIANT.
 *
 * Narrative: unstructured paper statements stream in from the left, are
 * swallowed by the luminous golden scanning gate, and their lines are ENTERED
 * onto one large spreadsheet standing to the right — headers, gridlines, row
 * numbers, then transaction rows landing one at a time, with the flagged ATM
 * withdrawal written in crimson. Documents in, one growing spreadsheet out.
 * ------------------------------------------------------------------------- */
export default function EvidenceScene({ onReady }: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  // Keep the latest onReady in a ref so the scene effect can run exactly once.
  // Sync it inside an effect (declared before the scene effect) rather than
  // during render, which the react-hooks/refs rule forbids.
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    /* ------------------------------ Renderer ----------------------------- */
    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1
    const isMobile = width < 768

    // WebGL can be unavailable (blocked contexts, virtualised or headless
    // environments, exhausted GPU memory). Constructing the renderer THROWS in
    // that case — catch it and bail out quietly so the hero's designed static
    // fallback stays on screen instead of the whole page crashing.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    // Cap DPR at 2: retina crispness without paying 3x fill-rate on dense displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0d0b09')
    // Fog swallows both ends of the flow so documents materialise from
    // darkness and the sheet's far edge recedes into it — no visible pop-in
    scene.fog = new THREE.Fog('#0d0b09', 9, 24)

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60)
    const cameraBaseZ = isMobile ? 14 : 10.5
    camera.position.set(0, 0.9, cameraBaseZ)

    // Shift the whole stage right on desktop so the gate sits right-of-centre,
    // leaving the lower-left clear for the DOM headline. On mobile shift it
    // LEFT instead: the narrow frustum needs the room to the gate's right for
    // the spreadsheet, so the gate cedes the centre.
    const stage = new THREE.Group()
    stage.position.x = isMobile ? -0.7 : 1.1
    scene.add(stage)

    /* ------------------------- Incoming documents ------------------------ */
    const DOC_COUNT = isMobile ? 12 : 26
    const paperTexture = makePaperTexture()
    const docGeometry = new THREE.PlaneGeometry(1, 1.32)
    const docMaterial = new THREE.MeshBasicMaterial({
      map: paperTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    })
    const documents = new THREE.InstancedMesh(docGeometry, docMaterial, DOC_COUNT)
    documents.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    stage.add(documents)

    // Per-document flight parameters: each plane owns a lane, pace and wobble
    // so the stream reads as organic paperwork rather than a conveyor belt
    const docParams = Array.from({ length: DOC_COUNT }, () => ({
      phase: Math.random(),
      speed: 0.05 + Math.random() * 0.022, // journey fraction per second (~15-20 s traverse)
      laneY: -1.3 + Math.random() * 2.8,
      laneZ: -2.6 + Math.random() * 3.2,
      scale: 0.7 + Math.random() * 0.5,
      tilt: (Math.random() - 0.5) * 0.18,
      wobbleFreq: 0.6 + Math.random() * 0.8,
      wobbleAmp: 0.05 + Math.random() * 0.06,
    }))

    /* ------------------------ Outgoing spreadsheet ------------------------ */
    // ONE sheet, standing to the right of the gate, filled row by row. The
    // canvas is redrawn only when a row lands (~1.1 s apart), never per frame.
    const sheetCanvas = document.createElement('canvas')
    sheetCanvas.width = SHEET_W
    sheetCanvas.height = SHEET_H
    const sheetCtx = sheetCanvas.getContext('2d')!
    drawSheet(sheetCtx, 0, -1)

    const sheetTexture = new THREE.CanvasTexture(sheetCanvas)
    sheetTexture.colorSpace = THREE.SRGBColorSpace
    sheetTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())

    // The sheet cannot run flat along +x — the frustum right of the gate is
    // only ~3 stage-units wide at z=0. Pivot it at the gate's shoulder and yaw
    // it into DEPTH instead (+y rotation carries +x into −z): the near columns
    // (#, DATE, DESCRIPTION) stay large and legible while the far columns
    // recede into the fog, still fully inside frame at maximum camera sway.
    const SHEET_LEN = 7.2
    const SHEET_YAW = isMobile ? 0.75 : 1.0
    const sheetGeometry = new THREE.PlaneGeometry(SHEET_LEN, SHEET_LEN / (SHEET_W / SHEET_H))
    const sheetMaterial = new THREE.MeshBasicMaterial({
      map: sheetTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const sheetMesh = new THREE.Mesh(sheetGeometry, sheetMaterial)
    sheetMesh.renderOrder = 2
    // Group pivots at the sheet's left edge so yaw sweeps the far end away;
    // the mesh offsets by half its length to put that edge on the pivot
    const sheet = new THREE.Group()
    sheetMesh.position.set(SHEET_LEN / 2, 0, 0)
    sheet.position.set(isMobile ? 0.35 : 1.9, 0, 0.2)
    sheet.rotation.y = SHEET_YAW
    sheet.rotation.x = -0.05
    if (isMobile) sheet.scale.setScalar(0.35)
    sheet.add(sheetMesh)
    stage.add(sheet)

    // Entry cycle: fade in the empty sheet, land the eight rows ~1.1 s apart,
    // dwell on the finished ledger, then fade down and start again.
    const CYCLE = 13.2
    const FADE_IN_END = 0.5
    const FIRST_ROW = 0.9
    const ROW_INTERVAL = 1.1 // eighth row lands at 8.6 s
    const HIGHLIGHT_CLEAR = FIRST_ROW + SHEET_ROWS.length * ROW_INTERVAL // one beat after the last row
    const FADE_OUT_START = 11.8
    const FADE_OUT_END = 12.6
    const SHEET_MAX_OPACITY = 0.95
    let lastDrawKey = -1

    const dotTexture = makeDotTexture()

    /* ----------------------------- The gate ------------------------------ */
    const gate = new THREE.Group()
    stage.add(gate)

    const ringOuterGeometry = new THREE.TorusGeometry(1.75, 0.018, 12, 120)
    const ringOuterMaterial = new THREE.MeshBasicMaterial({ color: '#f0d491' })
    const ringOuter = new THREE.Mesh(ringOuterGeometry, ringOuterMaterial)
    ringOuter.rotation.y = Math.PI / 2
    gate.add(ringOuter)

    const ringInnerGeometry = new THREE.TorusGeometry(1.58, 0.008, 8, 100)
    const ringInnerMaterial = new THREE.MeshBasicMaterial({ color: '#d4a94e', transparent: true, opacity: 0.45 })
    const ringInner = new THREE.Mesh(ringInnerGeometry, ringInnerMaterial)
    ringInner.rotation.y = Math.PI / 2
    gate.add(ringInner)

    // Two additive sprites stand in for bloom: a wide atmospheric halo and a
    // tight hot core — far cheaper than post-processing on a marketing page
    const glowTexture = makeGlowTexture()
    const haloMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const halo = new THREE.Sprite(haloMaterial)
    halo.scale.setScalar(7)
    halo.renderOrder = 3
    gate.add(halo)

    const coreMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const core = new THREE.Sprite(coreMaterial)
    core.scale.setScalar(2.4)
    core.renderOrder = 3
    gate.add(core)

    /* --------------------------- Ambient dust ---------------------------- */
    // Trimmed and dimmed relative to the base scene: the sheet carries the
    // right-hand side now, and fewer motes keep its text legible.
    const DUST_COUNT = isMobile ? 96 : 208
    const dustPositions = new Float32Array(DUST_COUNT * 3)
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = -12 + Math.random() * 26
      dustPositions[i * 3 + 1] = -3.5 + Math.random() * 7
      dustPositions[i * 3 + 2] = -3 + Math.random() * 5
    }
    const dustGeometry = new THREE.BufferGeometry()
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.035,
      map: dotTexture,
      color: new THREE.Color('#8a7247'),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const dust = new THREE.Points(dustGeometry, dustMaterial)
    dust.renderOrder = 1
    stage.add(dust)

    /* --------------------------- Animation loop -------------------------- */
    const clock = new THREE.Clock()
    let elapsed = 0
    let rafId = 0
    let running = false
    let readyFired = false
    const dummy = new THREE.Object3D()
    // Pointer parallax: target values from events, current values lerped in
    // the loop so the camera glides rather than tracks
    const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 }

    const render = () => {
      // Clamp delta so a paused/hidden tab never produces a time jump
      const delta = Math.min(clock.getDelta(), 0.05)
      elapsed += delta

      // -- Documents: flow left → gate, funnel inwards and shrink at entry --
      for (let i = 0; i < DOC_COUNT; i++) {
        const p = docParams[i]
        const progress = (p.phase + elapsed * p.speed) % 1
        const funnel = smoothstep(0.85, 1, progress) // pull towards gate centre
        const swallow = 1 - smoothstep(0.93, 1, progress) // shrink through the gate

        dummy.position.set(
          lerp(-13, 0, progress),
          lerp(p.laneY + Math.sin(elapsed * p.wobbleFreq + i) * p.wobbleAmp, 0, funnel),
          lerp(p.laneZ, 0, funnel),
        )
        const scale = p.scale * Math.max(swallow, 0.001)
        dummy.scale.set(scale, scale, scale)
        dummy.rotation.set(0, progress * 0.35, p.tilt + Math.sin(elapsed * p.wobbleFreq * 0.7 + i * 2) * 0.04)
        dummy.updateMatrix()
        documents.setMatrixAt(i, dummy.matrix)
      }
      documents.instanceMatrix.needsUpdate = true

      // -- Sheet: land rows on the entry cycle; redraw the canvas ONLY when
      //    the visible-row count or the entry highlight changes --
      const cycleT = elapsed % CYCLE
      const rowsVisible =
        cycleT < FIRST_ROW ? 0 : Math.min(SHEET_ROWS.length, Math.floor((cycleT - FIRST_ROW) / ROW_INTERVAL) + 1)
      const highlightIndex = rowsVisible > 0 && cycleT < HIGHLIGHT_CLEAR ? rowsVisible - 1 : -1
      const drawKey = rowsVisible * 16 + (highlightIndex + 1)
      if (drawKey !== lastDrawKey) {
        lastDrawKey = drawKey
        drawSheet(sheetCtx, rowsVisible, highlightIndex)
        sheetTexture.needsUpdate = true
      }

      // Opacity envelope: fade in empty, hold while filling, fade out full
      let sheetOpacity = SHEET_MAX_OPACITY
      if (cycleT < FADE_IN_END) sheetOpacity *= smoothstep(0, FADE_IN_END, cycleT)
      else if (cycleT > FADE_OUT_START) sheetOpacity *= 1 - smoothstep(FADE_OUT_START, FADE_OUT_END, cycleT)
      sheetMaterial.opacity = sheetOpacity

      // Idle sway: barely-there yaw breath and lift so the sheet feels held,
      // not pinned. Yaw amplitude stays at 0.01 rad — the far end sits ~0.15
      // units inside the frustum edge and moves ~6x the yaw amplitude.
      sheet.rotation.y = SHEET_YAW + Math.sin(elapsed * 0.4) * 0.01
      sheet.position.y = Math.sin(elapsed * 0.5) * 0.02

      // -- Gate: breathe gently so the light feels alive, never flashy --
      const pulse = 1 + Math.sin(elapsed * 1.6) * 0.012
      gate.scale.setScalar(pulse)
      haloMaterial.opacity = 0.44 + Math.sin(elapsed * 1.6) * 0.08

      // -- Dust: slow drift keeps the atmosphere from reading as a still --
      dust.position.y = Math.sin(elapsed * 0.1) * 0.15

      // -- Camera: gentle drift plus pointer parallax, always looking at the flow --
      pointer.currentX = lerp(pointer.currentX, pointer.x, 0.04)
      pointer.currentY = lerp(pointer.currentY, pointer.y, 0.04)
      camera.position.x = Math.sin(elapsed * 0.07) * 0.35 + pointer.currentX * 0.6
      camera.position.y = 0.9 + Math.sin(elapsed * 0.05 + 1.3) * 0.12 - pointer.currentY * 0.35
      camera.lookAt(0, 0.1, 0)

      renderer.render(scene, camera)

      // Signal readiness after the first real frame so the DOM can cross-fade
      if (!readyFired) {
        readyFired = true
        onReadyRef.current?.()
      }
      rafId = requestAnimationFrame(render)
    }

    /* -------------------- Visibility-aware start/stop --------------------- */
    const start = () => {
      if (running) return
      running = true
      clock.getDelta() // flush the pause gap so the first delta stays small
      rafId = requestAnimationFrame(render)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    // Render only while the canvas is on screen AND the tab is visible —
    // scrolled past or backgrounded, the GPU goes fully idle
    let inView = true
    const syncRunning = () => {
      if (inView && !document.hidden) start()
      else stop()
    }
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting)
      syncRunning()
    })
    io.observe(mount)
    const onVisibility = () => syncRunning()
    document.addEventListener('visibilitychange', onVisibility)

    // Normalise pointer position to [-1, 1] for the parallax drift
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Track container size (not window size) so layout changes stay correct
    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(mount)

    /* ------------------------------ Cleanup ------------------------------ */
    return () => {
      stop()
      io.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)

      docGeometry.dispose()
      docMaterial.dispose()
      paperTexture.dispose()
      sheetGeometry.dispose()
      sheetMaterial.dispose()
      sheetTexture.dispose()
      dotTexture.dispose()
      glowTexture.dispose()
      ringOuterGeometry.dispose()
      ringOuterMaterial.dispose()
      ringInnerGeometry.dispose()
      ringInnerMaterial.dispose()
      haloMaterial.dispose()
      coreMaterial.dispose()
      dustGeometry.dispose()
      dustMaterial.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="eng-scene-mount" aria-hidden="true" />
}
