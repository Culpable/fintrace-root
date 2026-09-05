// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
  site: 'https://fintrace.com.au',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    build: {
      // Keep every processed script external so the header-only CSP can allow
      // scripts through `script-src 'self'` with no hashes and no
      // `unsafe-inline`. This also changes Astro's automatic stylesheet
      // threshold, so it must stay paired with `build.inlineStylesheets`.
      assetsInlineLimit: 0,
    },
  },
  build: {
    // Keep stylesheets external so the CSP needs no style hashes and the
    // hashed CSS stays immutably cacheable. Paired with `assetsInlineLimit`.
    inlineStylesheets: 'never',
  },
  prefetch: {
    // Prefetch internal links only on hover. Kept subject to the measurement
    // recorded in documents/guides/cloudflare_workers_hosting.md: the Worker
    // sends `Vary: Accept`, so a prefetch is only worth keeping if the
    // following navigation actually reuses the cached document.
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  fonts: [
    {
      // Display voice. Matches the production next/font instance: the
      // Bricolage Grotesque variable face, latin subset, swap display.
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-eng-display',
      weights: ['200 800'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
    {
      // Specification voice. Fragment Mono 400, latin subset, swap display.
      provider: fontProviders.google(),
      name: 'Fragment Mono',
      cssVariable: '--font-eng-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      // End the stack in `monospace`, as the production stylesheet does.
      // Astro's default `sans-serif` would otherwise sit ahead of the
      // stylesheet's own generic and send mono text to a proportional face.
      fallbacks: ['monospace'],
    },
    {
      // Single-glyph companion face for U+2248. Fragment Mono's latin subset
      // excludes the glyph, so every mono stack lists this face first and
      // per-glyph fallback sends everything else on to the main face.
      // `optimizedFallbacks: false` mirrors next/font's `adjustFontFallback:
      // false`, so the face carries no range-free metric shadow.
      provider: fontProviders.local(),
      name: 'Fragment Mono Approx',
      cssVariable: '--font-eng-mono-approx',
      display: 'swap',
      optimizedFallbacks: false,
      fallbacks: [],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/fragment-mono-approx.woff2'],
          },
        ],
      },
    },
  ],
  server: { port: 4332 },
})
