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

/** Gaussian bump centred on `mid` — the pulse's swell as it crosses a waypoint. */
const bump = (t: number, mid: number, width: number) => {
  const d = (t - mid) / width
  return Math.exp(-d * d)
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

/** Small soft dot texture for pulse comets, ring cores and the dust motes. */
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
 * Bake a destination label as a transparent plate: bright gold mono capitals,
 * matching the station labels of the trace diagrams. Baked once per label so
 * the scene renders real account names without a text engine.
 */
function makeLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 256, 64)
  ctx.font = '600 27px Menlo, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(240, 212, 145, 0.92)'
  ctx.fillText(text, 128, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------------------------------------------------------------------------
 * Trail definitions — three traced money routes leaving the gate.
 *
 * Each trail is a fixed quadratic curve from just right of the gate to a
 * named destination, with a mid waypoint where the pulse swells (the hop the
 * engine reconstructed). The third route ends at a cash withdrawal — the
 * flagged trail, greeted in restrained crimson on every arrival.
 * ------------------------------------------------------------------------- */
type TrailSpec = {
  label: string
  control: [number, number, number]
  end: [number, number, number]
  /** Pulse cycle length in seconds; staggered so the trails never fire together */
  period: number
  /** Pulse phase offset in seconds */
  offset: number
  flagged: boolean
}

// Destinations stay inside the camera frustum at maximum sway (stage-local
// x ≲ 3.3 on desktop once the +1.1 stage shift and 0.95 camera drift are
// paid), so the fan diverges VERTICALLY and only modestly in x — the frame
// has ±2 units of headroom in y but barely 2 to the right of the gate.
const TRAILS: TrailSpec[] = [
  { label: 'ANZ ··4417', control: [2.3, 1.15, -0.25], end: [3.0, 1.7, -0.5], period: 4.6, offset: 0, flagged: false },
  { label: 'WISE', control: [2.5, -0.12, -0.5], end: [3.35, 0.12, -1.1], period: 5.6, offset: 1.9, flagged: false },
  { label: 'CASH ATM', control: [2.15, -1.2, 0.05], end: [2.7, -1.7, 0.15], period: 5.1, offset: 3.4, flagged: true },
]

/** Shared start of all three trails: the gate's exit mouth. */
const TRAIL_START = new THREE.Vector3(1.2, 0, 0)

/** Curve parameter of the mid waypoint on every trail. */
const MID_T = 0.42

/** Trailing comet sprites per pulse (behind the lead). */
const TRAIL_SPRITES = 3

/* ---------------------------------------------------------------------------
 * The Evidence Engine hero scene — FLOW variant.
 *
 * Narrative: unstructured paper statements stream in from the left, pass
 * through a luminous golden scanning gate at the origin, and their funds flow
 * on as bright amount pulses along drawn trace routes between account
 * waypoints — the money trail the engine reconstructs, rendered live. One
 * route ends at a cash withdrawal and flashes restrained crimson on arrival:
 * the flagged finding in miniature.
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
    // darkness and the far trail stations recede into it — no visible pop-in
    scene.fog = new THREE.Fog('#0d0b09', 9, 24)

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 60)
    const cameraBaseZ = isMobile ? 14 : 10.5
    camera.position.set(0, 0.9, cameraBaseZ)

    // Shift the whole stage right on desktop so the gate sits right-of-centre,
    // leaving the lower-left clear for the DOM headline. On phones the stage
    // shifts LEFT instead: with the gate left-of-centre the narrow frame
    // gains enough width on the right for the full trail fan.
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

    /* -------------------------- The money trails -------------------------- */
    // Compress the fan hard on phones: with the −0.7 stage shift the usable
    // band right of the gate is stage-local x ≲ 2.1, so the routes shorten
    // to fit and every trail fixture scales down with them. The fan also
    // rides a little higher (yBias) so the lowest destination clears the
    // DOM CTA block that overlays the scene on small screens.
    const spreadX = isMobile ? 0.42 : 1
    const spreadY = isMobile ? 0.66 : 1
    const yBias = isMobile ? 0.35 : 0
    const sizeScale = isMobile ? 0.62 : 1
    const trailPoint = (v: [number, number, number]) =>
      new THREE.Vector3(TRAIL_START.x + (v[0] - TRAIL_START.x) * spreadX, v[1] * spreadY + yBias, v[2])

    const dotTexture = makeDotTexture()
    const goldColor = new THREE.Color('#d4a94e')
    const crimsonColor = new THREE.Color('#b3231f')

    // Shared ring geometries: a larger torus for destinations, a smaller one
    // for mid waypoints. The default torus orientation already faces the camera.
    const endRingGeometry = new THREE.TorusGeometry(0.14, 0.01, 8, 48)
    const midRingGeometry = new THREE.TorusGeometry(0.09, 0.008, 8, 40)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#f0d491', transparent: true, opacity: 0.55 })
    // The flagged destination owns its material so it can blush crimson alone
    const flagRingMaterial = new THREE.MeshBasicMaterial({ color: '#f0d491', transparent: true, opacity: 0.6 })

    // Mid-waypoint cores share one material; each destination core gets its
    // own so its glow can bloom when a pulse arrives.
    const midCoreMaterial = new THREE.SpriteMaterial({
      map: dotTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const labelGeometry = new THREE.PlaneGeometry(0.78, 0.195)

    type Trail = {
      spec: TrailSpec
      curve: THREE.QuadraticBezierCurve3
      lineMaterial: THREE.LineDashedMaterial
      lineGeometry: THREE.BufferGeometry
      endCoreMaterial: THREE.SpriteMaterial
      labelTexture: THREE.CanvasTexture
      labelMaterial: THREE.MeshBasicMaterial
      // Lead comet + fading trail sprites; each owns a material so opacity
      // can differ per sprite per frame
      pulseSprites: THREE.Sprite[]
      pulseMaterials: THREE.SpriteMaterial[]
    }

    const trails: Trail[] = TRAILS.map((spec) => {
      const curve = new THREE.QuadraticBezierCurve3(
        trailPoint([TRAIL_START.x, TRAIL_START.y, TRAIL_START.z]),
        trailPoint(spec.control),
        trailPoint(spec.end),
      )

      // Dashed route line — the drawn trace. The dashes hold still; the
      // travelling pulse supplies the direction of flow.
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64))
      const lineMaterial = new THREE.LineDashedMaterial({
        color: goldColor,
        transparent: true,
        opacity: 0.35,
        dashSize: 0.11,
        gapSize: 0.09,
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      line.computeLineDistances() // required once for dashed materials
      stage.add(line)

      // Waypoint rings: one mid-route, one at the destination
      const midPos = curve.getPoint(MID_T)
      const endPos = curve.getPoint(1)

      const midRing = new THREE.Mesh(midRingGeometry, ringMaterial)
      midRing.position.copy(midPos)
      midRing.scale.setScalar(sizeScale)
      stage.add(midRing)

      const endRing = new THREE.Mesh(endRingGeometry, spec.flagged ? flagRingMaterial : ringMaterial)
      endRing.position.copy(endPos)
      endRing.scale.setScalar(sizeScale)
      stage.add(endRing)

      // Soft dot cores inside the rings
      const midCore = new THREE.Sprite(midCoreMaterial)
      midCore.position.copy(midPos)
      midCore.scale.setScalar(0.14 * sizeScale)
      midCore.renderOrder = 2
      stage.add(midCore)

      const endCoreMaterial = new THREE.SpriteMaterial({
        map: dotTexture,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const endCore = new THREE.Sprite(endCoreMaterial)
      endCore.position.copy(endPos)
      endCore.scale.setScalar(0.2 * sizeScale)
      endCore.renderOrder = 2
      stage.add(endCore)

      // Destination label plate beneath the ring
      const labelTexture = makeLabelTexture(spec.label)
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      // Nudge the label slightly inboard of its ring: the rightmost stations
      // sit near the frustum edge, and a centred plate would poke past it at
      // maximum camera sway
      const label = new THREE.Mesh(labelGeometry, labelMaterial)
      label.position.set(endPos.x - 0.12 * sizeScale, endPos.y - 0.3 * sizeScale, endPos.z)
      label.scale.setScalar(sizeScale)
      label.renderOrder = 2
      stage.add(label)

      // The amount pulse: a bright lead comet and a short fading tail
      const pulseSprites: THREE.Sprite[] = []
      const pulseMaterials: THREE.SpriteMaterial[] = []
      for (let i = 0; i <= TRAIL_SPRITES; i++) {
        const material = new THREE.SpriteMaterial({
          map: dotTexture,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
        const sprite = new THREE.Sprite(material)
        sprite.scale.setScalar((i === 0 ? 0.3 : 0.24 - i * 0.04) * sizeScale)
        sprite.renderOrder = 3
        stage.add(sprite)
        pulseSprites.push(sprite)
        pulseMaterials.push(material)
      }

      return {
        spec,
        curve,
        lineMaterial,
        lineGeometry,
        endCoreMaterial,
        labelTexture,
        labelMaterial,
        pulseSprites,
        pulseMaterials,
      }
    })

    // Crimson arrival flash hovering over the flagged destination
    const flagGlowTexture = makeGlowTexture()
    const flagTrail = trails.find((trail) => trail.spec.flagged)!
    const flagFlashMaterial = new THREE.SpriteMaterial({
      map: flagGlowTexture,
      color: crimsonColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const flagFlash = new THREE.Sprite(flagFlashMaterial)
    flagFlash.position.copy(flagTrail.curve.getPoint(1))
    flagFlash.scale.setScalar(0.95 * sizeScale)
    flagFlash.renderOrder = 3
    stage.add(flagFlash)

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
    const pulsePoint = new THREE.Vector3()
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

      // -- Trails: shimmer the routes, run the pulses, greet each arrival --
      let flagArrival = 0
      for (let t = 0; t < trails.length; t++) {
        const trail = trails[t]
        // Route lines breathe slightly out of phase so the field feels alive
        trail.lineMaterial.opacity = 0.32 + Math.sin(elapsed * 0.8 + t * 2.1) * 0.06

        // Pulse progress on this trail's own staggered clock
        const progress = ((elapsed + trail.spec.offset) % trail.spec.period) / trail.spec.period
        // Fade the comet in as it leaves the gate and out as it docks
        const visible = smoothstep(0, 0.06, progress) * (1 - smoothstep(0.95, 1, progress))
        // Swell as the pulse crosses the mid waypoint and again on arrival
        const swell = bump(progress, MID_T, 0.045) * 0.55 + bump(progress, 0.97, 0.05) * 0.7

        for (let s = 0; s < trail.pulseSprites.length; s++) {
          // Trailing sprites sample the curve slightly behind the lead
          const back = Math.max(0, progress - s * 0.035)
          trail.curve.getPoint(back, pulsePoint)
          trail.pulseSprites[s].position.copy(pulsePoint)
          const falloff = s === 0 ? 1 : 0.5 - (s - 1) * 0.16
          trail.pulseMaterials[s].opacity = Math.min(1, visible * falloff * (0.9 + swell * 0.4))
          if (s === 0) trail.pulseSprites[s].scale.setScalar(0.3 * sizeScale * (1 + swell))
        }

        // Destination core blooms as the pulse lands, then settles back
        const arrival = bump(progress, 0.97, 0.04)
        trail.endCoreMaterial.opacity = 0.5 + arrival * 0.5
        if (trail.spec.flagged) flagArrival = arrival
      }

      // -- The flag: the CASH ATM ring blushes crimson at every arrival --
      flagRingMaterial.color.lerpColors(goldColor, crimsonColor, flagArrival)
      flagFlashMaterial.opacity = flagArrival * 0.55

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
      for (const trail of trails) {
        trail.lineGeometry.dispose()
        trail.lineMaterial.dispose()
        trail.endCoreMaterial.dispose()
        trail.labelTexture.dispose()
        trail.labelMaterial.dispose()
        for (const material of trail.pulseMaterials) material.dispose()
      }
      endRingGeometry.dispose()
      midRingGeometry.dispose()
      ringMaterial.dispose()
      flagRingMaterial.dispose()
      midCoreMaterial.dispose()
      labelGeometry.dispose()
      flagGlowTexture.dispose()
      flagFlashMaterial.dispose()
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
