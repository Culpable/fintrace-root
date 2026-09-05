import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAnalyticsCore,
  normaliseAnalyticsPage,
  type AnalyticsAdapter,
  type ValidatedAnalyticsEvent,
} from '../src/lib/analytics/core.ts'

class MemoryAdapter implements AnalyticsAdapter {
  initialisations = 0
  events: ValidatedAnalyticsEvent[] = []

  initialise() {
    this.initialisations += 1
  }

  track(event: ValidatedAnalyticsEvent) {
    this.events.push(event)
  }
}

function settleAnalytics() {
  return new Promise<void>((resolve) => setImmediate(resolve))
}

test('normalises known routes and hides every unknown raw location', () => {
  assert.equal(normaliseAnalyticsPage('/'), 'home')
  assert.equal(normaliseAnalyticsPage('/about/'), 'about')
  assert.equal(normaliseAnalyticsPage('https://fintrace.com.au/engagement/?utm_source=secret#pricing'), 'engagement')
  assert.equal(normaliseAnalyticsPage('/contact?gclid=secret'), 'contact')
  assert.equal(normaliseAnalyticsPage('/privacy/'), 'privacy')
  assert.equal(normaliseAnalyticsPage('/private/matter-123?email=person@example.com'), 'not_found')
  assert.equal(normaliseAnalyticsPage({ path: '/about/' }), 'not_found')
})

test('production initialises once and flushes queued events once in order', async () => {
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({ environment: 'production', loadAdapter: () => adapter })

  analytics.trackAnalytics({ name: 'Page Viewed', path: '/' })
  analytics.trackAnalytics({
    name: 'Assessment CTA Clicked',
    path: '/',
    placement: 'hero',
    destination: 'contact',
  })
  analytics.initialiseAnalytics()
  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(adapter.initialisations, 1)
  assert.deepEqual(
    adapter.events.map((event) => event.name),
    ['Page Viewed', 'Assessment CTA Clicked'],
  )
})

test('development does not load, initialise or deliver to an external adapter', async () => {
  const adapter = new MemoryAdapter()
  let loadCount = 0
  const analytics = createAnalyticsCore({
    environment: 'development',
    loadAdapter: () => {
      loadCount += 1
      return adapter
    },
  })

  analytics.trackAnalytics({ name: 'Page Viewed', path: '/' })
  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(loadCount, 0)
  assert.equal(adapter.initialisations, 0)
  assert.deepEqual(adapter.events, [])
})

test('caps the pre-initialisation queue at 50 and drops the oldest event', async () => {
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({ environment: 'production', loadAdapter: () => adapter })

  for (let index = 0; index < 51; index += 1) {
    analytics.trackAnalytics({
      name: 'Assessment CTA Clicked',
      path: index === 0 ? '/about/' : '/contact/',
      placement: index === 0 ? 'hero' : 'section',
      destination: 'contact',
    })
  }

  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(adapter.events.length, 50)
  assert.equal(adapter.events[0]?.properties.page, 'contact')
  assert.equal(adapter.events[0]?.properties.placement, 'section')
})

test('suppresses repeated page exposure after query, hash and slash changes', async () => {
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({ environment: 'production', loadAdapter: () => adapter })

  analytics.trackAnalytics({ name: 'Page Viewed', path: '/about/' })
  analytics.trackAnalytics({ name: 'Page Viewed', path: '/about?utm_source=private' })
  analytics.trackAnalytics({ name: 'Page Viewed', path: '/about/#standard' })
  analytics.trackAnalytics({ name: 'Page Viewed', path: '/engagement/' })
  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.deepEqual(
    adapter.events.map((event) => event.properties.page),
    ['about', 'engagement'],
  )
})

