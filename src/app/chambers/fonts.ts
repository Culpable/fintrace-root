import { Cinzel, Cormorant_Garamond, EB_Garamond } from 'next/font/google'

/**
 * Typographic identity for the “Chambers” concept.
 *
 * Three voices, strictly ranked:
 *  - Cormorant Garamond: display serif for headlines and grand numerals.
 *  - EB Garamond: quiet, bookish body copy.
 *  - Cinzel: engraved uppercase labels only — never sentences.
 *
 * Each font exposes a CSS variable consumed inside chambers.css so the
 * entire system stays scoped to this route.
 */

export const chambersDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-ch-display',
  display: 'swap',
})

export const chambersBody = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-ch-body',
  display: 'swap',
})

export const chambersEngraved = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ch-engraved',
  display: 'swap',
})
