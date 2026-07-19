import { Bricolage_Grotesque, Fragment_Mono } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * Typographic identity for "The Evidence Engine" design.
 *
 * Bricolage Grotesque carries the monumental display voice (variable weight,
 * used heavy for headlines and light for body), while Fragment Mono supplies
 * the engraved specification/label voice. Both are self-hosted at build time
 * via next/font so the static export ships zero third-party font requests.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-eng-display',
})

export const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-eng-mono',
})

/**
 * Single-glyph companion face for the almost-equal sign (U+2248).
 *
 * Fragment Mono's latin subset excludes U+2248 from its unicode-range, so a
 * bare `≈` falls through to next/font's metric-adjusted Arial fallback and
 * sits visibly high beside the mono numerals. This Next version's Google
 * loader cannot subset by text, so self-host a 716-byte Fragment Mono subset
 * (OFL-licensed, fetched from Google Fonts) holding only the `≈` glyph.
 * Disable the metric fallback so the face carries no range-free Arial shadow:
 * the mono stacks list this face first, and per-glyph fallback sends every
 * other character on to the main face.
 */
export const fragmentMonoApprox = localFont({
  src: '../../assets/fonts/fragment-mono-approx.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-eng-mono-approx',
  adjustFontFallback: false,
})
