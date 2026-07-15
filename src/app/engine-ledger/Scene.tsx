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

/**
 * Bake one spreadsheet-row cell: a dark glassy panel carrying gold ledger
 * marks — a date stub, description dashes and a bright right-aligned amount —
 * plus a hairline base rule. At hero distance the marks read as tabular data
 * without needing legible (and expensive) real text.
 */
function makeCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 40
  const ctx = canvas.getContext('2d')!

  // Glassy obsidian panel with a faint top light
  const panel = ctx.createLinearGradient(0, 0, 0, 40)
  panel.addColorStop(0, 'rgba(32, 26, 18, 0.92)')
  panel.addColorStop(1, 'rgba(20, 16, 11, 0.92)')
  ctx.fillStyle = panel
  ctx.fillRect(0, 0, 128, 40)

  // Hairline base rule — the row boundary of the sheet
  ctx.fillStyle = 'rgba(212, 169, 78, 0.4)'
  ctx.fillRect(0, 37, 128, 2)

  // Date stub, description dashes, then the bright amount block
  ctx.fillStyle = 'rgba(212, 169, 78, 0.5)'
  ctx.fillRect(8, 17, 16, 5)
  ctx.fillStyle = 'rgba(212, 169, 78, 0.7)'
  ctx.fillRect(32, 17, 38, 5)
  ctx.fillStyle = 'rgba(212, 169, 78, 0.38)'
  ctx.fillRect(74, 17, 14, 5)
  ctx.fillStyle = 'rgba(240, 212, 145, 0.95)'
  ctx.fillRect(100, 16, 20, 7)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Bake a category-chip cell: a small gold-bordered plate with a centre mark. */
function makeChipTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 24
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(24, 19, 13, 0.9)'
  ctx.fillRect(0, 0, 64, 24)
  ctx.strokeStyle = 'rgba(240, 212, 145, 0.85)'
  ctx.lineWidth = 2
  ctx.strokeRect(2, 2, 60, 20)
  ctx.fillStyle = 'rgba(240, 212, 145, 0.8)'
  ctx.fillRect(16, 10, 32, 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Bake a repeating gridline tile for the sheet's under-plane. */
function makeGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 64, 64)
  ctx.fillStyle = 'rgba(212, 169, 78, 0.5)'
  ctx.fillRect(63, 0, 1, 64) // column boundary
  ctx.fillRect(0, 63, 64, 1) // row boundary

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/* ---------------------------------------------------------------------------
 * The Evidence Engine hero scene — LEDGER VARIANT.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and dissolve into
 * cells that tile onto ONE unified glowing spreadsheet plane flowing away to
 * the right — unstructured paper in, one structured ledger out. Replaces the
 * base design's point burst ("dust"), which read as particles, not data.
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
    // darkness and the data lattice recedes into it — no visible pop-in
    scene.fog = new THREE.Fog('#0d0b09', 9, 24)

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60)
    const cameraBaseZ = isMobile ? 14 : 10.5
    camera.position.set(0, 0.9, cameraBaseZ)

    // Shift the whole stage right on desktop so the gate sits right-of-centre,
    // leaving the lower-left clear for the DOM headline
    const stage = new THREE.Group()
    stage.position.x = isMobile ? 0 : 1.1
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

    /* ----------------------- Outgoing spreadsheet plane ------------------- */
    // One unified sheet: rows are horizontal lanes, columns scroll rightwards
    // from the gate in lockstep, so the output reads as a single growing
    // ledger rather than free particles.
    const SHEET_ROWS = isMobile ? 5 : 7
    const SHEET_COLS = isMobile ? 13 : 22
    const SHEET_SPEED = 0.042 // journey fraction per second (~24 s traverse)
    const SHEET_SPAN = 13.5 // world-units of travel before a column recycles
    const ROW_GAP = 0.24

    const dotTexture = makeDotTexture()

    // Split the grid slots between plain row cells and sparse category chips;
    // the sparse pattern is deterministic so builds and reloads are stable.
    type SheetSlot = { row: number; col: number; bright: number }
    const cellSlots: SheetSlot[] = []
    const chipSlots: SheetSlot[] = []
    for (let row = 0; row < SHEET_ROWS; row++) {
      for (let col = 0; col < SHEET_COLS; col++) {
        const slot = { row, col, bright: 0.8 + ((row * 37 + col * 13) % 23) / 92 }
        if ((row * 31 + col * 7) % 11 === 4) chipSlots.push(slot)
        else cellSlots.push(slot)
      }
    }

    const cellTexture = makeCellTexture()
    const cellGeometry = new THREE.PlaneGeometry(0.56, 0.175)
    const cellMaterial = new THREE.MeshBasicMaterial({
      map: cellTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const cellMesh = new THREE.InstancedMesh(cellGeometry, cellMaterial, cellSlots.length)
    cellMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const chipTexture = makeChipTexture()
    const chipGeometry = new THREE.PlaneGeometry(0.3, 0.115)
    const chipMaterial = new THREE.MeshBasicMaterial({
      map: chipTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const chipMesh = new THREE.InstancedMesh(chipGeometry, chipMaterial, chipSlots.length)
    chipMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Seed per-instance brightness variance so the sheet shimmers like metal,
    // not a texture repeat. One designated cell carries the crimson flag glint.
    const baseColor = new THREE.Color()
    cellSlots.forEach((slot, i) => cellMesh.setColorAt(i, baseColor.setScalar(slot.bright)))
    chipSlots.forEach((slot, i) => chipMesh.setColorAt(i, baseColor.setScalar(slot.bright)))
    const FLAG_INDEX = cellSlots.findIndex((slot) => slot.row === Math.floor(SHEET_ROWS / 2) && slot.col === 9)
    const flagColor = new THREE.Color()

    // Faint gridline under-plane anchors the "one unified sheet" reading; it
    // starts just after the gate and scrolls in sync with the cells.
    const gridTexture = makeGridTexture()
    const GRID_WIDTH = SHEET_SPAN - 1.9
    const gridGeometry = new THREE.PlaneGeometry(GRID_WIDTH, SHEET_ROWS * ROW_GAP + 0.36)
    const gridMaterial = new THREE.MeshBasicMaterial({
      map: gridTexture,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    gridTexture.repeat.set(GRID_WIDTH / (SHEET_SPAN / SHEET_COLS), SHEET_ROWS)
    const gridPlane = new THREE.Mesh(gridGeometry, gridMaterial)
    gridPlane.position.set(1.9 + GRID_WIDTH / 2, 0, -0.05)

    // Group the whole sheet so it can lean back a few degrees as one object.
    // renderOrder is per-renderable (it does not cascade from the group):
    // grid under cells under chips, all beneath the gate glow sprites (3).
    gridPlane.renderOrder = 2
    cellMesh.renderOrder = 2.1
    chipMesh.renderOrder = 2.2
    const sheet = new THREE.Group()
    sheet.rotation.x = -0.1
    sheet.add(cellMesh)
    sheet.add(chipMesh)
    sheet.add(gridPlane)
    stage.add(sheet)

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
    const DUST_COUNT = isMobile ? 120 : 260
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
      opacity: 0.32,
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

    // Place one sheet slot for the current frame: emerge at the gate centre,
    // scale in, settle into the slot's row lane, then ride the plane's gentle
    // ripple. Shared by row cells and category chips so both stay in lockstep.
    const FLAG_RGB = new THREE.Color('#e0503a')
    const setSlotMatrix = (mesh: THREE.InstancedMesh, index: number, slot: SheetSlot) => {
      const progress = (slot.col / SHEET_COLS + elapsed * SHEET_SPEED) % 1
      const x = progress * SHEET_SPAN
      const enter = smoothstep(0.004, 0.05, progress)
      const settle = smoothstep(0.02, 0.16, progress)
      const gridY = (slot.row - (SHEET_ROWS - 1) / 2) * ROW_GAP

      dummy.position.set(
        x,
        gridY * settle,
        Math.sin(x * 0.5 + elapsed * 0.55 + slot.row * 0.35) * 0.045 * settle,
      )
      dummy.scale.set(enter, enter, enter)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }

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

      // -- Sheet: cells emerge from the gate, sort into rows and scroll right
      //    as one unified ledger plane; the gridlines scroll in lockstep --
      for (let i = 0; i < cellSlots.length; i++) setSlotMatrix(cellMesh, i, cellSlots[i])
      for (let i = 0; i < chipSlots.length; i++) setSlotMatrix(chipMesh, i, chipSlots[i])
      cellMesh.instanceMatrix.needsUpdate = true
      chipMesh.instanceMatrix.needsUpdate = true
      gridTexture.offset.x -= delta * SHEET_SPEED * SHEET_COLS

      // -- Flag glint: one designated cell warms to crimson mid-journey, then
      //    settles back to gold — the anomaly motif, told in a single cell --
      if (FLAG_INDEX !== -1) {
        const slot = cellSlots[FLAG_INDEX]
        const progress = (slot.col / SHEET_COLS + elapsed * SHEET_SPEED) % 1
        const glint = progress > 0.32 && progress < 0.62 ? Math.sin(((progress - 0.32) / 0.3) * Math.PI) : 0
        flagColor.setScalar(slot.bright)
        flagColor.lerp(FLAG_RGB, glint)
        cellMesh.setColorAt(FLAG_INDEX, flagColor)
        cellMesh.instanceColor!.needsUpdate = true
      }

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
      cellGeometry.dispose()
      cellMaterial.dispose()
      cellTexture.dispose()
      chipGeometry.dispose()
      chipMaterial.dispose()
      chipTexture.dispose()
      gridGeometry.dispose()
      gridMaterial.dispose()
      gridTexture.dispose()
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