test('rebuilds valid events from allowlisted names, keys and enum values', async () => {
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({ environment: 'production', loadAdapter: () => adapter })

  const events = [
    { name: 'Page Viewed', path: '/unknown?email=person@example.com', referrer: 'private' },
    {
      name: 'Assessment CTA Clicked',
      path: '/about/?gclid=private',
      placement: 'header',
      destination: 'contact_enquire',
      organisation: 'Private Firm',
    },
    { name: 'Enquiry Started', path: '/contact/', placement: 'form', field: 'email' },
    { name: 'Enquiry Submitted', path: '/contact/', placement: 'form', message: 'private details' },
    {
      name: 'Enquiry Submission Failed',
      path: '/contact/',
      placement: 'form',
      failure_stage: 'response',
      error: 'Formspree response text',
    },
  ]

  for (const event of events) {
    analytics.trackAnalytics(event)
  }
  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.deepEqual(
    adapter.events.map((event) => event.name),
    [
      'Page Viewed',
      'Assessment CTA Clicked',
      'Enquiry Started',
      'Enquiry Submitted',
      'Enquiry Submission Failed',
    ],
  )

  const encoded = JSON.stringify(adapter.events)
  for (const forbidden of [
    'person@example.com',
    'gclid',
    'private',
    'referrer',
    'organisation',
    'field',
    'message',
    'error',
    'Formspree',
  ]) {
    assert.equal(encoded.includes(forbidden), false, `removed ${forbidden}`)
  }
})

test('drops invalid event names and invalid event-specific enum values', async () => {
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({ environment: 'production', loadAdapter: () => adapter })

  for (const event of [
    { name: 'User Identified', path: '/' },
    { name: 'Assessment CTA Clicked', path: '/', placement: 'nav', destination: 'contact' },
    { name: 'Assessment CTA Clicked', path: '/', placement: 'hero', destination: 'external' },
    { name: 'Enquiry Started', path: '/contact/', placement: 'field' },
    { name: 'Enquiry Submitted', path: '/contact/', placement: 'button' },
    {
      name: 'Enquiry Submission Failed',
      path: '/contact/',
      placement: 'form',
      failure_stage: 'server',
    },
  ]) {
    analytics.trackAnalytics(event)
  }
  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.deepEqual(adapter.events, [])
})

test('keeps loader, initialisation and delivery failures fail-open', async () => {
  const loaderFailure = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => Promise.reject(new Error('load failed')),
  })
  assert.doesNotThrow(() => {
    loaderFailure.trackAnalytics({ name: 'Page Viewed', path: '/' })
    loaderFailure.initialiseAnalytics()
  })

  const initialisationFailure = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => ({
      initialise: () => Promise.reject(new Error('init failed')),
      track: () => undefined,
    }),
  })
  assert.doesNotThrow(() => initialisationFailure.initialiseAnalytics())

  const deliveryFailure = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => ({
      initialise: () => undefined,
      track: () => {
        throw new Error('track failed')
      },
    }),
  })
  deliveryFailure.trackAnalytics({ name: 'Page Viewed', path: '/' })
  assert.doesNotThrow(() => deliveryFailure.initialiseAnalytics())

  await settleAnalytics()
  assert.doesNotThrow(() => loaderFailure.trackAnalytics({ name: 'Page Viewed', path: '/about/' }))
  assert.doesNotThrow(() => initialisationFailure.trackAnalytics({ name: 'Page Viewed', path: '/about/' }))
  assert.doesNotThrow(() => deliveryFailure.trackAnalytics({ name: 'Page Viewed', path: '/about/' }))
})

/* ---------------------------------------------------------------------------
 * Plan D-8: the pre-adapter queue survives a full page navigation.
 * ------------------------------------------------------------------------- */

/** Minimal session-storage stand-in with an optional failure mode. */
function createMemoryPersistence(initial: ValidatedAnalyticsEvent[] = [], options: { failing?: boolean } = {}) {
  let stored: ValidatedAnalyticsEvent[] | null = initial.length > 0 ? initial : null
  let loads = 0
  return {
    get stored() {
      return stored
    },
    get loads() {
      return loads
    },
    adapter: {
      load() {
        if (options.failing) throw new Error('storage blocked')
        loads += 1
        const value = stored ?? []
        // Reads clear their own storage so an event is delivered exactly once.
        stored = null
        return value
      },
      save(queue: readonly ValidatedAnalyticsEvent[]) {
        if (options.failing) throw new Error('storage blocked')
        stored = queue.length > 0 ? [...queue] : null
      },
    },
  }
}

