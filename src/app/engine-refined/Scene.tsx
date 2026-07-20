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
 * Ease-out-back with a gentle overshoot (~8%): records fly slightly past
 * their lattice slot and settle back — the "snap into place" that makes the
 * lock-in read as deliberate filing rather than a fade.
 */
const backOut = (t: number) => {
  const c = 1.4
  const u = t - 1
  return 1 + u * u * ((c + 1) * u + c)
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
 * The four ledger rows baked onto the record slabs. Real capability copy —
 * groceries auto-categorisation, flagged cash, a cross-currency match,
 * salary — so even the hero's data is grounded in what the product does.
 */
const SLAB_ROWS = [
  { date: '03 MAR 24', desc: 'WOOLWORTHS 3646 CHATSWOOD', amount: '−214.63', tag: 'GROCERIES' },
  { date: '07 MAR 24', desc: 'ATM WITHDRAWAL — CROWS NEST', amount: '−9,500.00', tag: 'CASH' },
  { date: '13 MAR 24', desc: 'INTL TRANSFER AUD→INR', amount: '−5,200.00', tag: 'CROSS-CCY' },
  { date: '11 MAR 24', desc: 'SALARY — MERIDIAN PTY LTD', amount: '+8,412.90', tag: 'INCOME' },
]

/**
 * Bake one structured ledger row as a slab texture: near-black plate, thin
 * gold frame, and a mono transaction line — date and description left,
 * amount right, category tag beneath the amount. At distance it reads as a
 * glowing row of data; up close it is legibly a categorised transaction.
 */
function makeRecordTexture(row: (typeof SLAB_ROWS)[number]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Slab plate: warm near-black with a faint top sheen so it reads as metal
  const plate = ctx.createLinearGradient(0, 0, 0, 64)
  plate.addColorStop(0, '#1b1610')
  plate.addColorStop(1, '#0f0c08')
  ctx.fillStyle = plate
  ctx.fillRect(0, 0, 512, 64)

  // Thin gold frame + a brighter leading tick, like an index mark
  ctx.strokeStyle = 'rgba(212, 169, 78, 0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 510, 62)
  ctx.fillStyle = '#f0d491'
  ctx.fillRect(0, 22, 5, 20)

  // Transaction line: gold mono text, amount emphasised bright on the right
  ctx.textBaseline = 'middle'
  ctx.font = '500 17px Menlo, monospace'
  ctx.fillStyle = 'rgba(228, 197, 132, 0.8)'
  ctx.fillText(row.date, 22, 24)
  ctx.fillText(row.desc, 130, 24)
  ctx.font = '600 19px Menlo, monospace'
  ctx.fillStyle = '#f0d491'
  ctx.textAlign = 'right'
  ctx.fillText(row.amount, 492, 24)
  // Category tag: the categorisation promise, stamped under the amount
  ctx.font = '500 12px Menlo, monospace'
  ctx.fillStyle = 'rgba(212, 169, 78, 0.6)'
  ctx.fillText(row.tag, 492, 48)
  ctx.textAlign = 'left'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Small soft dot texture for the ambient gold dust motes. */
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
 * The Evidence Engine hero scene.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and re-emerge on the
 * right as glowing ledger-row records that lock into an ordered, drifting
 * band — unstructured paper in, structured evidence out. (This variant
 * replaces the base design's point burst: each record is legibly a
 * categorised transaction, so the transformation needs no interpretation.
 * Keep the composition sparse — a few large records, a thin document stream,
 * light dust — so the hero reads calm rather than busy.)
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
    // Keep the stream sparse: a dozen sheets at most, so the eye can follow
    // individual documents rather than reading the flow as clutter.
    const DOC_COUNT = isMobile ? 7 : 12
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

    /* ------------------------ Outgoing record lattice --------------------- */
    // A handful of legible ledger-row slabs replaces the base design's point
    // cloud. Keep the count deliberately low — a single depth plane of large,
    // readable records — so the output reads as a few filed transactions
    // rather than a busy swarm.
    const SLAB_COUNT = isMobile ? 5 : 9
    const LATTICE_ROWS = 3
    const LATTICE_LAYERS = 1
    const SLAB_SCALE = isMobile ? 0.9 : 1.15

    // One shared row geometry (8:1, matching the 512x64 texture) and one
    // instanced mesh per baked row artwork — four draw calls in total.
    const slabGeometry = new THREE.PlaneGeometry(2.2, 0.275)
    const slabTextures = SLAB_ROWS.map(makeRecordTexture)
    const slabMaterials = slabTextures.map(
      (texture) =>
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.96,
          side: THREE.DoubleSide,
        }),
    )
    // Allocate each mesh EXACTLY the number of instances the round-robin
    // assignment below will write. A uniform ceil() allocation would leave
    // never-written instances holding their default identity matrix — a
    // stray full-size slab frozen at the gate centre.
    const slabsForMaterial = (index: number) =>
      Math.max(0, Math.floor((SLAB_COUNT - index - 1) / slabMaterials.length) + 1)
    const slabMeshes = slabMaterials.map((material, index) => {
      const mesh = new THREE.InstancedMesh(slabGeometry, material, slabsForMaterial(index))
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.renderOrder = 2
      stage.add(mesh)
      return mesh
    })

    const dotTexture = makeDotTexture()

    // Each slab is born at the gate, drifts with a gentle scatter, then locks —
    // with a small overshoot — into its lattice slot. Space the phases evenly
    // and keep speed variance small so the outgoing records hold a deliberate,
    // near-constant spacing instead of bunching at random.
    const slabParams = Array.from({ length: SLAB_COUNT }, (_, i) => ({
      phase: i / SLAB_COUNT,
      speed: 0.045 + Math.random() * 0.006,
      scatterY: (Math.random() - 0.5) * 1.0,
      scatterZ: (Math.random() - 0.5) * 0.5,
      gridY: ((i % LATTICE_ROWS) - (LATTICE_ROWS - 1) / 2) * 0.62,
      gridZ: ((Math.floor(i / LATTICE_ROWS) % LATTICE_LAYERS) - (LATTICE_LAYERS - 1) / 2) * 0.62,
      tilt: (Math.random() - 0.5) * 0.5,
      shimmer: Math.random() * Math.PI * 2,
    }))

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
    // Thin the atmosphere to match the calmer composition — enough motes to
    // keep the air alive, not enough to compete with the records.
    const DUST_COUNT = isMobile ? 60 : 110
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
      opacity: 0.24,
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

      // -- Record slabs: born at the gate, overshoot-lock into the lattice --
      for (let i = 0; i < SLAB_COUNT; i++) {
        const p = slabParams[i]
        const progress = (p.phase + elapsed * p.speed) % 1
        // Birth envelope: the slab scales up in the gate's glow, inheriting
        // the document stream's pace so it reads as the SAME object transformed
        const birth = smoothstep(0, 0.05, progress)
        // Lock-in: raw strength for rotation, overshoot curve for position
        const lockRaw = smoothstep(0.04, 0.3, progress)
        const lock = backOut(lockRaw)

        dummy.position.set(
          progress * 13.5,
          lerp(p.scatterY, p.gridY + Math.sin(elapsed * 1.6 + p.shimmer) * 0.02, lock),
          lerp(p.scatterZ, p.gridZ + Math.cos(elapsed * 1.3 + p.shimmer) * 0.02, lock),
        )
        const scale = SLAB_SCALE * Math.max(birth, 0.001)
        dummy.scale.set(scale, scale, scale)
        // Slight flight tilt that settles flat as the record files itself
        dummy.rotation.set(0, (1 - lockRaw) * p.tilt * 0.6, (1 - lockRaw) * p.tilt)
        dummy.updateMatrix()
        slabMeshes[i % slabMeshes.length].setMatrixAt(Math.floor(i / slabMeshes.length), dummy.matrix)
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
