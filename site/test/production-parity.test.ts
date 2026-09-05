import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const distDirectory = resolve(import.meta.dirname, '../dist')
const publicDirectory = resolve(import.meta.dirname, '../public')
const baseline = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../documents/guides/parity/production-baseline.json'), 'utf8'),
)

const sha256 = (value: Buffer) => createHash('sha256').update(value).digest('hex')

function documentFor(route: string) {
  return route === '/' ? resolve(distDirectory, 'index.html') : resolve(distDirectory, route.slice(1), 'index.html')
}

/**
 * Decode the entity references the serialiser writes. The baseline was read
 * through a browser, so it holds decoded text; the built document holds the
 * escaped source.
 */
function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function metaFrom(html: string) {
  const entries = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => match[0])
  const meta: Record<string, string> = {}
  for (const tag of entries) {
    const key = tag.match(/(?:name|property)=["']([^"']+)["']/)?.[1]
    const value = tag.match(/content=["']([^"']*)["']/)?.[1]
    if (key !== undefined) meta[key] = decodeEntities(value ?? '')
  }
  return meta
}

test('every image and browser identity asset is byte-identical to production', () => {
  const assets: Record<string, string> = {
    ...baseline.images,
    ...baseline.icons,
  }
  for (const [path, expected] of Object.entries(assets) as Array<[string, { sha256: string }]>) {
    const file = resolve(publicDirectory, path.slice(1))
    assert.equal(sha256(readFileSync(file)), expected.sha256, `${path} differs from production`)
  }
})

test('every route publishes the production head metadata', () => {
  for (const [route, expected] of Object.entries(baseline.routes) as Array<[string, any]>) {
    const html = readFileSync(documentFor(route), 'utf8')
    const meta = metaFrom(html)

    const expectedMeta = { ...expected.meta, 'og:locale': 'en_AU' }
    // Next emitted a private font-adjustment marker that has no Astro analogue.
    delete expectedMeta['next-size-adjust']

    for (const [key, value] of Object.entries(expectedMeta) as Array<[string, string]>) {
      assert.equal(meta[key], value, `${route} meta ${key}`)
    }

    assert.equal(decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''), expected.title, `${route} title`)
    assert.equal(html.includes('<html lang="en-AU">'), true, `${route} language`)
    assert.equal(
      html.includes(`<link rel="canonical" href="https://fintrace.com.au${route}">`),
      true,
      `${route} canonical`,
    )
    assert.equal((html.match(/<title>/g) ?? []).length, 1, `${route} title count`)
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, `${route} canonical count`)
    assert.equal((html.match(/property="og:image"/g) ?? []).length, 1, `${route} og:image count`)
    assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1, `${route} JSON-LD count`)
  }
})

test('every route keeps the production icon and discovery link elements', () => {
  const expectedLinks = [
    '<link rel="describedby" href="/llms.txt" type="text/plain">',
    '<link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon">',
    '<link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png">',
  ]
  for (const route of [...Object.keys(baseline.routes), '404']) {
    const file = route === '404' ? resolve(distDirectory, '404.html') : documentFor(route)
    const html = readFileSync(file, 'utf8')
    for (const link of expectedLinks) assert.equal(html.includes(link), true, `${route} is missing ${link}`)
    // Exactly two font preloads: the display and mono faces (plan D-22).
    assert.equal((html.match(/rel="preload" href="\/_astro\/fonts\//g) ?? []).length, 2, `${route} font preloads`)
  }
})

test('the 404 document takes the site-level social values and a noindex marker', () => {
  const html = readFileSync(resolve(distDirectory, '404.html'), 'utf8')
  const meta = metaFrom(html)
  const expectedMeta = { ...baseline.notFound.meta, 'og:locale': 'en_AU' }
  delete expectedMeta['next-size-adjust']
  for (const [key, value] of Object.entries(expectedMeta) as Array<[string, string]>) {
    assert.equal(meta[key], value, `404 meta ${key}`)
  }
  assert.equal(decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''), baseline.notFound.title)
  assert.equal(html.includes('rel="canonical"'), false, 'the 404 must not publish a canonical')
  assert.equal(html.includes('application/ld+json'), false, 'the 404 must publish no structured data')
})

test('every image keeps its production dimensions, alt text and loading behaviour', () => {
  for (const [route, expected] of Object.entries(baseline.routes) as Array<[string, any]>) {
    if (expected.images.length === 0) continue
    const html = readFileSync(documentFor(route), 'utf8')
    for (const image of expected.images) {
      const tag = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]).find((candidate) => candidate.includes(image.src))
      assert.ok(tag, `${route} is missing an <img> for ${image.src}`)
      for (const [attribute, value] of Object.entries(image) as Array<[string, string | null]>) {
        if (value === null) continue
        assert.equal(tag!.includes(`${attribute}="${value}"`), true, `${route} ${image.src} ${attribute}="${value}"`)
      }
    }
  }
})
