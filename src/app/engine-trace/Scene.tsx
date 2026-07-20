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
 * Ease-out-back with a gentle overshoot (~8%): cards fly slightly past their
 * network slot and settle back — the dock reads as a deliberate snap into
 * place rather than a fade.
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
  ctx.fillText('FT-0943', 24, 48)

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
 * right as EVIDENCE CARDS that dock, one by one, into a branching account
 * network — a root, two branches, then leaves — joined border-to-border by
 * fine gold connectors. One connector runs in restrained crimson: a flagged
 * hop, the tracing identity in miniature. The finished network dwells while
 * bright motes run its edges, then releases into the fog and rebuilds.
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
    // leaving the lower-left clear for the DOM headline. On mobile shift it
    // LEFT instead: the gate hugs the left edge, widening the narrow output
    // band so the whole docked network stays inside the frame.
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

    /* ------------------------ Docked evidence network --------------------- */
    // Cards no longer file past in a queue: each one emerges through the gate,
    // flies a gentle arc to a FIXED slot and docks, assembling a branching
    // account network — root, branches, leaves — that reads as a trace rather
    // than a string of cards.
    // Slot placement is frustum-bound: with fov 34° and the camera's sway and
    // pointer parallax, stage-local x must stay under ≈3.1 + 0.49·(−z) on
    // desktop and ≈2.1 on the shifted mobile stage — so the tree spreads
    // VERTICALLY through the generous y range rather than marching off-frame.
    const SLOTS: [number, number, number][] = isMobile
      ? [
          [0.4, 0, 0], // root
          [1.1, 0.85, -0.3], // branch 1
          [1.1, -0.85, 0.3], // branch 2
          [1.95, 1.6, -0.5], // leaf 1
          [1.95, -1.6, 0.5], // leaf 2 — flagged
        ]
      : [
          [1.7, 0, 0], // root
          [2.45, 1.05, -0.4], // branch 1
          [2.45, -1.05, 0.35], // branch 2
          [3.25, 1.8, -0.6], // leaf 1
          [3.45, 0.62, -0.9], // leaf 2
          [3.15, -0.62, -0.25], // leaf 3
          [3.28, -1.8, -0.5], // leaf 4 — flagged
        ]
    // Parent → child pairs by slot index. The LAST pair is the flagged hop,
    // drawn crimson on its own segment so the gold material never has to
    // switch colour mid-draw.
    const EDGES: [number, number][] = isMobile
      ? [
          [0, 1],
          [1, 3],
          [0, 2],
          [2, 4],
        ]
      : [
          [0, 1],
          [1, 3],
          [1, 4],
          [0, 2],
          [2, 5],
          [2, 6],
        ]
    const FLAG_EDGE = EDGES.length - 1
    const FLAG_CARD = EDGES[FLAG_EDGE][1]

    const CARD_COUNT = SLOTS.length
    const CARD_W = 0.86 // plane width — connector anchors sit at ±CARD_W/2
    // Docked card scale: slightly reduced so the tighter, taller tree keeps
    // clear air between ranks (network read beats per-card legibility)
    const CARD_SCALE = isMobile ? 0.6 : 0.92
    const cardTexture = makeCardTexture()
    const cardGeometry = new THREE.PlaneGeometry(CARD_W, 0.54)
    const cardMaterial = new THREE.MeshBasicMaterial({
      map: cardTexture,
      transparent: true,
      opacity: 0.97,
      side: THREE.DoubleSide,
    })
    const cards = new THREE.InstancedMesh(cardGeometry, cardMaterial, CARD_COUNT)
    cards.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    stage.add(cards)

    // Seed instance colours so the flagged leaf can warm to crimson at dwell
    const WHITE = new THREE.Color(1, 1, 1)
    const FLAG_RGB = new THREE.Color('#b3231f')
    for (let i = 0; i < CARD_COUNT; i++) cards.setColorAt(i, WHITE)
    const flagTint = new THREE.Color()

    // Assembly timetable (seconds within the cycle). Everything below is a
    // pure function of the looping clock, so pause/resume never desyncs.
    const EMERGE_GAP = 1.6 // one card leaves the gate every 1.6 s
    const FLIGHT_DUR = 2.2 // gate → slot flight time
    const DRAW_DUR = 0.6 // connector draw-in once both endpoint cards dock
    const CYCLE = 26 // full build → dwell → depart loop
    const DEPART_START = 22.2 // the finished network releases into the fog
    const DEPART_DUR = 3.2
    const dockAt = (i: number) => i * EMERGE_GAP + FLIGHT_DUR
    const NETWORK_DONE = dockAt(CARD_COUNT - 1) + DRAW_DUR
    // Per-card flight character: arc lift and a tilt that settles flat on dock
    const cardChar = SLOTS.map((_, i) => ({
      lift: 0.3 + Math.sin(i * 3.7) * 0.12,
      tilt: Math.sin(i * 2.3) * 0.35,
    }))
    // Scratch buffer holding this frame's card positions for the connectors
    const cardPos = new Float32Array(CARD_COUNT * 3)

    /* --------------------------- Edge connectors -------------------------- */
    const goldSegCount = EDGES.length - 1
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

    /* ------------------------- Travelling pulses -------------------------- */
    // While the finished network dwells, small bright motes run parent → child
    // along the connectors — money moving through the traced accounts.
    const PULSE_COUNT = 3
    const PULSE_PERIOD = 1.9 // seconds per edge run
    const dotTexture = makeDotTexture()
    const pulseMaterial = new THREE.SpriteMaterial({
      map: dotTexture,
      color: new THREE.Color('#f0d491'),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const pulses = Array.from({ length: PULSE_COUNT }, () => {
      const sprite = new THREE.Sprite(pulseMaterial)
      sprite.scale.setScalar(0.001)
      sprite.renderOrder = 2
      stage.add(sprite)
      return sprite
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
    // Atmospheric motes only — the post-gate output is cards, not particles.
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

      // -- Cards: emerge one at a time, fly an arc and dock into their slot --
      const t = elapsed % CYCLE
      // Departure envelope: the finished network drifts right and dissolves
      // into the fog before the cycle rebuilds from a fresh root.
      const depart = smoothstep(DEPART_START, DEPART_START + DEPART_DUR, t)
      const driftX = depart * 4.5
      cardMaterial.opacity = 0.97 * (1 - depart)
      filamentMaterial.opacity = 0.32 * (1 - depart)
      flagMaterial.opacity = 0.55 * (1 - depart)

      for (let i = 0; i < CARD_COUNT; i++) {
        const slot = SLOTS[i]
        const char = cardChar[i]
        const born = i * EMERGE_GAP
        // Flight progress with a gentle overshoot so the dock reads as a snap
        const u = smoothstep(born, born + FLIGHT_DUR, t)
        const eased = backOut(u)
        const docked = smoothstep(born + FLIGHT_DUR * 0.9, born + FLIGHT_DUR, t)

        // A gentle bob plus a slow group sway keep the docked network alive
        const bob = (Math.sin(elapsed * 1.3 + i * 2.1) * 0.018 + Math.sin(elapsed * 0.5) * 0.03) * docked

        const x = slot[0] * eased + driftX
        const y = slot[1] * eased + Math.sin(u * Math.PI) * char.lift + bob
        const z = slot[2] * eased

        dummy.position.set(x, y, z)
        const scale = Math.max(smoothstep(born, born + 0.45, t) * CARD_SCALE, 0.001)
        dummy.scale.set(scale, scale, scale)
        // Tilt in flight, dead level once docked so edge anchors stay exact
        dummy.rotation.set(0, 0, (1 - u) * char.tilt)
        dummy.updateMatrix()
        cards.setMatrixAt(i, dummy.matrix)

        cardPos[i * 3] = x
        cardPos[i * 3 + 1] = y
        cardPos[i * 3 + 2] = z
      }
      cards.instanceMatrix.needsUpdate = true

      // -- Flagged leaf: warm towards crimson while the network dwells --
      const dwell = smoothstep(NETWORK_DONE, NETWORK_DONE + 1, t) * (1 - depart)
      flagTint.copy(WHITE).lerp(FLAG_RGB, dwell * (0.35 + Math.sin(elapsed * 2.2) * 0.15))
      cards.setColorAt(FLAG_CARD, flagTint)
      cards.instanceColor!.needsUpdate = true

      // -- Connectors: draw parent → child once both endpoint cards dock --
      // Anchors sit on the card BORDERS (right edge of the parent, left edge
      // of the child) at the docked scale, so lines join the plates like a
      // schematic and never thread through a card face.
      const HALF_W = (CARD_W / 2) * CARD_SCALE
      for (let s = 0; s < EDGES.length; s++) {
        const [a, b] = EDGES[s]
        const drawStart = Math.max(dockAt(a), dockAt(b))
        const draw = smoothstep(drawStart, drawStart + DRAW_DUR, t)

        const isFlag = s === FLAG_EDGE
        const target = isFlag ? flagPositions : filamentPositions
        const offset = isFlag ? 0 : s * 6

        if (draw > 0) {
          const ax = cardPos[a * 3] + HALF_W
          const ay = cardPos[a * 3 + 1]
          const az = cardPos[a * 3 + 2]
          const bx = cardPos[b * 3] - HALF_W
          const by = cardPos[b * 3 + 1]
          const bz = cardPos[b * 3 + 2]
          target[offset] = ax
          target[offset + 1] = ay
          target[offset + 2] = az
          // The far endpoint extends from the parent anchor towards the child
          target[offset + 3] = lerp(ax, bx, draw)
          target[offset + 4] = lerp(ay, by, draw)
          target[offset + 5] = lerp(az, bz, draw)
        } else {
          target[offset] = target[offset + 3] = -30
          target[offset + 1] = target[offset + 4] = 0
          target[offset + 2] = target[offset + 5] = 0
        }
      }
      filamentAttr.needsUpdate = true
      flagAttr.needsUpdate = true

      // -- Pulses: bright motes run the connectors while the network dwells --
      for (let j = 0; j < PULSE_COUNT; j++) {
        const sprite = pulses[j]
        if (t <= NETWORK_DONE || depart > 0.001) {
          sprite.scale.setScalar(0.001)
          continue
        }
        const local = (t - NETWORK_DONE) / PULSE_PERIOD + j * 0.37
        const lap = Math.floor(local)
        const frac = local - lap
        // Deterministic edge hopping: each lap sends the mote down a new edge
        const [a, b] = EDGES[(j * 2 + lap) % EDGES.length]
        sprite.position.set(
          lerp(cardPos[a * 3] + HALF_W, cardPos[b * 3] - HALF_W, frac),
          lerp(cardPos[a * 3 + 1], cardPos[b * 3 + 1], frac),
          lerp(cardPos[a * 3 + 2], cardPos[b * 3 + 2], frac),
        )
        sprite.scale.setScalar(Math.max(0.14 * Math.sin(frac * Math.PI), 0.001))
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
      cardGeometry.dispose()
      cardMaterial.dispose()
      cardTexture.dispose()
      filamentGeometry.dispose()
      filamentMaterial.dispose()
      flagGeometry.dispose()
      flagMaterial.dispose()
      pulseMaterial.dispose()
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