test('persists a pre-adapter event and clears storage once it is delivered', async () => {
  const adapter = new MemoryAdapter()
  const persistence = createMemoryPersistence()
  const analytics = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => adapter,
    persistence: persistence.adapter,
  })

  analytics.trackAnalytics({ name: 'Assessment CTA Clicked', path: '/', placement: 'hero', destination: 'contact' })
  assert.equal(persistence.stored?.length, 1)
  assert.equal(persistence.stored?.[0]?.name, 'Assessment CTA Clicked')

  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(adapter.events.length, 1)
  assert.equal(persistence.stored, null)
})

test('restores a queue left by the previous document and clears it on read', async () => {
  const carried: ValidatedAnalyticsEvent[] = [
    {
      name: 'Assessment CTA Clicked',
      properties: { site: 'fintrace-root', environment: 'production', schema_version: 1, page: 'home', placement: 'hero', destination: 'contact' },
    },
  ]
  const adapter = new MemoryAdapter()
  const persistence = createMemoryPersistence(carried)
  const analytics = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => adapter,
    persistence: persistence.adapter,
  })

  assert.equal(persistence.loads, 1)
  assert.equal(persistence.stored, null)

  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(adapter.events.length, 1)
  // The restored event keeps the page it was tracked on, not the new document's.
  assert.equal(adapter.events[0]?.properties.page, 'home')
})

test('caps a restored queue at the same 50-event limit', async () => {
  const carried: ValidatedAnalyticsEvent[] = Array.from({ length: 60 }, (_, index) => ({
    name: 'Page Viewed',
    properties: { site: 'fintrace-root', environment: 'production', schema_version: 1, page: index === 0 ? 'about' : 'home' },
  }))
  const adapter = new MemoryAdapter()
  const analytics = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => adapter,
    persistence: createMemoryPersistence(carried).adapter,
  })

  analytics.initialiseAnalytics()
  await settleAnalytics()

  assert.equal(adapter.events.length, 50)
  assert.equal(adapter.events[0]?.properties.page, 'home')
})

test('development neither reads nor writes the persisted queue', () => {
  const persistence = createMemoryPersistence()
  const analytics = createAnalyticsCore({
    environment: 'development',
    loadAdapter: () => new MemoryAdapter(),
    persistence: persistence.adapter,
  })

  analytics.trackAnalytics({ name: 'Page Viewed', path: '/' })

  assert.equal(persistence.loads, 0)
  assert.equal(persistence.stored, null)
})

test('a failing storage adapter never reaches the caller', async () => {
  const adapter = new MemoryAdapter()
  const failing = createMemoryPersistence([], { failing: true })

  // The browser adapter swallows its own storage failures, so the core sees a
  // working seam; this proves the core still delivers when storage is useless.
  const analytics = createAnalyticsCore({
    environment: 'production',
    loadAdapter: () => adapter,
    persistence: {
      load: () => {
        try {
          return failing.adapter.load()
        } catch {
          return []
        }
      },
      save: () => {
        try {
          failing.adapter.save([])
        } catch {
          // Fail open, exactly as the browser adapter does.
        }
      },
    },
  })

  assert.doesNotThrow(() => analytics.trackAnalytics({ name: 'Page Viewed', path: '/' }))
  analytics.initialiseAnalytics()
  await settleAnalytics()
  assert.equal(adapter.events.length, 1)
})

test('the browser client hands CTA events to the beacon transport', async () => {
  // Read the delivery adapter's source rather than importing the browser
  // module, which needs `window` and the Mixpanel bundle at import time.
  const { readFileSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const source = readFileSync(resolve(import.meta.dirname, '../src/lib/analytics/client.ts'), 'utf8')

  assert.match(source, /BEACON_EVENTS = new Set<[^>]*>\(\['Assessment CTA Clicked'\]\)/)
  assert.match(source, /BEACON_EVENTS\.has\(event\.name\) \? \{ transport: 'sendBeacon' \} : undefined/)
  assert.match(source, /QUEUE_STORAGE_KEY = 'fintrace-analytics-queue'/)
  assert.match(source, /import\.meta\.env\.PROD \? 'production' : 'development'/)
  // The vendor is still loaded from the recorder-free core entry point.
  assert.match(source, /mixpanel-browser\/src\/loaders\/loader-module-core/)
})
