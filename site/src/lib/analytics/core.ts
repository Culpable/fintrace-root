export type AnalyticsPage = 'home' | 'about' | 'engagement' | 'contact' | 'privacy' | 'not_found'

type AnalyticsEnvironment = 'production' | 'development' | 'test'
type AssessmentPlacement = 'header' | 'hero' | 'section' | 'footer'
type AssessmentDestination = 'contact' | 'contact_enquire'
type FailureStage = 'response' | 'network'

export type AnalyticsEventInput =
  | { name: 'Page Viewed'; path: string }
  | {
      name: 'Assessment CTA Clicked'
      path: string
      placement: AssessmentPlacement
      destination: AssessmentDestination
    }
  | { name: 'Enquiry Started'; path: string; placement: 'form' }
  | { name: 'Enquiry Submitted'; path: string; placement: 'form' }
  | {
      name: 'Enquiry Submission Failed'
      path: string
      placement: 'form'
      failure_stage: FailureStage
    }

export type ValidatedAnalyticsEvent = {
  name: AnalyticsEventInput['name']
  properties: Record<string, string | number>
}

export interface AnalyticsAdapter {
  initialise(): void | Promise<void>
  track(event: ValidatedAnalyticsEvent): void | Promise<void>
}

/**
 * Storage seam for the pre-adapter queue.
 *
 * Every navigation is a full page load on this site, so an event tracked
 * before the vendor initialises would otherwise die with the document. The
 * adapter persists the queue between documents; `load()` must clear its own
 * storage so an event can never be delivered twice.
 */
export interface AnalyticsQueuePersistence {
  load(): ValidatedAnalyticsEvent[]
  save(queue: readonly ValidatedAnalyticsEvent[]): void
}

type AnalyticsCoreOptions = {
  environment: AnalyticsEnvironment
  loadAdapter: () => AnalyticsAdapter | Promise<AnalyticsAdapter>
  queueLimit?: number
  persistence?: AnalyticsQueuePersistence
}

const DEFAULT_QUEUE_LIMIT = 50
const ASSESSMENT_PLACEMENTS = new Set<AssessmentPlacement>(['header', 'hero', 'section', 'footer'])
const ASSESSMENT_DESTINATIONS = new Set<AssessmentDestination>(['contact', 'contact_enquire'])
const FAILURE_STAGES = new Set<FailureStage>(['response', 'network'])

/** Convert every browser location into the closed page taxonomy before delivery. */
export function normaliseAnalyticsPage(rawLocation: unknown): AnalyticsPage {
  if (typeof rawLocation !== 'string') {
    return 'not_found'
  }

  let pathname: string
  try {
    pathname = new URL(rawLocation, 'https://fintrace.invalid').pathname
  } catch {
    return 'not_found'
  }

  const route = pathname.replace(/\/+$/, '') || '/'
  switch (route) {
    case '/':
      return 'home'
    case '/about':
      return 'about'
    case '/engagement':
      return 'engagement'
    case '/contact':
      return 'contact'
    case '/privacy':
      return 'privacy'
    default:
      return 'not_found'
  }
}

/**
 * Own the complete analytics lifecycle behind a narrow, fail-open Interface.
 * Validate and rebuild each event so caller-supplied keys never cross the seam.
 */
export function createAnalyticsCore({
  environment,
  loadAdapter,
  queueLimit = DEFAULT_QUEUE_LIMIT,
  persistence,
}: AnalyticsCoreOptions) {
  const limit = Math.max(1, queueLimit)
  // Events restored from a previous document were validated when they were
  // tracked, so they re-enter the queue without a second validation pass.
  const queue: ValidatedAnalyticsEvent[] =
    environment === 'production' && persistence ? persistence.load().slice(-limit) : []
  let adapter: AnalyticsAdapter | null = null
  let initialisationStarted = false
  let deliveryDisabled = false
  let lastPage: AnalyticsPage | null = null

  function safeTrack(event: ValidatedAnalyticsEvent) {
    if (!adapter || deliveryDisabled) {
      return
    }

    try {
      const result = adapter.track(event)
      if (result && typeof result.catch === 'function') {
        void result.catch(() => undefined)
      }
    } catch {
      // Keep delivery failures inside the analytics boundary so callers always continue.
    }
  }

  function validate(input: unknown): ValidatedAnalyticsEvent | null {
    if (!input || typeof input !== 'object' || !('name' in input)) {
      return null
    }

    const candidate = input as Record<string, unknown>
    const page = normaliseAnalyticsPage(candidate.path)
    const common = {
      site: 'fintrace-root',
      environment: 'production',
      schema_version: 1,
      page,
    }

    switch (candidate.name) {
      case 'Page Viewed':
        if (lastPage === page) {
          return null
        }
        lastPage = page
        return { name: candidate.name, properties: common }

      case 'Assessment CTA Clicked':
        if (
          !ASSESSMENT_PLACEMENTS.has(candidate.placement as AssessmentPlacement) ||
          !ASSESSMENT_DESTINATIONS.has(candidate.destination as AssessmentDestination)
        ) {
          return null
        }
        return {
          name: candidate.name,
          properties: {
            ...common,
            placement: candidate.placement as AssessmentPlacement,
            destination: candidate.destination as AssessmentDestination,
          },
        }

      case 'Enquiry Started':
      case 'Enquiry Submitted':
        if (candidate.placement !== 'form') {
          return null
        }
        return { name: candidate.name, properties: { ...common, placement: 'form' } }

      case 'Enquiry Submission Failed':
        if (candidate.placement !== 'form' || !FAILURE_STAGES.has(candidate.failure_stage as FailureStage)) {
          return null
        }
        return {
          name: candidate.name,
          properties: {
            ...common,
            placement: 'form',
            failure_stage: candidate.failure_stage as FailureStage,
          },
        }

      default:
        return null
    }
  }

  function trackAnalytics(input: unknown) {
    if (environment !== 'production' || deliveryDisabled) {
      return
    }

    const event = validate(input)
    if (!event) {
      return
    }

    if (adapter) {
      safeTrack(event)
      return
    }

    queue.push(event)
    if (queue.length > limit) {
      queue.shift()
    }
    persistence?.save(queue)
  }

  function initialiseAnalytics() {
    if (environment !== 'production' || initialisationStarted || deliveryDisabled) {
      return
    }

    initialisationStarted = true

    void (async () => {
      try {
        const loadedAdapter = await loadAdapter()
        await loadedAdapter.initialise()
        adapter = loadedAdapter

        const pendingEvents = queue.splice(0)
        persistence?.save(queue)
        for (const event of pendingEvents) {
          safeTrack(event)
        }
      } catch {
        // Discard queued events after a permanent load or initialisation failure.
        queue.length = 0
        persistence?.save(queue)
        deliveryDisabled = true
      }
    })()
  }

  return { initialiseAnalytics, trackAnalytics }
}
