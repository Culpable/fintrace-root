import { readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { expect, test } from '@playwright/test'
import { PUBLIC_ROUTES, blockExternalRequests, waitForStableDocument } from './agent.routes.ts'

const performanceBudgets = {
  htmlGzipBytes: 30_000,
  cssGzipBytes: 30_000,
  initialJavaScriptGzipBytes: 250_000,
  testimonialBytes: 45_000,
} as const

function outputFileForRoute(route: string) {
  return route === '/' ? resolve('dist/index.html') : resolve('dist', route.slice(1), 'index.html')
}

function localResourcePaths(html: string, expression: RegExp) {
  return [...new Set([...html.matchAll(expression)].map((match) => match[1]).filter((path) => path.startsWith('/')))]
}

function gzipBytes(paths: string[]) {
  return paths.reduce((total, path) => total + gzipSync(readFileSync(resolve('dist', path.slice(1)))).byteLength, 0)
}

for (const { route } of PUBLIC_ROUTES) {
  test(`${route} stays within static first-load budgets`, () => {
    const html = readFileSync(outputFileForRoute(route), 'utf8')
    const stylesheets = localResourcePaths(html, /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)
    const scripts = localResourcePaths(html, /<script\b[^>]*src=["']([^"']+)["']/gi)

    expect(gzipSync(html).byteLength).toBeLessThanOrEqual(performanceBudgets.htmlGzipBytes)
    expect(gzipBytes(stylesheets)).toBeLessThanOrEqual(performanceBudgets.cssGzipBytes)
    expect(gzipBytes(scripts)).toBeLessThanOrEqual(performanceBudgets.initialJavaScriptGzipBytes)
    expect(scripts.every((path) => extname(path) === '.js')).toBe(true)
  })
}

test('the testimonial portrait is right-sized and deferred', () => {
  const imagePath = resolve('public/images/testimonial/nick-brookes.png')
  const image = readFileSync(imagePath)
  expect(image.readUInt32BE(16)).toBeLessThanOrEqual(252)
  expect(image.readUInt32BE(20)).toBeLessThanOrEqual(252)
  expect(statSync(imagePath).size).toBeLessThanOrEqual(performanceBudgets.testimonialBytes)

  for (const route of ['/', '/about/']) {
    const html = readFileSync(outputFileForRoute(route), 'utf8')
    expect(html).toMatch(/<img\b[^>]*src=["']\/images\/testimonial\/nick-brookes\.png["'][^>]*loading=["']lazy["']/i)
    expect(html).not.toMatch(/<link\b[^>]*rel=["']preload["'][^>]*nick-brookes\.png/i)
  }
})

for (const fragment of ['proof', 'testimony', 'engage']) {
  test(`the cold #${fragment} route lands on its deferred target`, async ({ page }) => {
    await blockExternalRequests(page)
    await page.goto(`/#${fragment}`, { waitUntil: 'load' })
    await waitForStableDocument(page)
    await expect
      .poll(() =>
        page.locator(`#${fragment}`).evaluate((element) => {
          const scrollMargin = Number.parseFloat(getComputedStyle(element).scrollMarginTop)
          return Math.abs(element.getBoundingClientRect().top - scrollMargin)
        }),
      )
      .toBeLessThanOrEqual(2)
  })
}
