import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const siteDirectory = resolve(import.meta.dirname, '..')

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1]
}

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  })
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right)
  const middle = Math.floor(ordered.length / 2)
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2
}

function routeFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    return pathname === '/' ? '/' : `${pathname.replace(/\/$/, '')}/`
  } catch {
    return null
  }
}

const outputDirectory = resolve(readArgument('--out', join(siteDirectory, 'dist')))
const budgetPath = resolve(readArgument('--budget', join(siteDirectory, 'performance-budgets.json')))
const lighthouseDirectory = readArgument('--lighthouse', null)
const budgets = JSON.parse(readFileSync(budgetPath, 'utf8'))
const failures = []
const chunkDirectory = join(outputDirectory, '_astro')
const chunkFiles = walk(chunkDirectory).filter((file) => file.endsWith('.js'))
const chunkByPublicPath = new Map(
  chunkFiles.map((file) => [`/${relative(outputDirectory, file).replaceAll('\\', '/')}`, file]),
)
const chunkContributions = { mixpanel: [], three: [], tailwindPlus: [] }

/** Follow static module imports while excluding lazy dynamic imports from initial-route cost. */
function staticDependencyClosure(publicPaths) {
  const pending = [...publicPaths]
  const discovered = new Set()
  while (pending.length > 0) {
    const publicPath = pending.pop()
    if (!publicPath || discovered.has(publicPath)) continue
    discovered.add(publicPath)
    const file = chunkByPublicPath.get(publicPath)
    if (!file) continue
    const source = readFileSync(file, 'utf8')
    const parentUrl = new URL(publicPath, 'https://bulma.com.au')
    for (const match of source.matchAll(/(?:from\s*|import\s*)["']([^"']+\.js)["']/g)) {
      const dependency = new URL(match[1], parentUrl).pathname
      if (!discovered.has(dependency)) pending.push(dependency)
    }
  }
  return discovered
}

for (const file of chunkFiles) {
  const source = readFileSync(file, 'utf8')
  const contribution = { file: basename(file), gzipBytes: gzipSync(source).length }
  if (source.includes('record_sessions_percent') || source.includes('bulma:mixpanel-ready')) chunkContributions.mixpanel.push(contribution)
  if (source.includes('WebGLRenderer') || source.includes('WebGLProgram')) chunkContributions.three.push(contribution)
  if (source.includes('tailwindplus') || source.includes('ElDisclosure')) chunkContributions.tailwindPlus.push(contribution)
}

const routes = {}
for (const [route, budget] of Object.entries(budgets.routes)) {
  const htmlPath = join(outputDirectory, budget.output)
  if (!existsSync(htmlPath)) {
    failures.push(`${route}: missing ${budget.output}`)
    continue
  }

  const html = readFileSync(htmlPath, 'utf8')
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)].map((match) => match[1])
  const islandModules = [...html.matchAll(/(?:component|renderer)-url=["']([^"']+\.js)["']/g)].map((match) => match[1])
  const initialFiles = staticDependencyClosure(new Set([...scripts, ...islandModules]))
  const gzipBytes = [...initialFiles].reduce((total, publicPath) => {
    const file = chunkByPublicPath.get(publicPath)
    if (!file) {
      failures.push(`${route}: missing emitted chunk ${publicPath}`)
      return total
    }
    return total + gzipSync(readFileSync(file)).length
  }, 0)

  routes[route] = { initialScriptFiles: initialFiles.size, initialJavaScriptGzipBytes: gzipBytes }
  if (gzipBytes > budget.baselineInitialJavaScriptGzipBytes) {
    failures.push(`${route}: initial JavaScript ${gzipBytes} exceeds baseline ${budget.baselineInitialJavaScriptGzipBytes}`)
  }
  for (const contribution of chunkContributions.three) {
    if (html.includes(contribution.file)) failures.push(`${route}: initial HTML references Three.js chunk ${contribution.file}`)
  }
}

const mixpanelCoreBytes = Math.max(0, ...chunkContributions.mixpanel.map((entry) => entry.gzipBytes))
if (mixpanelCoreBytes > budgets.mixpanelCoreGzipCeilingBytes) failures.push(`Mixpanel core ${mixpanelCoreBytes} exceeds ${budgets.mixpanelCoreGzipCeilingBytes}`)
if (chunkContributions.tailwindPlus.length > 0) failures.push(`Tailwind Plus entered the active build: ${chunkContributions.tailwindPlus.map((entry) => entry.file).join(', ')}`)

const lighthouse = {}
if (lighthouseDirectory) {
  for (const file of walk(resolve(lighthouseDirectory)).filter((entry) => entry.endsWith('.json'))) {
    let report
    try {
      report = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      continue
    }
    const route = routeFromUrl(report.finalUrl ?? report.requestedUrl)
    const savingsBytes = report.audits?.['unused-javascript']?.details?.overallSavingsBytes
    if (!(route in budgets.routes) || typeof savingsBytes !== 'number') continue
    lighthouse[route] ??= []
    lighthouse[route].push(savingsBytes / 1024)
  }

  for (const [route, budget] of Object.entries(budgets.routes)) {
    if (!lighthouse[route]?.length) {
      failures.push(`${route}: no Lighthouse unused-JavaScript reports found`)
      continue
    }
    const routeMedian = median(lighthouse[route])
    lighthouse[route] = { runs: lighthouse[route].length, medianUnusedJavaScriptKiB: routeMedian }
    if (routeMedian > budget.unusedJavaScriptCeilingKiB) failures.push(`${route}: unused JavaScript median ${routeMedian.toFixed(1)} KiB exceeds ${budget.unusedJavaScriptCeilingKiB} KiB`)
    for (const [host, baseline] of Object.entries(budget.baselineUnusedJavaScriptKiB)) {
      if (baseline - routeMedian < budgets.minimumUnusedJavaScriptReductionKiB) failures.push(`${route}: ${host} reduction is less than ${budgets.minimumUnusedJavaScriptReductionKiB} KiB`)
    }
  }
}

const baselineRange = Object.values(budgets.routes).flatMap((route) => Object.values(route.baselineUnusedJavaScriptKiB))
const summary = {
  baselineUnusedJavaScriptRangeKiB: [Math.min(...baselineRange), Math.max(...baselineRange)],
  routes,
  chunkContributions,
  lighthouse,
  failures,
}

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
if (failures.length > 0) process.exitCode = 1
