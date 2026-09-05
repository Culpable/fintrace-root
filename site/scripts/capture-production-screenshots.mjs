// Captures production reference screenshots for the parity gate.
// Usage: node .capture-screens.mjs [--base=<origin>] [--out=<dir>] [name ...]
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const argument = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=', 2)[1] ?? fallback

const base = argument('base', 'https://fintrace.com.au')
const outDir = resolve(argument('out', '/Users/sacino/fintrace-root/documents/guides/parity/screenshots/production'))
mkdirSync(outDir, { recursive: true })

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 900 } }
const ROUTES = [
  ['home', '/'],
  ['about', '/about/'],
  ['engagement', '/engagement/'],
  ['contact', '/contact/'],
  ['privacy', '/privacy/'],
  ['not-found', '/__missing-parity-probe/'],
]
const CONTACT_STATES = ['sending', 'success', 'error']

const requested = process.argv.filter((a) => !a.startsWith('--')).slice(2)
const wanted = (name) => requested.length === 0 || requested.includes(name)

// Settles every reveal, count-up and looped animation so two captures of the
// same page agree. Canvases are masked by the comparison, not frozen here.
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {})
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let top = 0; top < height; top += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), top)
    await page.waitForTimeout(90)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  // Every image that this origin serves must be decoded before the capture.
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0))
  // Freeze looping CSS animations at a fixed point so the capture is stable.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.currentTime = 0
      animation.pause()
    }
  })
  await page.waitForTimeout(200)
}

// Chromium only encodes PNG and JPEG, so WebP is produced from the PNG buffer.
async function writeCapture(page, name) {
  // A full-page capture over the live WebGL hero can fail while the compositor
  // is mid-frame, so the capture is retried before it is treated as an error.
  let png
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      png = await page.screenshot({ fullPage: true, type: 'png', animations: 'disabled' })
      break
    } catch (error) {
      if (attempt === 8) throw error
      await page.waitForTimeout(500)
    }
  }
  await sharp(png).webp({ lossless: true }).toFile(resolve(outDir, `${name}.webp`))
  process.stderr.write(`captured ${name}\n`)
}

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })

  for (const [routeName, routePath] of ROUTES) {
    const name = `${routeName}-${viewportName}`
    if (!wanted(name)) continue
    const page = await context.newPage()
    await page.goto(base + routePath, { waitUntil: 'load' })
    await settle(page)
    await writeCapture(page, name)
    await page.close()
  }

  for (const state of CONTACT_STATES) {
    const name = `contact-${state}-${viewportName}`
    if (!wanted(name)) continue
    const page = await context.newPage()
    // Formspree is intercepted so no enquiry ever leaves the machine.
    await page.route('https://formspree.io/**', async (route) => {
      if (state === 'sending') await new Promise(() => {})
      else if (state === 'error') await route.fulfill({ status: 500, contentType: 'application/json', body: '{"errors":[{"message":"Parity capture failure"}]}' })
      else await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    })
    await page.goto(`${base}/contact/`, { waitUntil: 'load' })
    await settle(page)
    await page.fill('#contact-name', 'Parity Capture')
    await page.fill('#contact-email', 'parity@example.com')
    await page.fill('#contact-organisation', 'Parity Chambers')
    await page.fill('#contact-message', 'Reference capture for the migration parity gate.')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(state === 'sending' ? 700 : 1400)
    await writeCapture(page, name)
    await page.close()
  }

  await context.close()
}

await browser.close()
