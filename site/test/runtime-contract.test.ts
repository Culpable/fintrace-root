import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const siteDirectory = resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(readFileSync(resolve(siteDirectory, 'package.json'), 'utf8'))
const wranglerConfig = readFileSync(resolve(siteDirectory, 'wrangler.jsonc'), 'utf8')
const astroConfig = readFileSync(resolve(siteDirectory, 'astro.config.mjs'), 'utf8')
const lockfile = readFileSync(resolve(siteDirectory, 'pnpm-lock.yaml'), 'utf8')

const NODE_VERSION = '22.23.1'
const PNPM_VERSION = '11.24.0'

test('the toolchain is pinned to the versions Workers Builds provisions', () => {
  assert.equal(packageJson.packageManager, `pnpm@${PNPM_VERSION}`)
  assert.equal(packageJson.engines.node, `>=${NODE_VERSION} <23`)
  // `.nvmrc` carries the `v` prefix nvm writes.
  assert.equal(readFileSync(resolve(siteDirectory, '../.nvmrc'), 'utf8').trim().replace(/^v/, ''), NODE_VERSION)
})

test('no client framework or superseded dependency is installed', () => {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  for (const forbidden of [
    'react',
    'react-dom',
    '@astrojs/react',
    'next',
    'clsx',
    'tailwindcss',
    '@tailwindcss/vite',
    '@astrojs/cloudflare',
    '@astrojs/sitemap',
  ]) {
    assert.equal(forbidden in dependencies, false, `${forbidden} must not be a dependency`)
  }
  assert.equal(lockfile.includes('\n  react:'), false, 'react is present in the lockfile')
})

test('the pinned runtime dependencies match the production versions', () => {
  assert.match(packageJson.dependencies.astro, /^7\.3\./)
  assert.equal(packageJson.dependencies.three, '0.182.0')
  assert.equal(packageJson.dependencies['mixpanel-browser'], '2.81.0')
  assert.match(packageJson.devDependencies.wrangler, /^4\.129\./)
  assert.match(packageJson.devDependencies['@playwright/test'], /^1\.62\./)
  assert.match(packageJson.devDependencies['@axe-core/playwright'], /^4\.13\./)
})

test('the Astro configuration keeps the static, hash-free delivery contract', () => {
  assert.match(astroConfig, /site: 'https:\/\/fintrace\.com\.au'/)
  assert.match(astroConfig, /output: 'static'/)
  assert.match(astroConfig, /trailingSlash: 'always'/)
  assert.match(astroConfig, /assetsInlineLimit: 0/)
  assert.match(astroConfig, /inlineStylesheets: 'never'/)
  assert.match(astroConfig, /port: 4332/)
  // No adapter and no integration: every route stays prerendered.
  assert.equal(astroConfig.includes('@astrojs/cloudflare'), false)
  assert.equal(astroConfig.includes('integrations:'), false)
})

test('the Worker configuration exposes only the assets binding', () => {
  assert.match(wranglerConfig, /"name": "fintrace-root"/)
  assert.match(wranglerConfig, /"account_id": "213ab3604485056376263d22fa242742"/)
  assert.match(wranglerConfig, /"main": "src\/worker\.ts"/)
  assert.match(wranglerConfig, /"binding": "ASSETS"/)
  assert.match(wranglerConfig, /"not_found_handling": "404-page"/)
  assert.match(wranglerConfig, /"name": "fintrace-root-preview"/)
  assert.equal(wranglerConfig.includes('nodejs_compat'), false)
  assert.equal(wranglerConfig.includes('kv_namespaces'), false)
  assert.equal(wranglerConfig.includes('d1_databases'), false)
})

test('the build runs the checker, the static build and the Markdown generator in order', () => {
  assert.equal(
    packageJson.scripts.build,
    'astro check && astro build && node scripts/generate-agent-markdown.mjs dist https://fintrace.com.au',
  )
  assert.equal(packageJson.scripts.deploy, 'wrangler deploy --env=""')
  assert.equal(packageJson.scripts['deploy:preview'], 'wrangler versions upload --env preview')
})
