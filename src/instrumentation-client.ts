import { initialiseAnalytics, trackAnalytics } from '@/lib/analytics/client'

let ctaListenerInstalled = false

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
  const browserWindow = window as unknown as {
    requestIdleCallback?: Window['requestIdleCallback']
    setTimeout: Window['setTimeout']
  }

  if (browserWindow.requestIdleCallback) {
    browserWindow.requestIdleCallback(() => initialiseAnalytics(), { timeout: 2_000 })
    return
  }

  browserWindow.setTimeout(() => initialiseAnalytics(), 0)
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
