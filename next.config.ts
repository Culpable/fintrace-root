import type { NextConfig } from 'next'

/**
 * FinTrace design lab - static export configuration.
 *
 * The site is a pure static export (no server runtime), matching the
 * Embeddings / Bulma-root deployment approach so it can later be served
 * from GitHub Pages or any static host without changes.
 */
const nextConfig: NextConfig = {
  // Build a fully static site into `out/`
  output: 'export',
  images: {
    // next/image optimisation requires a server; static export must opt out
    unoptimized: true,
  },
  // Emit folder/index.html URLs, which behave predictably on static hosts
  trailingSlash: true,
}

export default nextConfig
