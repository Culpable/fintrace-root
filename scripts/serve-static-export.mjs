import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'out')
const outputPrefix = `${outputRoot}${sep}`
const port = Number.parseInt(process.env.AGENT_TEST_PORT ?? '3011', 10)

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/vnd.microsoft.icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
])

function safeOutputPath(relativePath) {
  const candidate = resolve(outputRoot, relativePath)
  return candidate === outputRoot || candidate.startsWith(outputPrefix) ? candidate : null
}

function existingFile(path) {
  return path && existsSync(path) && statSync(path).isFile() ? path : null
}

function fileForPathname(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')
  if (decodedPath.endsWith('/')) {
    return existingFile(safeOutputPath(`${relativePath}index.html`))
  }

  return existingFile(safeOutputPath(relativePath))
}

function directoryRedirectForPathname(pathname) {
  if (pathname.endsWith('/')) return null

  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')
  if (existingFile(safeOutputPath(relativePath))) return null

  return existingFile(safeOutputPath(`${relativePath}/index.html`)) ? `${pathname}/` : null
}

function sendFile(request, response, filePath, status = 200) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(filePath).pipe(response)
}

if (!existsSync(outputRoot)) {
  throw new Error(`Static output is missing at ${outputRoot}. Run npm run build first.`)
}

const server = createServer((request, response) => {
  if (!request.url || !['GET', 'HEAD'].includes(request.method ?? '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' })
    response.end('Method not allowed')
    return
  }

  try {
    const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`)
    const pathname = requestUrl.pathname
    // GitHub Pages canonicalises directory requests before serving their index document.
    const redirectPath = directoryRedirectForPathname(pathname)
    if (redirectPath) {
      response.writeHead(301, {
        'Cache-Control': 'no-store',
        Location: `${redirectPath}${requestUrl.search}`,
      })
      response.end()
      return
    }

    const filePath = fileForPathname(pathname)
    if (filePath) {
      sendFile(request, response, filePath)
      return
    }
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Bad request')
    return
  }

  sendFile(request, response, resolve(outputRoot, '404.html'), 404)
})

server.listen(port, '127.0.0.1')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
