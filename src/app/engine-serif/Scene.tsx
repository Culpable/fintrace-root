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

/**
 * Bake one glowing ledger-row slab: a dark plate with a fine gold border and
 * a single mono statement line (date | description | amount) in gold. Three
 * variants exist so the lattice reads as varied records rather than one row
 * repeated; baking keeps the slabs unlit and costs one texture per variant.
 */
function makeSlabTexture(row: { date: string; desc: string; amount: string }): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 80
  const ctx = canvas.getContext('2d')!

  // Obsidian plate, one shade above the page ground so edges stay visible
  ctx.fillStyle = '#14110c'
  ctx.fillRect(0, 0, 640, 80)

  // Fine engraved gold frame
  ctx.strokeStyle = 'rgba(138, 106, 43, 0.95)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 638, 78)

  // Warm under-glow along the base of the plate, like light off the gate
  const glow = ctx.createLinearGradient(0, 46, 0, 80)
  glow.addColorStop(0, 'rgba(212, 169, 78, 0)')
  glow.addColorStop(1, 'rgba(212, 169, 78, 0.14)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 46, 640, 34)

  // Statement line: date (dim) | description (mid) | amount (bright)
  ctx.textBaseline = 'middle'
  ctx.font = '500 24px "Courier New", monospace'
  ctx.fillStyle = 'rgba(196, 158, 92, 0.72)'
  ctx.fillText(row.date, 26, 42)
  ctx.fillStyle = 'rgba(226, 193, 121, 0.9)'
  ctx.fillText(row.desc, 168, 42)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(240, 212, 145, 1)'
  ctx.fillText(row.amount, 614, 42)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** The three record rows baked onto slabs — real capability set in miniature:
 *  auto-categorised spend, a flagged cash withdrawal, a cross-currency match. */
const SLAB_ROWS = [
  { date: '03 MAR 24', desc: 'WOOLWORTHS 1224 · GROCERIES', amount: '−214.63' },
  { date: '07 MAR 24', desc: 'ATM WITHDRAWAL · FLAGGED', amount: '−9,500.00' },
  { date: '13 MAR 24', desc: 'WISE AUD→INR · MATCHED', amount: '−5,200.00' },
]

/** Ease-out with a mild overshoot — slabs glide past their slot and settle. */
const easeOutBack = (t: number) => {
  const c1 = 1.2
  const c3 = c1 + 1
  const u = t - 1
  return 1 + c3 * u * u * u + c1 * u * u
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
 * The Evidence Engine hero scene — serif variant.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and re-emerge on the
 * right as glowing ledger-row slabs that lock into an ordered, slowly
 * drifting lattice — a spreadsheet assembling in space. Unstructured paper
 * in, structured records out.
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

    /* --------------------- Outgoing ledger-row lattice ------------------- */
    // Slabs are grouped by baked texture (three record variants). Lanes form
    // a fixed row/layer grid; phases inside each lane are EVENLY spaced so the
    // outflow reads as an ordered, drifting spreadsheet rather than scatter.
    const LATTICE_ROWS = isMobile ? 3 : 4
    const LATTICE_LAYERS = 2
    const LANE_SLOTS = isMobile ? 2 : 3
    const SLAB_COUNT = LATTICE_ROWS * LATTICE_LAYERS * LANE_SLOTS
    const SLABS_PER_GROUP = Math.ceil(SLAB_COUNT / SLAB_ROWS.length)

    const dotTexture = makeDotTexture()
    const slabGeometry = new THREE.PlaneGeometry(2.2, 0.28)
    const slabTextures = SLAB_ROWS.map(makeSlabTexture)
    const slabMaterials = slabTextures.map(
      (texture) =>
        new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        }),
    )
    const slabMeshes = slabMaterials.map((material) => {
      const mesh = new THREE.InstancedMesh(slabGeometry, material, SLABS_PER_GROUP)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.renderOrder = 2
      stage.add(mesh)
      return mesh
    })

    // Per-slab flight parameters, indexed globally then split across the
    // texture groups. Lane geometry is deterministic; only the emergence
    // scatter and tumble vary, so the lattice always resolves to order.
    const slabParams = Array.from({ length: SLAB_COUNT }, (_, i) => {
      const row = i % LATTICE_ROWS
      const layer = Math.floor(i / LATTICE_ROWS) % LATTICE_LAYERS
      const slot = Math.floor(i / (LATTICE_ROWS * LATTICE_LAYERS))
      return {
        // Even in-lane spacing plus a per-lane fractional offset so columns
        // interleave instead of forming a single vertical wall of slabs
        phase: (slot / LANE_SLOTS + row * 0.083 + layer * 0.171) % 1,
        // Near-uniform pace: lanes stay ordered, long-run drift stays alive
        speed: 0.05 + row * 0.0016 + layer * 0.0009,
        gridY: (row - (LATTICE_ROWS - 1) / 2) * 0.46,
        gridZ: (layer - (LATTICE_LAYERS - 1) / 2) * 0.72,
        scatterY: (Math.random() - 0.5) * 1.1,
        scatterZ: (Math.random() - 0.5) * 0.9,
        tumble: (Math.random() - 0.5) * 0.9,
        shimmer: Math.random() * Math.PI * 2,
      }
    })

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

      // -- Record slabs: emerge from the gate at document pace, decelerate,
      //    and lock into the drifting lattice with a slight overshoot --
      for (let i = 0; i < SLAB_COUNT; i++) {
        const p = slabParams[i]
        const progress = (p.phase + elapsed * p.speed) % 1
        // Emergence envelope: slabs scale up in the gate's glow, so the
        // recycle teleport back to x=0 is always invisible
        const emerge = smoothstep(0, 0.05, progress)
        // Deceleration: fast off the gate (inheriting the document's pace),
        // easing off as the record joins the lattice
        const x = 13.6 * (1 - Math.pow(1 - progress, 1.6))
        // Lock-in overshoots its slot slightly, then settles — the "snap"
        const lock = easeOutBack(smoothstep(0.04, 0.3, progress))

        dummy.position.set(
          x,
          lerp(p.scatterY, p.gridY, lock) + Math.sin(elapsed * 1.8 + p.shimmer) * 0.02,
          lerp(p.scatterZ, p.gridZ, lock) + Math.cos(elapsed * 1.5 + p.shimmer) * 0.02,
        )
        // Tumble out of the gate, settle flat as the lattice claims the slab
        dummy.rotation.set(0, Math.max(0, 1 - lock) * p.tumble, 0)
        const scale = Math.max(emerge, 0.001)
        dummy.scale.set(scale, scale, scale)
        dummy.updateMatrix()
        slabMeshes[i % SLAB_ROWS.length].setMatrixAt(Math.floor(i / SLAB_ROWS.length), dummy.matrix)
      }
      for (const mesh of slabMeshes) mesh.instanceMatrix.needsUpdate = true

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
      slabGeometry.dispose()
      for (const material of slabMaterials) material.dispose()
      for (const texture of slabTextures) texture.dispose()
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
