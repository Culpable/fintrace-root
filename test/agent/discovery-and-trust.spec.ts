import { expect, test } from '@playwright/test'
import { PUBLIC_ROUTES, USER_TRIGGERED_AGENT_USER_AGENTS } from './agent.routes'

const origin = 'https://fintrace.com.au'
const trustRoutes = ['/about/', '/contact/', '/privacy/'] as const
const sharedWordWindow = 8

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
}

function visibleText(html: string) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function mainBodyText(html: string) {
  const mainMatches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)]
  expect(mainMatches).toHaveLength(1)
  return visibleText(mainMatches[0][1].replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, ' '))
}

function tokens(value: string) {
  return value.toLocaleLowerCase('en-AU').match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
}

function wordWindows(values: string[]) {
  const windows = new Map<string, number[]>()
  for (let start = 0; start <= values.length - sharedWordWindow; start += 1) {
    const key = values.slice(start, start + sharedWordWindow).join('\0')
    windows.set(key, [...(windows.get(key) ?? []), start])
  }
  return windows
}

test('llms.txt is a concise v2 canonical-page index', async ({ request }) => {
  const response = await request.get('/llms.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toMatch(/^text\/plain;\s*charset=utf-8$/i)
  const source = await response.text()
  const lines = source.split(/\r?\n/)

  expect(lines.filter((line) => /^# /.test(line))).toEqual(['# FinTrace'])
  expect(lines.some((line) => /^> \S/.test(line))).toBe(true)
  expect(lines.filter((line) => /^## /.test(line))).toEqual(['## Public pages'])
  expect(source).toContain('The user must review and submit the visible form themselves.')
  expect(source).not.toMatch(/\.md(?:\b|\))/i)
  expect(source).not.toContain('/llms-full.txt')
  expect(source).not.toMatch(/TODO|TBD|placeholder/i)
  const destinations = [...source.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1])

  for (const { route } of PUBLIC_ROUTES) {
    const canonical = new URL(route, origin).toString()
    expect(destinations.filter((destination) => destination === canonical)).toHaveLength(1)
  }
})

test('robots.txt and sitemap.xml expose every public route to relevant agents', async ({ request }) => {
  const [robotsResponse, sitemapResponse] = await Promise.all([request.get('/robots.txt'), request.get('/sitemap.xml')])
  expect(robotsResponse.status()).toBe(200)
  expect(sitemapResponse.status()).toBe(200)
  const robots = await robotsResponse.text()
  const sitemap = await sitemapResponse.text()

  expect(robots).toMatch(/user-agent:\s*\*/i)
  expect(robots).toMatch(/allow:\s*\//i)
  expect(robots).not.toMatch(/disallow:\s*\S/i)
  expect(robots).toContain(`${origin}/sitemap.xml`)
  for (const userAgent of USER_TRIGGERED_AGENT_USER_AGENTS) {
    expect(userAgent.length).toBeGreaterThan(0)
    expect(robots).toMatch(/user-agent:\s*\*/i)
  }
  for (const { route } of PUBLIC_ROUTES) {
    expect(sitemap).toContain(`<loc>${new URL(route, origin).toString()}</loc>`)
  }
  expect((sitemap.match(/<loc>/g) ?? []).length).toBe(PUBLIC_ROUTES.length)
})

for (const { route } of PUBLIC_ROUTES) {
  test(`${route} publishes complete self-referential metadata and structured identity`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    const expectedUrl = new URL(route, origin).toString()

    expect(title).not.toBe('')
    expect(description).not.toBeNull()
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(title)
    expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toBe(description)
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(expectedUrl)
    expect(await page.locator('meta[name="twitter:title"]').getAttribute('content')).toBe(title)
    expect(await page.locator('meta[name="twitter:description"]').getAttribute('content')).toBe(description)
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(expectedUrl)
    await expect(page.locator('link[rel="describedby"][href="/llms.txt"]')).toHaveCount(1)

    const structuredDataLocator = page.locator('script[type="application/ld+json"]')
    await expect(structuredDataLocator).toHaveCount(1)
    const structuredData = JSON.parse((await structuredDataLocator.textContent()) ?? '{}') as {
      '@context'?: string
      '@graph'?: Array<Record<string, unknown>>
    }
    expect(structuredData['@context']).toBe('https://schema.org')
    const types = structuredData['@graph']?.map((item) => item['@type']) ?? []
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage']))
    expect(types.includes('Service')).toBe(route === '/')
  })
}

test('trust pages are substantive, distinct and discoverable', async ({ request }) => {
  const documents = new Map<string, string>()
  for (const route of trustRoutes) {
    documents.set(route, await (await request.get(route)).text())
  }
  const discovery = [
    await (await request.get('/')).text(),
    await (await request.get('/sitemap.xml')).text(),
    await (await request.get('/llms.txt')).text(),
  ]

  const entries = trustRoutes.map((route) => {
    const body = mainBodyText(documents.get(route) ?? '')
    return { route, body, tokens: tokens(body), shared: new Set<number>() }
  })

  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex]
      const right = entries[rightIndex]
      const leftWindows = wordWindows(left.tokens)
      const rightWindows = wordWindows(right.tokens)
      for (const [key, leftStarts] of leftWindows) {
        const rightStarts = rightWindows.get(key)
        if (!rightStarts) continue
        for (const start of leftStarts) {
          for (let offset = 0; offset < sharedWordWindow; offset += 1) left.shared.add(start + offset)
        }
        for (const start of rightStarts) {
          for (let offset = 0; offset < sharedWordWindow; offset += 1) right.shared.add(start + offset)
        }
      }
    }
  }

  for (const entry of entries) {
    const uniqueText = entry.tokens.filter((_token, index) => !entry.shared.has(index)).join(' ')
    expect(
      uniqueText.length,
      `${entry.route} needs at least 500 distinct trust-page characters.`,
    ).toBeGreaterThanOrEqual(500)
    for (const surface of discovery) expect(surface).toContain(entry.route)
  }

  const privacy = documents.get('/privacy/') ?? ''
  for (const marker of ['GitHub Pages', 'Mixpanel', 'Formspree', 'Last updated:']) {
    expect(privacy).toContain(marker)
  }
})
