// Runs the DESIGN.md hero matrix headed, on the real GPU.
// Usage: node scripts/verify-hero-matrix.mjs [baseUrl]
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://127.0.0.1:4332'
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1998, height: 750 },
  { width: 2560, height: 1080 },
  { width: 3425, height: 1245 },
  { width: 1024, height: 768 },
  { width: 900, height: 1080 },
  { width: 390, height: 900 },
]

// Headed Chromium on macOS uses the real GPU, which the WebGL scene needs.
const browser = await chromium.launch({ headless: false })
let failures = 0

async function openHome(viewport) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.goto(`${base}/`, { waitUntil: 'load' })
  return { context, page, problems }
}

for (const viewport of VIEWPORTS) {
  const { context, page, problems } = await openHome(viewport)

  // Intent activates the scene before the three-second timer.
  await page.mouse.move(viewport.width / 2, viewport.height / 2)
  await page.waitForFunction(() => document.querySelectorAll('.eng-scene-layer canvas').length === 1, null, { timeout: 15_000 })
    .catch(() => problems.push('the hero canvas never appeared after intent'))
  await page.waitForTimeout(1500)

  const state = await page.evaluate(() => ({
    canvases: document.querySelectorAll('.eng-scene-layer canvas').length,
    ready: document.querySelector('.eng-scene-layer')?.classList.contains('is-ready') ?? false,
    wideVisible: getComputedStyle(document.querySelector('.eng-fallback-wide')).display !== 'none',
    compactVisible: getComputedStyle(document.querySelector('.eng-fallback-compact')).display !== 'none',
    actionsVisible: [...document.querySelectorAll('.eng-hero-ctas a')].every((a) => a.getBoundingClientRect().width > 0),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))

  if (state.canvases !== 1) problems.push(`expected one hero canvas, found ${state.canvases}`)
  if (!state.ready) problems.push('the scene layer never reached is-ready')
  if (state.wideVisible === state.compactVisible) problems.push('exactly one fallback composition must be displayed')
  if (!state.actionsVisible) problems.push('a hero action is not visible')
  if (state.overflow > 0) problems.push(`horizontal overflow: ${state.overflow}px`)

  const label = `${viewport.width}x${viewport.height}`
  if (problems.length === 0) process.stdout.write(`PASS hero ${label} (${state.compactVisible ? 'compact' : 'wide'})\n`)
  else {
    failures += 1
    process.stdout.write(`FAIL hero ${label}\n${problems.map((problem) => `  - ${problem}`).join('\n')}\n`)
  }
  await context.close()
}

// Live resize must keep the same canvas element rather than remounting it.
{
  const context = await browser.newContext({ viewport: { width: 3425, height: 1245 } })
  const page = await context.newPage()
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.mouse.move(1000, 500)
  await page.waitForFunction(() => document.querySelector('.eng-scene-layer canvas') !== null, null, { timeout: 15_000 })
  await page.evaluate(() => { window.__heroCanvas = document.querySelector('.eng-scene-layer canvas') })
  for (const size of [{ width: 2560, height: 1080 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size)
    await page.waitForTimeout(600)
  }
  const same = await page.evaluate(() => window.__heroCanvas === document.querySelector('.eng-scene-layer canvas'))
  if (same) process.stdout.write('PASS hero live resize retains the same canvas\n')
  else { failures += 1; process.stdout.write('FAIL hero live resize replaced the canvas\n') }
  await context.close()
}

// A blocked WebGL context must leave the designed static fallback usable.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const problems = []
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).includes('webgl')) return null
      return original.call(this, type, ...rest)
    }
  })
  await page.goto(`${base}/`, { waitUntil: 'load' })
  await page.mouse.move(700, 400)
  await page.waitForTimeout(2500)
  const state = await page.evaluate(() => ({
    canvases: document.querySelectorAll('.eng-scene-layer canvas').length,
    fallbackOpacity: getComputedStyle(document.querySelector('.eng-hero-fallback')).opacity,
    headlineVisible: document.querySelector('.eng-display')?.getBoundingClientRect().height > 0,
  }))
  if (state.canvases !== 0) problems.push(`a canvas survived a blocked WebGL context (${state.canvases})`)
  if (Number(state.fallbackOpacity) < 1) problems.push(`the fallback is not at full opacity (${state.fallbackOpacity})`)
  if (!state.headlineVisible) problems.push('the headline is not visible')
  if (problems.length === 0) process.stdout.write('PASS hero forced WebGL failure keeps the designed fallback\n')
  else { failures += 1; process.stdout.write(`FAIL hero forced WebGL failure\n${problems.map((p) => `  - ${p}`).join('\n')}\n`) }
  await context.close()
}

await browser.close()
process.exit(failures === 0 ? 0 : 1)
