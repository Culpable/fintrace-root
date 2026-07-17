import type { NextConfig } from 'next'

/**
 * FinTrace website - GitHub Pages static export configuration.
 *
 * The site is a pure static export (no server runtime), matching the
 * The GitHub Pages workflow publishes the generated `out/` directory at
 * fintrace.com.au without a server runtime.
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
