import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { site } from '../src/config/site.ts'
import { absoluteUrl, documentTitle, indexablePageKeys, pageMetadata } from '../src/lib/metadata.ts'
import { buildStructuredData, serialiseStructuredData } from '../src/lib/structured-data.ts'

const baselinePath = resolve(import.meta.dirname, '../../documents/guides/parity/production-baseline.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    )
  }
  return value
}

test('every route composes the production document title', () => {
  for (const key of indexablePageKeys) {
    const route = pageMetadata[key].route
    assert.equal(documentTitle(key), baseline.routes[route].title, `${route} title`)
  }
  // The home page keeps its absolute title; every other route takes the suffix.
  assert.equal(documentTitle('home'), site.title)
  assert.equal(documentTitle('about'), `About${site.titleSeparator}${site.name}`)
})

test('every route keeps the production description and canonical', () => {
  for (const key of indexablePageKeys) {
    const route = pageMetadata[key].route
    assert.equal(pageMetadata[key].description, baseline.routes[route].meta.description, `${route} description`)
    assert.equal(absoluteUrl(route), `${site.siteUrl}${route}`)
  }
})

test('the Open Graph locale is the corrected language_TERRITORY value', () => {
  // Plan D-12: production publishes the hyphenated BCP 47 tag, which the Open
  // Graph protocol does not accept. Every other language value is unchanged.
  assert.equal(site.openGraphLocale, 'en_AU')
  assert.equal(site.language, 'en-AU')
  assert.equal(baseline.routes['/'].meta['og:locale'], 'en-AU')
})

test('the JSON-LD graph deep-equals the production graph on every route', () => {
  for (const key of indexablePageKeys) {
    const route = pageMetadata[key].route
    const actual = sortKeys(buildStructuredData(key))
    const expected = baseline.routes[route].jsonLd[0]
    assert.deepEqual(actual, expected, `${route} JSON-LD`)
  }
})

test('the serialiser escapes every sequence that could break out of the script element', () => {
  const encoded = serialiseStructuredData({ value: '</script><b>  ' })
  assert.equal(encoded.includes('</script>'), false)
  assert.equal(encoded.includes('\\u003c'), true)
  assert.equal(encoded.includes('\\u2028'), true)
  assert.equal(encoded.includes('\\u2029'), true)
  assert.equal(encoded.includes(' '), false)
})

test('only the homepage publishes the Service node', () => {
  const home = buildStructuredData('home')['@graph'] as Array<{ '@type': string }>
  const about = buildStructuredData('about')['@graph'] as Array<{ '@type': string }>
  assert.deepEqual(home.map((node) => node['@type']), ['Organization', 'WebSite', 'WebPage', 'Service'])
  assert.deepEqual(about.map((node) => node['@type']), ['Organization', 'WebSite', 'WebPage'])
})
