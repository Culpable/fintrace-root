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
 * Ease-out-back with a gentle overshoot (~8%): nodes glide slightly past
 * their constellation slot and settle back — arrival reads as deliberate
 * placement rather than a fade.
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

/** Small soft dot texture for node cores, edge pulses and the ambient dust. */
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
 * Bake one account label as a small plate texture: near-black rounded plate,
 * hairline gold frame and a centred mono account name. At hero distance the
 * plates read as engraved tags beneath each node of the money network.
 */
function makeLabelTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Rounded plate: warm near-black so labels hold against the gate glow
  ctx.beginPath()
  ctx.roundRect(2, 8, 252, 48, 8)
  ctx.fillStyle = 'rgba(16, 13, 9, 0.78)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(212, 169, 78, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Centred account name in the engraved mono voice
  ctx.font = '500 24px Menlo, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#e4c584'
  ctx.fillText(label, 128, 33)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------------------------------------------------------------------
 * Constellation data — the money network the gate assembles.
 *
 * ANZ is the hub; spokes fan out to the counterparties the engine traces:
 * Wise (and through it the overseas HDFC account), a second domestic bank
 * chain with a crypto off-ramp, a card account — and the flagged CASH ATM
 * hop, which renders in restrained crimson.
 *
 * Framing constraint (measured against the hero camera, fov 34°, stage shift
 * +1.1 desktop / −0.7 mobile, full drift + pointer sway): the usable
 * stage-local x limit is ≈3.1 at z=0, growing with depth (≈3.5 at z=−0.9,
 * ≈3.67 at z=−1.2). Vertical room is generous, so the constellation builds
 * TALL around the hub — every slot keeps node x + label extent (including
 * its labelOffset) inside the limit for its z. Round-four feedback widened
 * the spread: slots sit further apart in x, y AND z so the graph breathes,
 * and every label is verified against every thread segment for clear air.
 * ------------------------------------------------------------------------- */
type NetNode = {
  label: string
  slot: [number, number, number]
  /**
   * Where the label plate sits relative to its ring, in NODE_SCALE units.
   * Chosen PER NODE so no incident thread ever crosses the plate: a label
   * goes on whichever side of the ring carries no thread — beside it when
   * threads enter above and below, above/below when they enter sideways.
   * (Round-four feedback: threads were overlaying the node descriptors.)
   */
  labelOffset: [number, number]
  flag?: boolean
}

const NODES_DESKTOP: NetNode[] = [
  // The hub — placed first. Threads leave up-left, up-right, down and
  // down-left, so the only thread-free side is the LEFT horizontal.
  { label: 'ANZ ··4417', slot: [2.35, 0.05, -0.2], labelOffset: [-0.73, 0] },
  { label: 'WISE', slot: [1.7, 1.5, -0.55], labelOffset: [-0.73, 0] }, // threads right+top → label left
  { label: 'CBA ··0092', slot: [3.3, 1.15, -0.9], labelOffset: [-0.73, 0] }, // threads below+above-right → label left
  { label: 'CASH ATM', slot: [2.6, -1.6, 0], labelOffset: [0, -0.38], flag: true }, // thread above → label below
  { label: 'AMEX ··3010', slot: [1.45, -1.3, -0.35], labelOffset: [0, -0.38] }, // thread above → label below
  // The two crown nodes sit well apart (round-four follow-up: NAB moved
  // right and deeper, HDFC left and higher, so NAB's plate clears HDFC's
  // ring by a full plate-height even under maximum camera parallax)
  { label: 'HDFC ··3321', slot: [2.35, 2.55, -0.9], labelOffset: [0, 0.38] }, // thread below → label above
  { label: 'NAB ··7793', slot: [3.4, 2, -1.5], labelOffset: [0, 0.38] }, // thread below → label above
  { label: 'BTC WALLET', slot: [3.45, -0.55, -1.1], labelOffset: [0, -0.38] }, // thread above → label below
]

/** Edges as [parent, child] node indices; threads draw parent rim → child rim. */
const EDGES_DESKTOP: Array<[number, number]> = [
  [0, 1], // ANZ → WISE
  [0, 2], // ANZ → CBA
  [0, 3], // ANZ → CASH ATM — the flagged hop, rendered crimson
  [0, 4], // ANZ → AMEX
  [1, 5], // WISE → HDFC
  [2, 6], // CBA → NAB
  [2, 7], // CBA → BTC WALLET — routed off the CBA branch so no threads cross
]

