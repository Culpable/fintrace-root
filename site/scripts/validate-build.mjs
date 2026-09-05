import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const siteDirectory = resolve(import.meta.dirname, '..')
const outputDirectory = resolve(siteDirectory, 'dist')
const requiredOutputs = [
  'index.html',
  'about/index.html',
  'pricing/index.html',
  'contact/index.html',
  'privacy-policy/index.html',
  '404.html',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  '_headers',
]
const failures = []

for (const output of requiredOutputs) {
  if (!existsSync(resolve(outputDirectory, output))) failures.push(`Missing dist/${output}`)
}

if (failures.length === 0) {
  const sourceFiles = readdirSync(resolve(siteDirectory, 'src'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && ['.astro', '.css', '.js', '.jsx', '.ts', '.tsx'].includes(extname(entry.name)))
    .map((entry) => resolve(entry.parentPath, entry.name))

  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8')
    if (/prefers-(?:color-scheme|reduced-motion)/.test(source)) failures.push(`${file}: forbidden preference branch`)
    if (/role=["']image["']/.test(source)) failures.push(`${file}: forbidden role=image`)
  }

  const headers = readFileSync(resolve(outputDirectory, '_headers'), 'utf8')
  if (headers.includes('{{SCRIPT_HASHES}}')) failures.push('dist/_headers contains an unresolved script hash token')
  if (!/^\/_astro\/\*$/m.test(headers)) failures.push('dist/_headers lacks the immutable /_astro/* rule')
  if ((headers.match(/Cache-Control:/g) ?? []).length !== 1) failures.push('dist/_headers must set Cache-Control exactly once')

  const indexHtml = readFileSync(resolve(outputDirectory, 'index.html'), 'utf8')
  if (/rel=["']preload["'][^>]+as=["']font["']/.test(indexHtml)) failures.push('Homepage must not preload fonts')
  if (/<script[^>]+src=["'][^"']*three/i.test(indexHtml)) failures.push('Homepage initial HTML directly references a Three.js-named chunk')
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join('\n')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`Validated ${requiredOutputs.length} required build outputs and source contracts.\n`)
}
