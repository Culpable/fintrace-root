/**
 * Hero WebGL activation.
 *
 * Pointer, touch and keyboard intent can reveal the live scene sooner.
 * Otherwise the static fallback protects first paint for three seconds after
 * `load`, then the complete WebGL experience starts automatically. Three.js is
 * imported only at that point, so the critical render never downloads it.
 */
const SCENE_ACTIVATION_DELAY_MS = 3_000

const layer = document.querySelector<HTMLElement>('.eng-scene-layer')

if (layer) {
  let activationTimer: number | undefined
  let activated = false
  let dispose: (() => void) | undefined

  const removeIntentListeners = () => {
    window.removeEventListener('pointermove', activateScene)
    window.removeEventListener('pointerdown', activateScene)
    window.removeEventListener('touchstart', activateScene)
    window.removeEventListener('keydown', activateScene)
  }

  function activateScene() {
    if (activated) return
    activated = true

    if (activationTimer !== undefined) window.clearTimeout(activationTimer)
    window.removeEventListener('load', scheduleSceneActivation)
    removeIntentListeners()

    void (async () => {
      try {
        const { mountEvidenceScene } = await import('./evidence-scene.ts')
        // The scene owns the canvas but not the mount, so the mount is created
        // here and removed with the scene, exactly as the React version did.
        const mount = document.createElement('div')
        mount.className = 'eng-scene-mount'
        mount.setAttribute('aria-hidden', 'true')
        layer!.appendChild(mount)
        dispose = mountEvidenceScene(mount, () => layer!.classList.add('is-ready'))
      } catch {
        // A failed chunk load or renderer construction leaves the designed
        // static fallback on screen rather than crashing the page.
      }
    })()
  }

  function scheduleSceneActivation() {
    if (activated || activationTimer !== undefined) return
    activationTimer = window.setTimeout(activateScene, SCENE_ACTIVATION_DELAY_MS)
  }

  window.addEventListener('pointermove', activateScene, { passive: true })
  window.addEventListener('pointerdown', activateScene, { passive: true })
  window.addEventListener('touchstart', activateScene, { passive: true })
  window.addEventListener('keydown', activateScene)

  if (document.readyState === 'complete') scheduleSceneActivation()
  else window.addEventListener('load', scheduleSceneActivation, { once: true })

  // Release the renderer and every GPU resource when the document is
  // discarded, matching the React effect's cleanup on navigation away.
  window.addEventListener('pagehide', () => {
    if (activationTimer !== undefined) window.clearTimeout(activationTimer)
    removeIntentListeners()
    dispose?.()
    dispose = undefined
  })
}

export {}
