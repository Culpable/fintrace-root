import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const nvmrcPath = resolve(repositoryRoot, '.nvmrc')
const packagePath = resolve(repositoryRoot, 'package.json')
const packageLockPath = resolve(repositoryRoot, 'package-lock.json')
const deployWorkflowPath = resolve(repositoryRoot, '.github/workflows/deploy.yml')
const agentsPath = resolve(repositoryRoot, 'AGENTS.md')


function readJson(path) {
  // Parse tracked JSON declarations so assertions compare their semantic values.
  return JSON.parse(readFileSync(path, 'utf8'))
}


function readSupportedNodeVersion() {
  // Treat the project-local NVM pin as the single source of runtime truth.
  assert.equal(existsSync(nvmrcPath), true, 'Expected the repository to provide a .nvmrc runtime pin')

  const declaration = readFileSync(nvmrcPath, 'utf8').trim()
  const match = declaration.match(/^v?(?<version>\d+\.\d+\.\d+)$/)

  assert.ok(match, 'Expected .nvmrc to contain one exact semantic Node.js version')

  return match.groups.version
}


test('package metadata mirrors the exact Node.js version from .nvmrc', () => {
  // Keep install-time package metadata aligned with the local runtime pin.
  const supportedNodeVersion = readSupportedNodeVersion()
  const packageJson = readJson(packagePath)
  const packageLockJson = readJson(packageLockPath)

  assert.deepEqual(
    {
      packageJson: packageJson.engines?.node ?? null,
      packageLock: packageLockJson.packages?.['']?.engines?.node ?? null,
    },
    {
      packageJson: supportedNodeVersion,
      packageLock: supportedNodeVersion,
    },
    'Expected package.json and the lockfile root package to declare the .nvmrc version exactly',
  )
})


test('deployment and project guidance read the Node.js version from the runtime contract', () => {
  // Prevent CI and contributor guidance from drifting away from the executable pin.
  const supportedNodeVersion = readSupportedNodeVersion()
  const deployWorkflow = readFileSync(deployWorkflowPath, 'utf8')
  const agents = readFileSync(agentsPath, 'utf8')

  assert.match(
    deployWorkflow,
    /node-version-file:\s*['"]?\.nvmrc['"]?/,
    'Expected actions/setup-node to use node-version-file: .nvmrc',
  )
  assert.doesNotMatch(
    deployWorkflow,
    /\bnode-version:\s*/,
    'Expected deployment not to maintain a separate node-version literal',
  )
  assert.match(
    agents,
    new RegExp(`Development: Node\\.js \\\`${supportedNodeVersion}\\\``),
    'Expected AGENTS.md to declare the exact .nvmrc version',
  )
})


test('dev, build, and test share one dependency-free Node.js preflight', async () => {
  // Reject unsupported runtimes before TypeScript loading or application work starts.
  const supportedNodeVersion = readSupportedNodeVersion()
  const packageJson = readJson(packagePath)
  const lifecycleHooks = {
    predev: packageJson.scripts?.predev ?? null,
    prebuild: packageJson.scripts?.prebuild ?? null,
    pretest: packageJson.scripts?.pretest ?? null,
  }

  assert.ok(
    Object.values(lifecycleHooks).every((command) => typeof command === 'string' && command.length > 0),
    `Expected predev, prebuild, and pretest hooks, received ${JSON.stringify(lifecycleHooks)}`,
  )

  const preflightReferences = Object.values(lifecycleHooks).map((command) =>
    command.match(/^npm run (?<scriptName>[\w:-]+)$/),
  )

  assert.ok(
    preflightReferences.every(Boolean),
    'Expected each lifecycle hook to call one shared npm preflight script',
  )

  const preflightScriptNames = preflightReferences.map((match) => match.groups.scriptName)

  assert.equal(
    new Set(preflightScriptNames).size,
    1,
    'Expected predev, prebuild, and pretest to call the same preflight script',
  )

  const preflightCommand = packageJson.scripts[preflightScriptNames[0]]
  const preflightCommandMatch = preflightCommand?.match(/^node\s+(?<scriptPath>[^\s;&|]+\.mjs)$/)

  assert.ok(
    preflightCommandMatch,
    'Expected the shared preflight package script to run one dependency-free Node.js module',
  )

  const preflightPath = resolve(repositoryRoot, preflightCommandMatch.groups.scriptPath)

  assert.equal(
    existsSync(preflightPath),
    true,
    `Expected the runtime preflight module to exist at ${preflightCommandMatch.groups.scriptPath}`,
  )

  const preflightSource = readFileSync(preflightPath, 'utf8')
  const importSpecifiers = [
    ...preflightSource.matchAll(/\b(?:from|import)\s*(?:\(\s*)?['"](?<specifier>[^'"]+)['"]/g),
  ].map((match) => match.groups.specifier)

  assert.match(preflightSource, /\.nvmrc/, 'Expected the runtime preflight to read .nvmrc')
  assert.match(
    preflightSource,
    /process\.versions\.node/,
    'Expected the runtime preflight to compare the active Node.js version',
  )
  assert.ok(
    importSpecifiers.every((specifier) => specifier.startsWith('node:')),
    `Expected the runtime preflight to use only Node.js built-ins, received ${JSON.stringify(importSpecifiers)}`,
  )

  const preflightModule = await import(pathToFileURL(preflightPath).href)

  assert.equal(
    preflightModule.getNodeVersionError(`v${supportedNodeVersion}`, supportedNodeVersion),
    null,
    'Expected the runtime preflight to accept the exact supported version',
  )
  assert.match(
    preflightModule.getNodeVersionError(`v${supportedNodeVersion}`, '22.17.0'),
    new RegExp(`requires Node\\.js v${supportedNodeVersion}`),
    'Expected the runtime preflight to reject Node.js 22.17.0 with actionable guidance',
  )
})
