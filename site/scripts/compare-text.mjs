// Compares the built site's rendered text, links and JSON-LD against the
// production baseline manifest. Read-only; prints the first differences.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const repo = resolve(import.meta.dirname, '../..')
const baseline = JSON.parse(readFileSync(resolve(repo, 'documents/guides/parity/production-baseline.json'), 'utf8'))
const base = process.env.PARITY_BASE_URL ?? 'http://127.0.0.1:4332'
const routes = process.argv.slice(2).length > 0 ? process.argv.slice(2) : Object.keys(baseline.routes)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

function normaliseJsonLd(value) {
  if (Array.isArray(value)) return value.map(normaliseJsonLd)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normaliseJsonLd(value[key])]))
  }
  return value
}

let failures = 0
for (const route of routes) {
  const expected = { ...baseline.routes[route] }
  if (route === '/privacy/') {
    // Plan D-13: the notice names the real host after cutover, discloses the
    // session-storage queue added by D-8, and carries the execution date.
    expected.text = expected.text
      // The notice's update line is upper-cased by the stylesheet.
      .replace('LAST UPDATED: 31 AUGUST 2026', 'LAST UPDATED: 5 SEPTEMBER 2026')
      .replace(
        'The site is statically hosted by GitHub Pages. GitHub may handle standard request, device and security information when it serves the site under its privacy statement.',
        'The site is served by Cloudflare. Cloudflare may handle standard request, device and security information when it serves the site under its privacy policy.',
      )
      .replace(
        'The analytics setup uses a browser identifier stored in local storage.',
        'The analytics setup uses a browser identifier stored in local storage and a short queue of pending event names in session storage.',
      )
    expected.links = expected.links
      .map((href) =>
        href === 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement'
          ? 'https://www.cloudflare.com/privacypolicy/'
          : href,
      )
      .sort()
  }
  await page.goto(base + route, { waitUntil: 'load' })
  // Reveal every deferred section so `content-visibility` cannot hide copy.
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let top = 0; top < height; top += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), top)
    await page.waitForTimeout(60)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)

  const actual = await page.evaluate(() => ({
    text: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
    links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).sort(),
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
    meta: Object.fromEntries(
      [...document.querySelectorAll('meta[name], meta[property]')].map((element) => [
        element.getAttribute('name') || element.getAttribute('property'),
        element.getAttribute('content'),
      ]),
    ),
    title: document.title,
    lang: document.documentElement.lang,
  }))

  const problems = []
  if (actual.title !== expected.title) problems.push(`title: ${JSON.stringify(actual.title)} != ${JSON.stringify(expected.title)}`)
  if (actual.lang !== expected.lang) problems.push(`lang: ${actual.lang} != ${expected.lang}`)
  if (actual.text !== expected.text) {
    const a = actual.text.split(' ')
    const b = expected.text.split(' ')
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i += 1
    problems.push(`text diverges at word ${i}:\n  expected: ...${b.slice(Math.max(0, i - 6), i + 14).join(' ')}\n  actual:   ...${a.slice(Math.max(0, i - 6), i + 14).join(' ')}`)
  }
  const expectedLinks = JSON.stringify(expected.links)
  const actualLinks = JSON.stringify(actual.links)
  if (expectedLinks !== actualLinks) {
    const missing = expected.links.filter((href) => !actual.links.includes(href))
    const extra = actual.links.filter((href) => !expected.links.includes(href))
    problems.push(`links missing ${JSON.stringify(missing)} extra ${JSON.stringify(extra)}`)
  }
  const expectedGraph = JSON.stringify(expected.jsonLd)
  const actualGraph = JSON.stringify(actual.jsonLd.map(normaliseJsonLd))
  if (expectedGraph !== actualGraph) problems.push(`json-ld differs:\n  expected ${expectedGraph}\n  actual   ${actualGraph}`)

  // `og:locale` is the one recorded metadata exception (plan D-12); Next's
  // `next-size-adjust` marker is deliberately dropped.
  const expectedMeta = { ...expected.meta, 'og:locale': 'en_AU' }
  delete expectedMeta['next-size-adjust']
  for (const [key, value] of Object.entries(expectedMeta)) {
    if (actual.meta[key] !== value) problems.push(`meta ${key}: ${JSON.stringify(actual.meta[key])} != ${JSON.stringify(value)}`)
  }

  if (problems.length === 0) {
    process.stdout.write(`PASS ${route}\n`)
  } else {
    failures += 1
    process.stdout.write(`FAIL ${route}\n${problems.map((problem) => `  - ${problem}`).join('\n')}\n`)
  }
}

await browser.close()
process.exit(failures === 0 ? 0 : 1)