/* Compact slots (phones AND any tall window — see `compact`) ride higher:
   the DOM CTA block owns the lower half of the narrow hero, so the
   constellation keeps every label above it. CASH ATM in particular must not
   sink — its below-label previously cleared the gold CTA button by design;
   keep that y. */
const NODES_MOBILE: NetNode[] = [
  { label: 'ANZ ··4417', slot: [1.15, 0.55, -0.2], labelOffset: [0.73, 0] }, // threads left+up → label right
  { label: 'WISE', slot: [0.5, 1.8, -0.5], labelOffset: [-0.73, 0] }, // threads right → label left
  { label: 'CBA ··0092', slot: [1.95, 1.7, -0.6], labelOffset: [0, 0.38] }, // thread below-left → label above
  { label: 'CASH ATM', slot: [0.65, -0.75, 0.1], labelOffset: [0, -0.38], flag: true }, // thread above → label below
  { label: 'HDFC ··3321', slot: [1.55, 2.75, -0.9], labelOffset: [0, 0.38] }, // thread below → label above
]

const EDGES_MOBILE: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 3], // the flagged hop
  [1, 4],
]

/* ---------------------------------------------------------------------------
 * The Evidence Engine hero scene — NETWORK variant.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and re-emerge on the
 * right as an ACCOUNT-NETWORK CONSTELLATION — labelled account nodes glide to
 * their slots one at a time, golden threads draw between them rim to rim, and
 * bright pulses run the hub's spokes. One hop — cash leaving the network —
 * holds restrained crimson. Unstructured paper in, a traced money network out.
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
    // Compact (tall) configuration for phones AND any window taller than it
    // is wide-ish — portrait tablets and narrow split-screen windows report
    // desktop widths but cannot frame the eight-node spread (round-four
    // follow-up: layout is chosen by aspect, not width alone)
    const compact = width < 768 || width / height < 1.2

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
    // darkness and the constellation dissolves into it — no visible pop-in
    scene.fog = new THREE.Fog('#0d0b09', 9, 24)

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60)
    const cameraBaseZ = compact ? 14 : 10.5
    camera.position.set(0, 0.9, cameraBaseZ)

    // Shift the whole stage right on desktop so the gate sits right-of-centre,
    // leaving the lower-left clear for the DOM headline. On mobile shift it
    // LEFT instead: the gate moves left-of-centre, which widens the usable
    // band to the right so the constellation fits the narrow frustum.
    const stage = new THREE.Group()
    stage.position.x = compact ? -0.7 : 1.1
    scene.add(stage)

    /* ------------------------- Incoming documents ------------------------ */
    const DOC_COUNT = compact ? 12 : 26
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

    /* --------------------- Outgoing account constellation ----------------- */
    // The compact CASH placement varies with the window's shape. Phones keep
    // the flagged sink LOW with its label below (clear of the CTA block at
    // 390x900); taller desktop-width windows (portrait tablets, split-screen
    // — aspect ≥ 0.6) lift it and hang the label to its RIGHT, because there
    // the kicker + h1 own the band the low label would land in. The thread
    // from the hub arrives steeply from above, so the right side is
    // thread-free in both variants.
    const cashCompact: NetNode =
      width / height < 0.6
        ? { label: 'CASH ATM', slot: [0.65, -0.75, 0.1], labelOffset: [0, -0.38], flag: true }
        : { label: 'CASH ATM', slot: [0.8, -0.25, 0.1], labelOffset: [0.73, 0], flag: true }
    const NODES = compact ? NODES_MOBILE.map((node) => (node.flag ? cashCompact : node)) : NODES_DESKTOP
    const EDGES = compact ? EDGES_MOBILE : EDGES_DESKTOP
    const NODE_COUNT = NODES.length
    const FLAG_EDGE = EDGES.findIndex(([, child]) => NODES[child].flag)

    // Constellation cycle: births every 1.4 s, threads draw as nodes settle,
    // a long pulsing dwell, then the whole graph drifts into the fog and the
    // engine assembles it afresh.
    const CYCLE = 28
    const BIRTH_GAP = 1.4
    const GLIDE = 1.6 // seconds a node spends travelling gate → slot
    const EDGE_DRAW = 0.9 // seconds a thread takes to draw rim → rim
    const EXIT_START = 24
    // Global node scale: the compact in-frame layout needs slightly smaller
    // rings/labels for clear air, and the narrow mobile frustum smaller still
    const NODE_SCALE = compact ? 0.62 : 0.9
    const RIM_OFFSET = 0.27 * NODE_SCALE // thread endpoints stop at ring rims, not centres

    const net = new THREE.Group()
    stage.add(net)

    // The wide layout is framed for aspect 1.6 (1440x900). Narrower-but-
    // still-wide windows (down to the compact threshold at 1.2) scale the
    // WHOLE constellation — spacing and plates alike — toward the gate so
    // the right-hand labels neither crowd nor clip. Rest-state usable width
    // right of the gate is tan(17°)·10.5·aspect − 1.1 (stage) − 0.35 (drift);
    // the fit is that width relative to the designed aspect's.
    const netFitFor = (a: number) => Math.min(1, (3.21 * a - 1.45) / (3.21 * 1.6 - 1.45))
    if (!compact) net.scale.setScalar(netFitFor(width / height))

    const dotTexture = makeDotTexture()

    // Shared node geometry: a thin gold torus facing the camera reads as the
    // account ring; a soft additive sprite is its core.
    const ringGeometry = new THREE.TorusGeometry(0.16, 0.012, 8, 40)
    const ringGoldMaterial = new THREE.MeshBasicMaterial({ color: '#f0d491' })
    const ringFlagMaterial = new THREE.MeshBasicMaterial({ color: '#c23a2e', transparent: true, opacity: 0.9 })
    const coreGoldMaterial = new THREE.SpriteMaterial({
      map: dotTexture,
      color: '#f0d491',
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const coreFlagMaterial = new THREE.SpriteMaterial({
      map: dotTexture,
      color: '#e0503a',
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const labelGeometry = new THREE.PlaneGeometry(0.9, 0.225)
    const labelTextures = NODES.map((node) => makeLabelTexture(node.label))
    const labelMaterials = labelTextures.map(
      (texture) =>
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
    )

    const rings = NODES.map((node) => {
      const ring = new THREE.Mesh(ringGeometry, node.flag ? ringFlagMaterial : ringGoldMaterial)
      ring.renderOrder = 2
      net.add(ring)
      return ring
    })
    const cores = NODES.map((node) => {
      const nodeCore = new THREE.Sprite(node.flag ? coreFlagMaterial : coreGoldMaterial)
      nodeCore.renderOrder = 2
      net.add(nodeCore)
      return nodeCore
    })
    const labels = NODES.map((_, i) => {
      const label = new THREE.Mesh(labelGeometry, labelMaterials[i])
      label.renderOrder = 2
      net.add(label)
      return label
    })

    // Per-node timing: birth in array order (hub first) so every thread has a
    // settled parent by the time its child arrives.
    const nodeBirth = NODES.map((_, i) => i * BIRTH_GAP)
    const nodeSettle = nodeBirth.map((birth) => birth + GLIDE)
    // Per-edge draw start: both endpoints must be settled before a thread draws
    const edgeStart = EDGES.map(([parent, child]) => Math.max(nodeSettle[parent], nodeSettle[child]))
    const DWELL_START = Math.max(...edgeStart) + EDGE_DRAW + 0.3

    // Scratch buffer holding this frame's node positions for threads/pulses
    const nodeWorld = new Float32Array(NODE_COUNT * 3)

    // Gold threads share one dynamic LineSegments buffer; the flagged hop owns
    // its own so the crimson never forces a material switch mid-draw.
    const goldEdgeIndices = EDGES.map((_, e) => e).filter((e) => e !== FLAG_EDGE)
    const goldEdgePositions = new Float32Array(goldEdgeIndices.length * 6)
    const goldEdgeGeometry = new THREE.BufferGeometry()
    const goldEdgeAttr = new THREE.BufferAttribute(goldEdgePositions, 3)
    goldEdgeAttr.setUsage(THREE.DynamicDrawUsage)
    goldEdgeGeometry.setAttribute('position', goldEdgeAttr)
    const goldEdgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#d4a94e'),
      transparent: true,
      opacity: 0.4,
    })
    const goldEdges = new THREE.LineSegments(goldEdgeGeometry, goldEdgeMaterial)
    goldEdges.frustumCulled = false
    goldEdges.renderOrder = 2
    net.add(goldEdges)

    const flagEdgePositions = new Float32Array(6)
    const flagEdgeGeometry = new THREE.BufferGeometry()
    const flagEdgeAttr = new THREE.BufferAttribute(flagEdgePositions, 3)
    flagEdgeAttr.setUsage(THREE.DynamicDrawUsage)
    flagEdgeGeometry.setAttribute('position', flagEdgeAttr)
    const flagEdgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#b3231f'),
      transparent: true,
      opacity: 0.6,
    })
    const flagEdge = new THREE.LineSegments(flagEdgeGeometry, flagEdgeMaterial)
    flagEdge.frustumCulled = false
    flagEdge.renderOrder = 2
    net.add(flagEdge)

    // Pulse sprites run the hub's gold spokes during the dwell — evidence of
    // flow, not decoration. Each owns its material so opacity is independent.
    const PULSE_EDGES = (compact ? [0, 1, 3] : [0, 1, 4]).filter((e) => e !== FLAG_EDGE && e < EDGES.length)
    const pulseMaterials = PULSE_EDGES.map(
      () =>
        new THREE.SpriteMaterial({
          map: dotTexture,
          color: '#f4dda0',
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
    )
    const pulses = pulseMaterials.map((material) => {
      const pulseSprite = new THREE.Sprite(material)
      pulseSprite.scale.setScalar(0.14 * NODE_SCALE)
      pulseSprite.renderOrder = 2
      net.add(pulseSprite)
      return pulseSprite
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
    const DUST_COUNT = compact ? 120 : 260
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
    // Scratch vectors for edge endpoints — reused every frame, never allocated
    const vA = new THREE.Vector3()
    const vB = new THREE.Vector3()
    const vDir = new THREE.Vector3()
    // Pointer parallax: target values from events, current values lerped in
    // the loop so the camera glides rather than tracks
    const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 }

    // Write one thread's endpoints: start at the parent's rim, draw towards
    // the child's rim by `frac`; collapse behind the fog when hidden.
    const setEdge = (target: Float32Array, offset: number, parent: number, child: number, frac: number) => {
      if (frac <= 0) {
        target[offset] = target[offset + 3] = -30
        target[offset + 1] = target[offset + 4] = 0
        target[offset + 2] = target[offset + 5] = 0
        return
      }
      vA.set(nodeWorld[parent * 3], nodeWorld[parent * 3 + 1], nodeWorld[parent * 3 + 2])
      vB.set(nodeWorld[child * 3], nodeWorld[child * 3 + 1], nodeWorld[child * 3 + 2])
      vDir.subVectors(vB, vA).normalize()
      vA.addScaledVector(vDir, RIM_OFFSET)
      vB.addScaledVector(vDir, -RIM_OFFSET)
      vB.lerpVectors(vA, vB, frac)
      target[offset] = vA.x
      target[offset + 1] = vA.y
      target[offset + 2] = vA.z
      target[offset + 3] = vB.x
      target[offset + 4] = vB.y
      target[offset + 5] = vB.z
    }

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

      // -- Constellation clock: assemble, dwell with pulses, drift out, reset --
      const cycleT = elapsed % CYCLE
      const exitDrift = smoothstep(EXIT_START, CYCLE, cycleT) * 3.4
      const exitFade = 1 - smoothstep(EXIT_START + 1.5, CYCLE - 0.3, cycleT)

      // -- Nodes: born at the gate one at a time, glide-overshoot into slot --
      for (let i = 0; i < NODE_COUNT; i++) {
        const node = NODES[i]
        const t = cycleT - nodeBirth[i]
        const glide = t <= 0 ? 0 : backOut(Math.min(t / GLIDE, 1))
        const sway = Math.sin(elapsed * 0.5 + i * 1.7) * 0.04

        const x = lerp(0, node.slot[0], glide) + exitDrift
        const y = lerp(0, node.slot[1], glide) + sway * glide
        const z = lerp(0, node.slot[2], glide)
        // Ring scales in slightly after birth so it grows out of the gate glow
        const scale = (t <= 0 ? 0 : smoothstep(0.1, 0.7, t)) * exitFade

        nodeWorld[i * 3] = x
        nodeWorld[i * 3 + 1] = y
        nodeWorld[i * 3 + 2] = z

        rings[i].position.set(x, y, z)
        rings[i].scale.setScalar(Math.max(scale * NODE_SCALE, 0.001))
        cores[i].position.set(x, y, z)
        cores[i].scale.setScalar(Math.max(scale * 0.2 * NODE_SCALE, 0.001))

        // Label fades and scales in just behind its ring, anchored on its
        // node's thread-free side (per-node labelOffset) so no thread ever
        // draws across the plate. It shares the ring's x/y/z, so sway and
        // exit drift carry both together.
        const labelIn = (t <= 0 ? 0 : smoothstep(0.5, 1.2, t)) * exitFade
        labels[i].position.set(x + node.labelOffset[0] * NODE_SCALE, y + node.labelOffset[1] * NODE_SCALE, z)
        labels[i].scale.setScalar(Math.max(labelIn * NODE_SCALE, 0.001))
        labelMaterials[i].opacity = labelIn * 0.95
      }

      // -- Flag ring: pulse warm crimson once its hop has drawn --
      const flagLit =
        FLAG_EDGE === -1
          ? 0
          : smoothstep(edgeStart[FLAG_EDGE] + EDGE_DRAW, edgeStart[FLAG_EDGE] + EDGE_DRAW + 0.6, cycleT)
      ringFlagMaterial.opacity = (0.65 + Math.sin(elapsed * 2.4) * 0.25 * flagLit) * exitFade
      coreFlagMaterial.opacity = (0.7 + Math.sin(elapsed * 2.4 + 0.6) * 0.2 * flagLit) * exitFade

      // -- Threads: draw rim → rim once both endpoint nodes have settled.
      //    Collapse everything while the constellation dissolves so bare
      //    lines never outlive their rings --
      const edgesVisible = exitFade > 0.15
      for (let g = 0; g < goldEdgeIndices.length; g++) {
        const e = goldEdgeIndices[g]
        const frac = edgesVisible ? smoothstep(edgeStart[e], edgeStart[e] + EDGE_DRAW, cycleT) : 0
        setEdge(goldEdgePositions, g * 6, EDGES[e][0], EDGES[e][1], frac)
      }
      goldEdgeAttr.needsUpdate = true
      if (FLAG_EDGE !== -1) {
        const frac = edgesVisible ? smoothstep(edgeStart[FLAG_EDGE], edgeStart[FLAG_EDGE] + EDGE_DRAW, cycleT) : 0
        setEdge(flagEdgePositions, 0, EDGES[FLAG_EDGE][0], EDGES[FLAG_EDGE][1], frac)
      }
      flagEdgeAttr.needsUpdate = true

      // -- Pulses: bright dots run the hub's spokes during the dwell --
      const dwellAlpha =
        smoothstep(DWELL_START, DWELL_START + 1, cycleT) * (1 - smoothstep(EXIT_START, EXIT_START + 1.5, cycleT))
      for (let k = 0; k < PULSE_EDGES.length; k++) {
        const [parent, child] = EDGES[PULSE_EDGES[k]]
        const frac = (elapsed * 0.45 + k * 0.37) % 1
        vA.set(nodeWorld[parent * 3], nodeWorld[parent * 3 + 1], nodeWorld[parent * 3 + 2])
        vB.set(nodeWorld[child * 3], nodeWorld[child * 3 + 1], nodeWorld[child * 3 + 2])
        pulses[k].position.lerpVectors(vA, vB, frac)
        // Fade at both rims so pulses appear to leave one node and arrive at the next
        pulseMaterials[k].opacity = dwellAlpha * Math.sin(frac * Math.PI) * 0.85
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

    // Track container size (not window size) so layout changes stay correct.
    // The wide layout also re-fits the constellation to the new aspect live;
    // switching between the wide and compact layouts still needs a remount.
    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      if (!compact) net.scale.setScalar(netFitFor(w / h))
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
      ringGeometry.dispose()
      ringGoldMaterial.dispose()
      ringFlagMaterial.dispose()
      coreGoldMaterial.dispose()
      coreFlagMaterial.dispose()
      labelGeometry.dispose()
      for (const material of labelMaterials) material.dispose()
      for (const texture of labelTextures) texture.dispose()
      goldEdgeGeometry.dispose()
      goldEdgeMaterial.dispose()
      flagEdgeGeometry.dispose()
      flagEdgeMaterial.dispose()
      for (const material of pulseMaterials) material.dispose()
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
