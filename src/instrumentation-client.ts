import { initialiseAnalytics, trackAnalytics } from '@/lib/analytics/client'

let ctaListenerInstalled = false
let analyticsInitialisationScheduled = false

const ANALYTICS_ACTIVATION_DELAY_MS = 3_000

function handleAssessmentClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) {
    return
  }

  const cta = event.target.closest<HTMLElement>('[data-analytics-cta]')
  const placement = cta?.dataset.analyticsPlacement
  const destination = cta?.dataset.analyticsDestination

  if (
    !cta ||
    (placement !== 'header' && placement !== 'hero' && placement !== 'section' && placement !== 'footer') ||
    (destination !== 'contact' && destination !== 'contact_enquire')
  ) {
    return
  }

  trackAnalytics({ name: 'Assessment CTA Clicked', placement, destination })
}

function scheduleInitialisation() {
  if (analyticsInitialisationScheduled) {
    return
  }

  analyticsInitialisationScheduled = true

  let activationTimer: number | undefined
  let initialised = false

  const removeIntentListeners = () => {
    window.removeEventListener('pointerdown', initialise)
    window.removeEventListener('touchstart', initialise)
    window.removeEventListener('keydown', initialise)
  }

  const initialise = () => {
    if (initialised) {
      return
    }

    initialised = true

    if (activationTimer !== undefined) {
      window.clearTimeout(activationTimer)
    }

    window.removeEventListener('load', scheduleAfterLoad)
    removeIntentListeners()
    initialiseAnalytics()
  }

  const scheduleAfterLoad = () => {
    if (initialised || activationTimer !== undefined) {
      return
    }

    activationTimer = window.setTimeout(initialise, ANALYTICS_ACTIVATION_DELAY_MS)
  }

  // Preserve queued page and CTA events while keeping the analytics vendor
  // outside the critical visual window. User intent can initialise it sooner;
  // otherwise a bounded post-load delay guarantees eventual delivery.
  window.addEventListener('pointerdown', initialise, { passive: true })
  window.addEventListener('touchstart', initialise, { passive: true })
  window.addEventListener('keydown', initialise)

  if (document.readyState === 'complete') {
    scheduleAfterLoad()
  } else {
    window.addEventListener('load', scheduleAfterLoad, { once: true })
  }
}

trackAnalytics({ name: 'Page Viewed', path: window.location.pathname })
scheduleInitialisation()

if (!ctaListenerInstalled) {
  // Observe marked actions during capture so the click event enters analytics
  // before React's Link handler starts the destination route transition.
  document.addEventListener('click', handleAssessmentClick, { capture: true })
  ctaListenerInstalled = true
}

export function onRouterTransitionStart(url: string) {
  trackAnalytics({ name: 'Page Viewed', path: url })
}
