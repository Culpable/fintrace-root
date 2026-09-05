import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const siteDirectory = resolve(import.meta.dirname, '..')
const outputDirectory = resolve(siteDirectory, 'dist')
const port = Number.parseInt(process.env.PORT ?? '4332', 10)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/vnd.microsoft.icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

/** Resolve a request path within dist without permitting directory traversal. */
function resolveRequestPath(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')
  const candidates = decodedPath.endsWith('/')
    ? [`${relativePath}index.html`]
    : [relativePath, `${relativePath}/index.html`]

  for (const candidate of candidates) {
    const filePath = resolve(outputDirectory, candidate)
    if (!filePath.startsWith(`${outputDirectory}${sep}`) && filePath !== outputDirectory) continue
    if (existsSync(filePath) && statSync(filePath).isFile()) return filePath
  }

  return null
}

/**
 * Canonicalise a slashless document request. The Worker answers these with a
 * `307`, but the Playwright suite runs against this static server, so it keeps
 * the browser-facing contract: one redirect to the trailing-slash URL.
 */
function directoryRedirectForPathname(pathname) {
  if (pathname.endsWith('/') || extname(pathname)) return null
  const candidate = resolve(outputDirectory, `${pathname.replace(/^\/+/, '')}/index.html`)
  if (!candidate.startsWith(`${outputDirectory}${sep}`)) return null
  return existsSync(candidate) ? `${pathname}/` : null
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `127.0.0.1:${port}`}`)

  const redirectPath = directoryRedirectForPathname(url.pathname)
  if (redirectPath) {
    response.writeHead(301, { 'Cache-Control': 'no-store', Location: `${redirectPath}${url.search}` })
    response.end()
    return
  }

  const filePath = resolveRequestPath(url.pathname)

  if (filePath) {
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream' })
    createReadStream(filePath).pipe(response)
    return
  }

  const notFoundPath = resolve(outputDirectory, '404.html')
  response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
  createReadStream(notFoundPath).pipe(response)
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Static preview ready at http://127.0.0.1:${port}\n`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
