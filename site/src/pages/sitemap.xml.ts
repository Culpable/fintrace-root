import type { APIRoute } from 'astro'
import { absoluteUrl, indexablePageKeys, pageMetadata } from '../lib/metadata.ts'

export const prerender = true

/**
 * Emit the production sitemap byte for byte (plan D-24): one `<url>` per
 * indexable route in `indexablePageKeys` order, no indentation, no `lastmod`,
 * and a single trailing newline. Astro's sitemap integration is deliberately
 * not used because it cannot reproduce this document exactly.
 */
export const GET: APIRoute = () => {
  const urls = indexablePageKeys
    .map((pageKey) => `<url>\n<loc>${absoluteUrl(pageMetadata[pageKey].route)}</loc>\n</url>`)
    .join('\n')
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } })
}
