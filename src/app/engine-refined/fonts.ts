import { Bricolage_Grotesque, Fragment_Mono } from 'next/font/google'

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
