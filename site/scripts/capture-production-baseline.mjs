// Captures the production parity baseline from https://fintrace.com.au/.
// Read-only against production; writes documents/guides/parity/production-baseline.json.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const ORIGIN = 'https://fintrace.com.au'
const repo = '/Users/sacino/fintrace-root'
const outDir = resolve(repo, 'documents/guides/parity')
mkdirSync(outDir, { recursive: true })

const ROUTES = ['/', '/about/', '/engagement/', '/contact/', '/privacy/']
const DISCOVERY = ['/robots.txt', '/sitemap.xml', '/llms.txt']
const IMAGES = ['/images/og/fintrace-og.png', '/images/testimonial/nick-brookes.png']
const ICONS = ['/favicon.ico', '/icon.svg', '/apple-icon.png']

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

async function fetchResource(path) {
  const response = await fetch(ORIGIN + path, { redirect: 'manual' })
  const body = Buffer.from(await response.arrayBuffer())
  return {
    path,
    status: response.status,
    contentType: response.headers.get('content-type'),
    cacheControl: response.headers.get('cache-control'),
    bytes: body.length,
    sha256: sha256(body),
    body,
  }
}

const manifest = {
  capturedAt: new Date().toISOString(),
  origin: ORIGIN,
  routes: {},
  discovery: {},
  images: {},
  icons: {},
  fonts: {},
  notFound: null,
}

// --- Discovery, images, icons -------------------------------------------------
for (const path of DISCOVERY) {
  const resource = await fetchResource(path)
  manifest.discovery[path] = {
    status: resource.status,
    contentType: resource.contentType,
    bytes: resource.bytes,
    sha256: resource.sha256,
    text: resource.body.toString('utf8'),
  }
}
for (const path of IMAGES) {
  const r = await fetchResource(path)
  manifest.images[path] = { status: r.status, contentType: r.contentType, bytes: r.bytes, sha256: r.sha256 }
}
for (const path of ICONS) {
  const r = await fetchResource(path)
  manifest.icons[path] = { status: r.status, contentType: r.contentType, bytes: r.bytes, sha256: r.sha256 }
}
const missing = await fetchResource('/__missing-parity-probe/')
manifest.notFound = {
  status: missing.status,
  contentType: missing.contentType,
  bytes: missing.bytes,
  sha256: missing.sha256,
}

// --- Routes via a real browser ------------------------------------------------
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

const fontUrls = new Set()
page.on('response', (response) => {
  const url = response.url()
  if (url.startsWith(ORIGIN) && /\.(woff2?|ttf|otf)$/i.test(new URL(url).pathname)) fontUrls.add(new URL(url).pathname)
})

function normaliseJsonLd(value) {
  if (Array.isArray(value)) return value.map(normaliseJsonLd)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normaliseJsonLd(value[key])]))
  }
  return value
}

for (const route of [...ROUTES, '/__missing-parity-probe/']) {
  const raw = await fetchResource(route)
  await page.goto(ORIGIN + route, { waitUntil: 'networkidle' })
  const extracted = await page.evaluate(() => {
    const text = (document.body.innerText || '').replace(/\s+/g, ' ').trim()
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).sort()
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent))
    const meta = {}
    for (const element of document.querySelectorAll('meta[name], meta[property]')) {
      const key = element.getAttribute('name') || element.getAttribute('property')
      meta[key] = element.getAttribute('content')
    }
    const links_rel = [...document.querySelectorAll('link[rel]')].map((l) => ({
      rel: l.getAttribute('rel'), href: l.getAttribute('href'), type: l.getAttribute('type'),
      sizes: l.getAttribute('sizes'), as: l.getAttribute('as'),
    }))
    const images = [...document.querySelectorAll('img')].map((i) => ({
      src: i.getAttribute('src'), width: i.getAttribute('width'), height: i.getAttribute('height'),
      alt: i.getAttribute('alt'), loading: i.getAttribute('loading'), decoding: i.getAttribute('decoding'),
    }))
    return { text, links, jsonLd, meta, links_rel, images, title: document.title, lang: document.documentElement.lang }
  })
  const entry = {
    status: raw.status,
    contentType: raw.contentType,
    cacheControl: raw.cacheControl,
    bytes: raw.bytes,
    sha256: raw.sha256,
    title: extracted.title,
    lang: extracted.lang,
    meta: extracted.meta,
    linkElements: extracted.links_rel,
    images: extracted.images,
    text: extracted.text,
    textSha256: sha256(Buffer.from(extracted.text, 'utf8')),
    links: extracted.links,
    jsonLd: extracted.jsonLd.map(normaliseJsonLd),
  }
  if (route === '/__missing-parity-probe/') manifest.notFound = entry
  else manifest.routes[route] = entry
  process.stderr.write(`captured ${route} (${raw.bytes} bytes, ${extracted.text.length} text chars)\n`)
}

for (const fontPath of [...fontUrls].sort()) {
  const r = await fetchResource(fontPath)
  manifest.fonts[fontPath] = { status: r.status, contentType: r.contentType, bytes: r.bytes, sha256: r.sha256 }
}

await browser.close()
writeFileSync(resolve(outDir, 'production-baseline.json'), `${JSON.stringify(manifest, null, 2)}\n`)
process.stderr.write(`fonts: ${Object.keys(manifest.fonts).join(', ')}\n`)
