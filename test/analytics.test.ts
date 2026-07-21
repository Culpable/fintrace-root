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
    { name: 'Matter Enquiry Started', path: '/contact/', placement: 'form', field: 'email' },
    { name: 'Matter Enquiry Submitted', path: '/contact/', placement: 'form', message: 'private details' },
    {
      name: 'Matter Enquiry Submission Failed',
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
      'Matter Enquiry Started',
      'Matter Enquiry Submitted',
      'Matter Enquiry Submission Failed',
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
    { name: 'Matter Enquiry Started', path: '/contact/', placement: 'field' },
    { name: 'Matter Enquiry Submitted', path: '/contact/', placement: 'button' },
    {
      name: 'Matter Enquiry Submission Failed',
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
