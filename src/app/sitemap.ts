import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // Supersede the deployment plan's single-URL sitemap with the four approved production pages.
  return [
    { url: 'https://fintrace.com.au/' },
    { url: 'https://fintrace.com.au/about/' },
    { url: 'https://fintrace.com.au/engagement/' },
    { url: 'https://fintrace.com.au/contact/' },
  ]
}
