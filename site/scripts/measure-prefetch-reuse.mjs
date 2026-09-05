// Measures whether an Astro hover prefetch is actually reused by the following
// navigation once the Worker sends `Vary: Accept` (plan D-17).
// Usage: node scripts/measure-prefetch-reuse.mjs [baseUrl]
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://127.0.0.1:8787'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

const documentRequests = []
page.on('request', (request) => {
  if (request.resourceType() === 'document' || request.url().endsWith('/about/')) {
    documentRequests.push({ url: request.url(), accept: request.headers().accept })
  }
})

await page.goto(`${base}/`, { waitUntil: 'load' })
await page.hover('.eng-header-nav a[href="/about/"]')
await page.waitForTimeout(1500)
const prefetched = documentRequests.filter((entry) => entry.url.endsWith('/about/'))

await page.click('.eng-header-nav a[href="/about/"]')
await page.waitForLoadState('load')

const timing = await page.evaluate(() => {
  const entry = performance.getEntriesByType('navigation')[0]
  return { transferSize: entry.transferSize, deliveryType: entry.deliveryType ?? '', decodedBodySize: entry.decodedBodySize }
})

process.stdout.write(
  [
    `prefetch requests for /about/: ${prefetched.length}`,
    ...prefetched.map((entry) => `  accept: ${entry.accept}`),
    `navigation transferSize: ${timing.transferSize}`,
    `navigation decodedBodySize: ${timing.decodedBodySize}`,
    `navigation deliveryType: ${JSON.stringify(timing.deliveryType)}`,
    `reused from cache: ${timing.deliveryType === 'cache' || timing.transferSize === 0}`,
    '',
  ].join('\n'),
)

await browser.close()
