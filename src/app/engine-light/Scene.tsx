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
 * Draw a miniature bank statement onto a canvas and wrap it as a texture.
 * Light-mode edition: the paper is a touch deeper than the parchment page
 * field and carries darker ink rules plus a baked edge stroke, so each
 * document reads crisply against the light background without any lighting.
 */
function makePaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 168
  const ctx = canvas.getContext('2d')!

  // Soft top-lit paper gradient, deeper than the page parchment
  const paper = ctx.createLinearGradient(0, 0, 0, 168)
  paper.addColorStop(0, '#f0e8d3')
  paper.addColorStop(1, '#dccfae')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, 128, 168)

  // Bank header block
  ctx.fillStyle = 'rgba(42, 35, 24, 0.72)'
  ctx.fillRect(12, 15, 64, 6)

  // Ruled statement lines — alternate long and short rows so the texture
  // reads as tabular data even at a distance
  ctx.fillStyle = 'rgba(42, 35, 24, 0.32)'
  for (let y = 36; y < 148; y += 9) {
    const isShortRow = y % 18 === 0
    ctx.fillRect(12, y, isShortRow ? 72 : 104, 2.5)
  }

  // Right-hand amount column, slightly darker, suggesting debit/credit figures
  ctx.fillStyle = 'rgba(42, 35, 24, 0.46)'
  for (let y = 36; y < 148; y += 18) {
    ctx.fillRect(96, y, 20, 2.5)
  }

  // Baked edge stroke: gives the sheet a definite silhouette on parchment
  ctx.strokeStyle = 'rgba(104, 86, 50, 0.5)'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, 125, 165)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Radial bronze glow for the gate halo sprites. On a light field an additive
 * glow washes out to nothing, so this texture is saturated bronze meant for
 * NORMAL blending — warm pigment over parchment rather than added light.
 */
function makeBronzeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(154, 113, 32, 0.6)')
  gradient.addColorStop(0.25, 'rgba(160, 124, 44, 0.26)')
  gradient.addColorStop(0.6, 'rgba(160, 124, 44, 0.08)')
  gradient.addColorStop(1, 'rgba(160, 124, 44, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

/**
 * One spreadsheet cell: parchment fill, bronze gridline border, and dark ink
 * marks (a description line plus a right-aligned amount). Tiled by every
 * instance in the plane, tinted per-instance via instanceColor.
 */
function makeCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 72
  const ctx = canvas.getContext('2d')!

  // Cell paper, marginally lighter than the page so the plane glows softly
  ctx.fillStyle = '#faf5e8'
  ctx.fillRect(0, 0, 128, 72)

  // Bronze gridline border — the "spreadsheet" is drawn by its own cells
  ctx.strokeStyle = 'rgba(138, 106, 36, 0.65)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 126, 70)

  // Ink data marks: description stub + right-aligned amount figure
  ctx.fillStyle = 'rgba(42, 35, 24, 0.5)'
  ctx.fillRect(10, 30, 56, 5)
  ctx.fillStyle = 'rgba(42, 35, 24, 0.68)'
  ctx.fillRect(88, 30, 30, 5)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------------------------------------------------------------------
 * The Evidence Engine hero scene — light edition.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a bronze scanning gate at the origin, and tile out the other side
 * as cells on ONE unified spreadsheet plane — a printed ledger sheet growing
 * out of the transformation. Unstructured paper in, one structured sheet out.
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
    // Match the CSS parchment field exactly so the canvas edge is invisible
    scene.background = new THREE.Color('#f4efe4')
    // Fog dissolves both ends of the flow into the parchment — documents
    // materialise from light rather than darkness, no visible pop-in
    scene.fog = new THREE.Fog('#f4efe4', 9, 24)

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
      opacity: 0.98,
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

    /* --------------------- Outgoing spreadsheet plane --------------------- */
    // Cells stream out of the gate and tile onto one receding sheet: fixed
    // rows across z, continuous flow along +x, gently tilted toward camera.
    const CELL_ROWS = isMobile ? 6 : 9
    const CELL_COUNT = isMobile ? 102 : 243
    const CELL_W = 0.52
    const CELL_H = 0.3
    const PLANE_Y = -0.55 // sheet sits just below the gate centre
    const PLANE_TILT = -Math.PI / 2 + 0.46 // mostly flat, face raised to camera

    const cellTexture = makeCellTexture()
    const cellGeometry = new THREE.PlaneGeometry(CELL_W, CELL_H)
    const cellMaterial = new THREE.MeshBasicMaterial({
      map: cellTexture,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
    })
    const cells = new THREE.InstancedMesh(cellGeometry, cellMaterial, CELL_COUNT)
    cells.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    stage.add(cells)

    // Stagger phases row-by-row so the sheet grows as a coherent front rather
    // than a random sprinkle; small jitter keeps it organic
    const cellParams = Array.from({ length: CELL_COUNT }, (_, i) => ({
      phase: (Math.floor(i / CELL_ROWS) / (CELL_COUNT / CELL_ROWS) + Math.random() * 0.012) % 1,
      speed: 0.052, // uniform pace — one sheet, one motion
      rowZ: ((i % CELL_ROWS) - (CELL_ROWS - 1) / 2) * (CELL_H * 1.16),
    }))

    // One cell glints crimson as it lands — the flagged transaction — then
    // settles back to parchment as it recedes into the sheet
    const FLAG_INDEX = Math.floor(CELL_COUNT * 0.37)
    const whiteColor = new THREE.Color('#ffffff')
    const crimsonColor = new THREE.Color('#b3231f')
    const flagColor = new THREE.Color()
    for (let i = 0; i < CELL_COUNT; i++) cells.setColorAt(i, whiteColor)
    cells.instanceColor!.needsUpdate = true

    /* ----------------------------- The gate ------------------------------ */
    const gate = new THREE.Group()
    stage.add(gate)

    // Saturated bronze reads as metal against parchment; the dark ring gives
    // the gate the weight that additive glow provided on obsidian
    const ringOuterGeometry = new THREE.TorusGeometry(1.75, 0.02, 12, 120)
    const ringOuterMaterial = new THREE.MeshBasicMaterial({ color: '#8a6a24' })
    const ringOuter = new THREE.Mesh(ringOuterGeometry, ringOuterMaterial)
    ringOuter.rotation.y = Math.PI / 2
    gate.add(ringOuter)

    const ringInnerGeometry = new THREE.TorusGeometry(1.58, 0.009, 8, 100)
    const ringInnerMaterial = new THREE.MeshBasicMaterial({ color: '#a07c2c', transparent: true, opacity: 0.55 })
    const ringInner = new THREE.Mesh(ringInnerGeometry, ringInnerMaterial)
    ringInner.rotation.y = Math.PI / 2
    gate.add(ringInner)

    // Two NORMAL-blended bronze sprites stand in for the halo: pigment on
    // parchment instead of added light, which would wash out on a light field
    const glowTexture = makeBronzeGlowTexture()
    const haloMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    })
    const halo = new THREE.Sprite(haloMaterial)
    halo.scale.setScalar(6.6)
    halo.renderOrder = 3
    gate.add(halo)

    const coreMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    })
    const core = new THREE.Sprite(coreMaterial)
    core.scale.setScalar(2.2)
    core.renderOrder = 3
    gate.add(core)

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

      // -- Cells: emerge at the gate and tile onto the receding sheet --
      for (let i = 0; i < CELL_COUNT; i++) {
        const p = cellParams[i]
        const progress = (p.phase + elapsed * p.speed) % 1
        // Arrival envelope: the cell scales up in the gate's mouth, then holds
        const arrive = smoothstep(0, 0.055, progress)
        // A whisper of ripple keeps the sheet alive without breaking its plane
        const ripple = Math.sin(progress * 9 + p.rowZ * 2.1 + elapsed * 0.6) * 0.018

        dummy.position.set(progress * 13.5, PLANE_Y + ripple, p.rowZ)
        dummy.scale.setScalar(arrive)
        dummy.rotation.set(PLANE_TILT, 0, 0)
        dummy.updateMatrix()
        cells.setMatrixAt(i, dummy.matrix)

        // The flagged cell lands crimson and settles to parchment mid-sheet
        if (i === FLAG_INDEX) {
          flagColor.copy(crimsonColor).lerp(whiteColor, smoothstep(0.1, 0.42, progress))
          cells.setColorAt(i, flagColor)
        }
      }
      cells.instanceMatrix.needsUpdate = true
      cells.instanceColor!.needsUpdate = true

      // -- Gate: breathe gently so the metal feels alive, never flashy --
      const pulse = 1 + Math.sin(elapsed * 1.6) * 0.012
      gate.scale.setScalar(pulse)
      haloMaterial.opacity = 0.36 + Math.sin(elapsed * 1.6) * 0.07

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
      glowTexture.dispose()
      ringOuterGeometry.dispose()
      ringOuterMaterial.dispose()
      ringInnerGeometry.dispose()
      ringInnerMaterial.dispose()
      haloMaterial.dispose()
      coreMaterial.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="eng-scene-mount" aria-hidden="true" />
}
