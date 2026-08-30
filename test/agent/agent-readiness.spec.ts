import { expect, test } from '@playwright/test'
import { PUBLIC_ROUTES, UNKNOWN_ROUTE, USER_TRIGGERED_AGENT_USER_AGENTS, blockExternalRequests } from './agent.routes'

const challengePatterns = [/verify (?:that )?you are human/i, /checking your browser/i, /captcha/i, /access denied/i]
const injectionPatterns = [
  /ignore (?:all )?(?:previous|prior) instructions/i,
  /reveal (?:the )?(?:system|developer) prompt/i,
  /(?:system|developer) message:/i,
  /act as (?:the )?(?:system|assistant)/i,
  /(?:run|call|invoke) (?:the )?(?:tool|function)/i,
]
const canonicalOrigin = 'https://fintrace.com.au'

const browserIdentityAssets = [
  { selector: 'link[rel="icon"][href^="/favicon.ico"]', contentType: 'image/vnd.microsoft.icon' },
  { selector: 'link[rel="icon"][href^="/icon.svg"]', contentType: 'image/svg+xml' },
  { selector: 'link[rel="apple-touch-icon"][href^="/apple-icon.png"]', contentType: 'image/png' },
] as const

test('declared browser identity assets use their production media types', async ({ page, request }) => {
  await blockExternalRequests(page)
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  for (const { selector, contentType } of browserIdentityAssets) {
    const href = await page.locator(selector).getAttribute('href')
    expect(href).toBeTruthy()

    const response = await request.get(href!)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe(contentType)
  }
})

test('slashless public routes redirect to their canonical directory URL', async ({ request }) => {
  for (const { route } of PUBLIC_ROUTES.filter(({ route }) => route !== '/')) {
    const slashlessRoute = route.slice(0, -1)
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(slashlessRoute, { method, maxRedirects: 0 })

      expect(response.status()).toBe(301)
      expect(response.headers().location).toBe(route)
    }
  }
})

for (const { route, marker } of PUBLIC_ROUTES) {
  test(`${route} is substantive and readable without JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await blockExternalRequests(page)
    const requestedUrl = new URL(route, baseURL).toString()
    const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBe(200)
    expect(new URL(response?.url() ?? page.url()).pathname).toBe(route)
    await expect(page.locator('main')).toHaveCount(1)
    const heading = page.locator('main h1')
    await expect(heading).toHaveCount(1)
    await expect(heading).toBeVisible()
    await expect(page.locator('main')).toContainText(marker)
    expect((await page.locator('main').innerText()).length).toBeGreaterThanOrEqual(100)

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveCount(1)
    expect(new URL((await canonical.getAttribute('href')) ?? '', requestedUrl).toString()).toBe(
      new URL(route, canonicalOrigin).toString(),
    )
    await expect(page.locator('link[rel="describedby"][href="/llms.txt"]')).toHaveCount(1)

    const html = await page.content()
    expect(challengePatterns.filter((pattern) => pattern.test(html))).toEqual([])
    expect(/<meta\b[^>]*http-equiv=["']?refresh/i.test(html)).toBe(false)

    const hiddenAgentText = await page
      .locator('[hidden], [aria-hidden="true"], [aria-label], [alt], [title]')
      .evaluateAll((elements) =>
        elements
          .map((element) =>
            [
              element.textContent,
              element.getAttribute('aria-label'),
              element.getAttribute('alt'),
              element.getAttribute('title'),
            ]
              .filter(Boolean)
              .join(' '),
          )
          .join('\n'),
      )
    expect(injectionPatterns.filter((pattern) => pattern.test(hiddenAgentText))).toEqual([])
    await context.close()
  })

  for (const userAgent of USER_TRIGGERED_AGENT_USER_AGENTS) {
    test(`${route} has browser parity for ${userAgent}`, async ({ request }) => {
      const browserResponse = await request.get(route)
      const agentResponse = await request.get(route, { headers: { 'user-agent': userAgent } })
      expect(agentResponse.status()).toBe(browserResponse.status())
      expect(agentResponse.headers()['content-type']).toBe(browserResponse.headers()['content-type'])
      expect(await agentResponse.text()).toBe(await browserResponse.text())
    })
  }
}

test('an unknown route returns a recoverable real error', async ({ request }) => {
  const response = await request.get(UNKNOWN_ROUTE)
  expect(response.status()).toBe(404)
  expect(await response.text()).toMatch(/<a\b[^>]*href=["']\/(?:["']|[^"']*["'])[^>]*>[^<]+<\/a>/i)
})
