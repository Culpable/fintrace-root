import type { APIRoute } from 'astro'

export const prerender = true

/**
 * Wildcard crawler policy with the canonical sitemap pointer. The body is the
 * production document byte for byte; `_headers` supplies the charset.
 */
const ROBOTS_TXT = `${['User-Agent: *', 'Allow: /', '', 'Sitemap: https://fintrace.com.au/sitemap.xml'].join('\n')}\n`

export const GET: APIRoute = () =>
  new Response(ROBOTS_TXT, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
