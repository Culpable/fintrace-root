import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import test from 'node:test'

const distDirectory = resolve(import.meta.dirname, '../dist')
const ROUTES = ['/', '/about/', '/engagement/', '/contact/', '/privacy/'] as const

/** Gzip budgets from `documents/guides/agent_readiness.md`. */
const BUDGETS = { htmlGzipBytes: 30_000, cssGzipBytes: 30_000, initialJavaScriptGzipBytes: 250_000 } as const

/** Largest per-route Next.js samples recorded in plan Step 1, for comparison. */
const NEXT_SAMPLES: Record<string, { html: number; css: number; javascript: number }> = {
  '/': { html: 15_326, css: 10_907, javascript: 197_087 },
  '/about/': { html: 6_370, css: 11_605, javascript: 190_969 },
  '/engagement/': { html: 6_002, css: 11_779, javascript: 190_969 },
  '/contact/': { html: 5_626, css: 12_394, javascript: 191_764 },
  '/privacy/': { html: 5_960, css: 11_878, javascript: 190_555 },
}

function documentFor(route: string) {
  return route === '/' ? resolve(distDirectory, 'index.html') : resolve(distDirectory, route.slice(1), 'index.html')
}

function referencedPaths(html: string, pattern: RegExp) {
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]).filter((path) => path.startsWith('/')))]
}

function gzipTotal(paths: string[]) {
  return paths.reduce((total, path) => total + gzipSync(readFileSync(resolve(distDirectory, path.slice(1)))).byteLength, 0)
}

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const htmlDocuments = walk(distDirectory).filter((path) => path.endsWith('.html'))

test('every route, the 404 and the discovery files are built', () => {
  for (const route of ROUTES) assert.equal(statSync(documentFor(route)).isFile(), true, route)
  for (const file of ['404.html', 'robots.txt', 'sitemap.xml', 'llms.txt', '_headers']) {
    assert.equal(statSync(resolve(distDirectory, file)).isFile(), true, file)
  }
  assert.equal(htmlDocuments.length, 6)
})

test('no document ships a client-framework island or an executable inline script', () => {
  for (const path of htmlDocuments) {
    const html = readFileSync(path, 'utf8')
    assert.equal(html.includes('<astro-island'), false, `${path} ships an island`)
    for (const [, attributes] of html.matchAll(/<script\b([^>]*)>/g)) {
      const isJsonLd = /type=["']application\/ld\+json["']/.test(attributes)
      const hasSource = /\bsrc=/.test(attributes)
      assert.equal(isJsonLd || hasSource, true, `${path} has an inline executable script: ${attributes}`)
      if (hasSource) {
        const source = attributes.match(/src=["']([^"']+)["']/)?.[1] ?? ''
        assert.equal(source.startsWith('/_astro/'), true, `${path} loads ${source} from outside /_astro/`)
      }
    }
  }
})

test('every stylesheet is external, so the CSP needs no style hashes', () => {
  for (const path of htmlDocuments) {
    const html = readFileSync(path, 'utf8')
    // The only inline style blocks are the Fonts API `@font-face` declarations,
    // which `style-src 'unsafe-inline'` covers and which contain no selectors.
    for (const [, block] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      assert.match(block, /^@font-face|^:root/, `${path} inlines a non-font stylesheet`)
    }
    assert.match(html, /<link rel="stylesheet" href="\/_astro\//)
  }
})

test('the Three.js and Mixpanel chunks are never referenced by the initial document', () => {
  const chunks = readdirSync(resolve(distDirectory, '_astro')).filter((name) => name.endsWith('.js'))
  const sceneChunk = chunks.find((name) => name.startsWith('evidence-scene.'))
  const vendorChunk = chunks.find((name) => name.startsWith('loader-module-core.'))
  assert.ok(sceneChunk, 'the Three.js chunk is missing')
  assert.ok(vendorChunk, 'the Mixpanel chunk is missing')

  for (const path of htmlDocuments) {
    const html = readFileSync(path, 'utf8')
    assert.equal(html.includes(sceneChunk!), false, `${path} references the Three.js chunk`)
    assert.equal(html.includes(vendorChunk!), false, `${path} references the Mixpanel chunk`)
  }
})

test('no built source contains a motion or colour-scheme media conditional', () => {
  for (const path of walk(distDirectory).filter((file) => /\.(?:html|css|js)$/.test(file))) {
    const body = readFileSync(path, 'utf8')
    assert.equal(body.includes('prefers-reduced-motion'), false, `${path} gates on reduced motion`)
    assert.equal(body.includes('prefers-color-scheme'), false, `${path} gates on colour scheme`)
  }
})

test('_headers carries the complete delivery policy', () => {
  const headers = readFileSync(resolve(distDirectory, '_headers'), 'utf8')
  for (const rule of [
    "Content-Security-Policy: default-src 'self'",
    "script-src 'self'",
    "frame-ancestors 'none'",
    'connect-src \'self\' https://api-js.mixpanel.com https://formspree.io',
    'Permissions-Policy:',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Content-Type: text/plain; charset=utf-8',
    'Cache-Control: public, max-age=31536000, immutable',
    'https://:version.:subdomain.workers.dev/*',
    'X-Robots-Tag: noindex',
  ]) {
    assert.equal(headers.includes(rule), true, `_headers is missing: ${rule}`)
  }
  // The staging hostname was removed after the cutover, so the apex can never
  // inherit a noindex rule; only preview URLs may carry one.
  assert.equal(headers.includes('staging.fintrace.com.au'), false)
  // HSTS stays out until it is approved separately.
  assert.equal(headers.includes('Strict-Transport-Security'), false)
  // The CSP must never need a hash: no inline executable script is emitted.
  assert.equal(/sha256-/.test(headers), false)
})

test('every route stays inside its gzip budget and below the Next.js sample', () => {
  for (const route of ROUTES) {
    const html = readFileSync(documentFor(route), 'utf8')
    const stylesheets = referencedPaths(html, /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)
    const scripts = referencedPaths(html, /<script\b[^>]*src=["']([^"']+)["']/gi)

    const htmlBytes = gzipSync(html).byteLength
    const cssBytes = gzipTotal(stylesheets)
    const javascriptBytes = gzipTotal(scripts)
    const sample = NEXT_SAMPLES[route]

    assert.ok(htmlBytes <= BUDGETS.htmlGzipBytes, `${route} HTML ${htmlBytes} exceeds budget`)
    assert.ok(cssBytes <= BUDGETS.cssGzipBytes, `${route} CSS ${cssBytes} exceeds budget`)
    assert.ok(
      javascriptBytes <= BUDGETS.initialJavaScriptGzipBytes,
      `${route} JavaScript ${javascriptBytes} exceeds budget`,
    )
    assert.ok(
      javascriptBytes < sample.javascript,
      `${route} JavaScript ${javascriptBytes} is not below the Next.js sample ${sample.javascript}`,
    )
  }
})

test('no built document links to a root-relative route without its trailing slash', () => {
  for (const path of htmlDocuments) {
    const html = readFileSync(path, 'utf8')
    for (const [, href] of html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
      const isFile = /\.[a-z0-9]+$/i.test(href)
      assert.equal(isFile || href.endsWith('/'), true, `${path} links to ${href} without a trailing slash`)
    }
  }
})
