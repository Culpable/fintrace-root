import { Fraunces, Fragment_Mono } from 'next/font/google'

/**
 * Typographic identity for "The Evidence Engine — Serif" variant.
 *
 * This variant is the typography A/B against /engine/: Fraunces replaces
 * Bricolage Grotesque as the display voice (variable weight + optical size,
 * with italic loaded for the gold accent moments), while Fragment Mono keeps
 * the engraved specification/label voice untouched so the serif swap is the
 * only variable under test. Both are self-hosted at build time via next/font
 * so the static export ships zero third-party font requests.
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  // Load the optical-size axis so large headlines render with the tighter,
  // higher-contrast display cut rather than the text cut scaled up
  axes: ['opsz'],
  variable: '--font-eng-display',
})

export const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-eng-mono',
})
