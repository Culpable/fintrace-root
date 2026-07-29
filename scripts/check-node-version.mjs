import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const repositoryRoot = resolve(dirname(scriptPath), '..')
const nvmrcPath = resolve(repositoryRoot, '.nvmrc')
const exactNodeVersionPattern = /^v?(?<version>\d+\.\d+\.\d+)$/


function normaliseExactNodeVersion(versionDeclaration) {
  // Return only a complete semantic version so partial runtime ranges cannot pass.
  const match = String(versionDeclaration).trim().match(exactNodeVersionPattern)

  return match?.groups.version ?? null
}


export function getNodeVersionError(expectedDeclaration, actualDeclaration) {
  // Compare normalised declarations while preserving actionable values in errors.
  const expectedVersion = normaliseExactNodeVersion(expectedDeclaration)
  const actualVersion = normaliseExactNodeVersion(actualDeclaration)

  if (!expectedVersion) {
    return 'Invalid Node.js version in .nvmrc. Expected one exact semantic version.'
  }

  if (actualVersion === expectedVersion) {
    return null
  }

  return `Unsupported Node.js runtime v${actualVersion ?? String(actualDeclaration)}. This project requires Node.js v${expectedVersion} from .nvmrc. Run \`nvm install\` and \`nvm use\` before continuing.`
}


function runNodeVersionPreflight() {
  // Read the tracked pin for every invocation so .nvmrc remains authoritative.
  const expectedDeclaration = readFileSync(nvmrcPath, 'utf8')
  const error = getNodeVersionError(expectedDeclaration, process.versions.node)

  if (error) {
    console.error(error)
    process.exitCode = 1
  }
}


if (resolve(process.argv[1] ?? '') === scriptPath) {
  runNodeVersionPreflight()
}
