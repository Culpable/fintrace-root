import { expect, test } from '@playwright/test'
import {
  ACCESSIBILITY_ROUTES,
  PUBLIC_ROUTES,
  UNKNOWN_ROUTE,
  blockExternalRequests,
  waitForStableDocument,
} from './agent.routes'

for (const route of ACCESSIBILITY_ROUTES) {
  test(`${route} renders without overflow or browser errors`, async ({ page }) => {
    const errors: string[] = []
    const mixpanelTrackRequest =
      route === '/'
        ? page.waitForRequest((request) => {
            const url = new URL(request.url())
            return url.origin === 'https://api-js.mixpanel.com' && url.pathname === '/track/'
          })
        : undefined
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))
    await blockExternalRequests(page)
    await page.goto(route, { waitUntil: 'load' })
    await waitForStableDocument(page)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    if (mixpanelTrackRequest) await mixpanelTrackRequest
    await page.waitForTimeout(150)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
    if (route === UNKNOWN_ROUTE) {
      expect(errors).toEqual(['Failed to load resource: the server responded with a status of 404 (Not Found)'])
    } else {
      expect(errors).toEqual([])
    }
  })
}

test('the skip link moves keyboard focus to the main region', async ({ page }) => {
  await blockExternalRequests(page)
  await page.goto('/', { waitUntil: 'load' })
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#main-content')).toBeFocused()
})

test('every public route presents exactly one visible H1 and one main region', async ({ page }) => {
  await blockExternalRequests(page)
  for (const { route } of PUBLIC_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('main')).toHaveCount(1)
    const heading = page.locator('main h1')
    await expect(heading).toHaveCount(1)
    await expect(heading).toBeVisible()
  }
})
