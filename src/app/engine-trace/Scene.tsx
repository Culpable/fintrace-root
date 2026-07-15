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

/**
 * Bake the evidence-card artwork: a dark plate with a gold border, a mono
 * citation code, a verification line and a few faint data rules — what a
 * statement BECOMES once the engine has read it. One shared texture keeps
 * every card on a single instanced draw call.
 */
function makeCardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  // Warm obsidian plate with a faint top sheen so the card reads as metal
  const plate = ctx.createLinearGradient(0, 0, 0, 160)
  plate.addColorStop(0, '#221c12')
  plate.addColorStop(0.18, '#171310')
  plate.addColorStop(1, '#12100b')
  ctx.fillStyle = plate
  ctx.fillRect(0, 0, 256, 160)

  // Gold frame: outer edge plus an engraved inner hairline
  ctx.strokeStyle = 'rgba(212, 169, 78, 0.95)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, 252, 156)
  ctx.strokeStyle = 'rgba(212, 169, 78, 0.28)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(10, 10, 236, 140)

  // Citation code — the traceability promise in miniature
  ctx.fillStyle = '#f0d491'
  ctx.font = '600 26px "Courier New", monospace'
  ctx.fillText('FT-0114', 24, 48)

  // Source + verification line
  ctx.fillStyle = 'rgba(163, 154, 141, 0.85)'
  ctx.font = '400 15px "Courier New", monospace'
  ctx.fillText('p. 214 · VERIFIED', 24, 74)

  // Faint structured-data rules with a gold amount column
  ctx.fillStyle = 'rgba(163, 154, 141, 0.30)'
  ctx.fillRect(24, 96, 128, 3)
  ctx.fillRect(24, 114, 104, 3)
  ctx.fillRect(24, 132, 118, 3)
  ctx.fillStyle = 'rgba(212, 169, 78, 0.7)'
  ctx.fillRect(196, 96, 36, 3)
  ctx.fillRect(196, 114, 36, 3)
  ctx.fillRect(196, 132, 36, 3)

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
 * The Evidence Engine hero scene — TRACE variant.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and re-emerge on the
 * right as EVIDENCE CARDS — gold-edged citation plates that hold a disciplined
 * queue, joined card-to-card by fine gold filaments. One filament runs in
 * restrained crimson: a flagged connection, the tracing identity in miniature.
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
    // darkness and the card queue recedes into it — no visible pop-in
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

    /* ------------------------ Outgoing evidence cards --------------------- */
    // Cards hold a uniform speed and evenly-spaced phases, so the outgoing
    // queue keeps constant spacing — disciplined evidence, not scattered dust.
    const CARD_COUNT = isMobile ? 9 : 18
    const CARD_SPEED = 0.05
    const cardTexture = makeCardTexture()
    const cardGeometry = new THREE.PlaneGeometry(0.86, 0.54)
    const cardMaterial = new THREE.MeshBasicMaterial({
      map: cardTexture,
      transparent: true,
      opacity: 0.97,
      side: THREE.DoubleSide,
    })
    const cards = new THREE.InstancedMesh(cardGeometry, cardMaterial, CARD_COUNT)
    cards.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    stage.add(cards)

    // Fan lanes: a gentle arc in y plus three staggered depth lanes, so the
    // queue reads as a fanned hand of cards receding to the right
    const cardParams = Array.from({ length: CARD_COUNT }, (_, i) => ({
      phase: i / CARD_COUNT,
      laneY: -0.1 + Math.sin(i * 0.85) * 0.32,
      laneZ: ((i % 3) - 1) * 0.5,
      tilt: Math.sin(i * 2.3) * 0.07,
      bob: i * 0.7,
    }))
    // Scratch buffer holding this frame's card positions for the filaments
    const cardPos = new Float32Array(CARD_COUNT * 3)

    /* ------------------------ Card-to-card filaments ---------------------- */
    // The flagged pair renders in restrained crimson on its own segment so the
    // gold material never has to switch colour mid-draw.
    const FLAG_SEGMENT = isMobile ? 4 : 7
    const goldSegCount = CARD_COUNT - 1
    const filamentPositions = new Float32Array(goldSegCount * 2 * 3)
    const filamentGeometry = new THREE.BufferGeometry()
    const filamentAttr = new THREE.BufferAttribute(filamentPositions, 3)
    filamentAttr.setUsage(THREE.DynamicDrawUsage)
    filamentGeometry.setAttribute('position', filamentAttr)
    const filamentMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#d4a94e'),
      transparent: true,
      opacity: 0.32,
    })
    const filaments = new THREE.LineSegments(filamentGeometry, filamentMaterial)
    filaments.frustumCulled = false
    stage.add(filaments)

    const flagPositions = new Float32Array(2 * 3)
    const flagGeometry = new THREE.BufferGeometry()
    const flagAttr = new THREE.BufferAttribute(flagPositions, 3)
    flagAttr.setUsage(THREE.DynamicDrawUsage)
    flagGeometry.setAttribute('position', flagAttr)
    const flagMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#b3231f'),
      transparent: true,
      opacity: 0.55,
    })
    const flagFilament = new THREE.LineSegments(flagGeometry, flagMaterial)
    flagFilament.frustumCulled = false
    stage.add(flagFilament)

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
    // Atmospheric motes only — the post-gate output is cards, not particles.
    const DUST_COUNT = isMobile ? 120 : 260
    const dotTexture = makeDotTexture()
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
      // Clamp delta into [0, 0.05]: the ceiling stops hidden-tab resumes from
      // fast-forwarding the scene; the floor guards against a first rAF
      // timestamp that precedes the clock's start (a real Chrome quirk)
      const delta = Math.min(Math.max(clock.getDelta(), 0), 0.05)
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

      // -- Cards: emerge through the gate, settle into the fanned queue --
      for (let i = 0; i < CARD_COUNT; i++) {
        const p = cardParams[i]
        const progress = (p.phase + elapsed * CARD_SPEED) % 1
        const emerge = smoothstep(0, 0.055, progress) // grow out of the gate
        const settle = smoothstep(0.05, 0.24, progress) // fan from centre to lane

        const x = progress * 13.5
        const y = lerp(0, p.laneY, settle) + Math.sin(elapsed * 1.3 + p.bob) * 0.02 * settle
        const z = lerp(0, p.laneZ, settle)

        dummy.position.set(x, y, z)
        const scale = Math.max(emerge, 0.001)
        dummy.scale.set(scale, scale, scale)
        // Cards settle upright with a small individual tilt — filed, not thrown
        dummy.rotation.set(0, 0, p.tilt * settle)
        dummy.updateMatrix()
        cards.setMatrixAt(i, dummy.matrix)

        cardPos[i * 3] = x
        cardPos[i * 3 + 1] = y
        cardPos[i * 3 + 2] = z
      }
      cards.instanceMatrix.needsUpdate = true

      // -- Filaments: join each card to the next, skipping the wrap-around --
      // A segment collapses behind the fog when its pair spans the queue's
      // seam or when either card is still inside the gate.
      let flagDrawn = false
      for (let s = 0; s < goldSegCount; s++) {
        const ax = cardPos[s * 3]
        const bx = cardPos[(s + 1) * 3]
        const visible = ax > 0.9 && bx > 0.9 && Math.abs(ax - bx) < 2.2

        const isFlag = s === FLAG_SEGMENT
        const target = isFlag ? flagPositions : filamentPositions
        const offset = isFlag ? 0 : s * 6
        if (visible) {
          target[offset] = cardPos[s * 3]
          target[offset + 1] = cardPos[s * 3 + 1]
          target[offset + 2] = cardPos[s * 3 + 2]
          target[offset + 3] = cardPos[(s + 1) * 3]
          target[offset + 4] = cardPos[(s + 1) * 3 + 1]
          target[offset + 5] = cardPos[(s + 1) * 3 + 2]
          if (isFlag) flagDrawn = true
        } else {
          target[offset] = target[offset + 3] = -30
          target[offset + 1] = target[offset + 4] = 0
          target[offset + 2] = target[offset + 5] = 0
        }
        // The gold buffer keeps a slot for the flagged segment; collapse it so
        // the crimson line is the only one drawn between that pair
        if (isFlag) {
          filamentPositions[s * 6] = filamentPositions[s * 6 + 3] = -30
          filamentPositions[s * 6 + 1] = filamentPositions[s * 6 + 4] = 0
          filamentPositions[s * 6 + 2] = filamentPositions[s * 6 + 5] = 0
        }
      }
      if (!flagDrawn) {
        flagPositions[0] = flagPositions[3] = -30
        flagPositions[1] = flagPositions[4] = 0
        flagPositions[2] = flagPositions[5] = 0
      }
      filamentAttr.needsUpdate = true
      flagAttr.needsUpdate = true

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
      cardGeometry.dispose()
      cardMaterial.dispose()
      cardTexture.dispose()
      filamentGeometry.dispose()
      filamentMaterial.dispose()
      flagGeometry.dispose()
      flagMaterial.dispose()
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
