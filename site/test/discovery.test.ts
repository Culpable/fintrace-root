import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { renderLlmsTxt } from '../src/lib/llms.ts'
import { absoluteUrl, indexablePageKeys, pageMetadata } from '../src/lib/metadata.ts'

const baselinePath = resolve(import.meta.dirname, '../../documents/guides/parity/production-baseline.json')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const distDirectory = resolve(import.meta.dirname, '../dist')

function sha256(value: Buffer | string) {
  return createHash('sha256').update(value).digest('hex')
}

test('the discovery files are byte-identical to production', () => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt']) {
    const file = resolve(distDirectory, path.slice(1))
    assert.equal(existsSync(file), true, `${path} is missing from dist. Run pnpm build first.`)
    assert.equal(sha256(readFileSync(file)), baseline.discovery[path].sha256, `${path} differs from production`)
  }
})

test('the sitemap lists every indexable route once, in registry order, with no lastmod', () => {
  const sitemap = readFileSync(resolve(distDirectory, 'sitemap.xml'), 'utf8')
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.deepEqual(locations, indexablePageKeys.map((key) => absoluteUrl(pageMetadata[key].route)))
  assert.equal(sitemap.includes('<lastmod>'), false)
})

test('llms.txt carries the operating block and every canonical route exactly once', () => {
  const rendered = renderLlmsTxt()
  assert.match(rendered, /^# FinTrace\n/)
  for (const marker of ['**When to use:**', '**When not to use:**', '**How to get started:**']) {
    assert.equal(rendered.includes(marker), true, `missing ${marker}`)
  }
  for (const key of indexablePageKeys) {
    const url = absoluteUrl(pageMetadata[key].route)
    const occurrences = rendered.split(`](${url})`).length - 1
    assert.equal(occurrences, 1, `${url} must appear exactly once`)
  }
  // The document is pure ASCII today; the byte-identity test above is the
  // encoding contract, and `_headers` declares the UTF-8 charset regardless.
  assert.equal(rendered, readFileSync(resolve(distDirectory, 'llms.txt'), 'utf8'))
})

test('no discovery output names a preview or staging host', () => {
  for (const path of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
    const body = readFileSync(resolve(distDirectory, path), 'utf8')
    assert.equal(body.includes('staging.fintrace.com.au'), false, `${path} names staging`)
    assert.equal(body.includes('workers.dev'), false, `${path} names workers.dev`)
  }
})
