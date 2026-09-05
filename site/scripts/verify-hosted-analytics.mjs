// Verifies the hosted analytics contract without letting one event reach
// Mixpanel. Usage: node scripts/verify-hosted-analytics.mjs [origin] [outputPath]
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const origin = (process.argv[2] ?? 'https://fintrace.com.au').replace(/\/$/, '')
const outputPath = process.argv[3] ?? 'test-results/hosted-analytics.json'
const ROUTES = ['/', '/about/', '/engagement/', '/contact/', '/privacy/']
const QUEUE_KEY = 'fintrace-analytics-queue'
/** Mixpanel batches ingestion; this clears its flush interval with margin. */
const FLUSH_WAIT_MS = 12_000

const browser = await chromium.launch()
const failures = []
const evidence = { origin, checkedAt: new Date().toISOString(), routes: [], crossNavigation: null, laziness: null }

/** Capture every Mixpanel ingestion attempt without completing one. */
async function newContext() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const requests = []
  await context.route('https://api-js.mixpanel.com/**', async (route) => {
    const request = route.request()
    requests.push({ url: request.url(), method: request.method(), body: request.postData() ?? '' })
    await route.fulfill({ status: 200, contentType: 'text/plain', body: '1' })
  })
  await context.route('https://formspree.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  )
  return { context, requests }
}

/** Decode the events Mixpanel encodes into its ingestion payloads. */
function eventsFrom(requests) {
  const events = []
  for (const request of requests) {
    const encoded = /(?:^|&)data=([^&]*)/.exec(request.body)?.[1] ?? request.body
    let decoded = decodeURIComponent(encoded)
    try {
      decoded = atob(decoded)
    } catch {
      // Already JSON rather than base64.
    }
    try {
      const parsed = JSON.parse(decoded)
      for (const entry of Array.isArray(parsed) ? parsed : [parsed]) {
        if (entry?.event) events.push({ name: entry.event, properties: entry.properties ?? {} })
      }
    } catch {
      // A payload shape this check does not need to read.
    }
  }
  return events
}

// One `Page Viewed` per document, with the route's own page key.
for (const route of ROUTES) {
  const { context, requests } = await newContext()
  const page = await context.newPage()
  await page.goto(origin + route, { waitUntil: 'load' })
  // Intent initialises the vendor immediately rather than after three seconds.
  // Mixpanel batches ingestion, so the wait must clear its flush interval.
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(FLUSH_WAIT_MS)

  const events = eventsFrom(requests)
  const pageViews = events.filter((event) => event.name === 'Page Viewed')
  const expectedPage = route === '/' ? 'home' : route.slice(1, -1)
  if (pageViews.length !== 1) failures.push(`${route}: expected one Page Viewed, saw ${pageViews.length}`)
  else if (pageViews[0].properties.page !== expectedPage) {
    failures.push(`${route}: Page Viewed carried page=${pageViews[0].properties.page}`)
  }
  evidence.routes.push({ route, events: events.map((event) => event.name) })
  await context.close()
}

// Plan D-8: a CTA click before the vendor initialises is delivered by the next
// document, still carrying the page it was clicked on.
{
  const { context, requests } = await newContext()
  const page = await context.newPage()
  await page.goto(`${origin}/about/`, { waitUntil: 'load' })
  await page.click('.eng-footer-meta a[data-analytics-cta]')
  await page.waitForLoadState('load')
  const queuedOnDestination = await page.evaluate((key) => window.sessionStorage.getItem(key), QUEUE_KEY)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(FLUSH_WAIT_MS)

  const events = eventsFrom(requests)
  const cta = events.find((event) => event.name === 'Assessment CTA Clicked')
  if (!cta) failures.push('the pre-initialisation CTA click was never delivered')
  else if (cta.properties.page !== 'about') failures.push(`the restored CTA click carried page=${cta.properties.page}`)
  const cleared = await page.evaluate((key) => window.sessionStorage.getItem(key), QUEUE_KEY)
  if (cleared !== null) failures.push('the session queue was not cleared after delivery')
  evidence.crossNavigation = {
    queuedOnDestination: queuedOnDestination !== null,
    deliveredPage: cta?.properties.page ?? null,
    queueClearedAfterDelivery: cleared === null,
  }
  await context.close()
}

// The vendor chunk must stay outside the critical window, then load exactly once.
{
  const { context } = await newContext()
  const page = await context.newPage()
  const vendorRequests = []
  page.on('request', (request) => {
    if (/loader-module-core/.test(request.url())) vendorRequests.push(request.url())
  })
  await page.goto(`${origin}/`, { waitUntil: 'load' })
  await page.waitForTimeout(2000)
  const beforeIntent = vendorRequests.length
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(3000)
  const afterIntent = vendorRequests.length

  if (beforeIntent !== 0) failures.push(`the Mixpanel chunk loaded ${beforeIntent} times inside the first two seconds`)
  if (afterIntent !== 1) failures.push(`the Mixpanel chunk loaded ${afterIntent} times after intent; expected exactly one`)
  evidence.laziness = { beforeIntent, afterIntent }
  await context.close()
}

await browser.close()

mkdirSync(dirname(resolve(outputPath)), { recursive: true })
writeFileSync(resolve(outputPath), `${JSON.stringify({ ...evidence, failures }, null, 2)}\n`)

if (failures.length > 0) {
  process.stdout.write(`FAIL hosted analytics\n${failures.map((failure) => `  - ${failure}`).join('\n')}\n`)
  process.exit(1)
}
process.stdout.write('PASS hosted analytics: one Page Viewed per route, the queued CTA click survives navigation, the vendor chunk stays lazy\n')
