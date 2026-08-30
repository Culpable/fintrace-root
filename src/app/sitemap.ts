import type { MetadataRoute } from 'next'
import { absoluteUrl, indexablePageKeys, pageMetadata } from '@/lib/metadata'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePageKeys.map((pageKey) => ({ url: absoluteUrl(pageMetadata[pageKey].route) }))
}
