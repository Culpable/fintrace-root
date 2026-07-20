import { Fraunces, Newsreader, Spline_Sans_Mono } from 'next/font/google'

/**
 * Typographic identity for “The Ledger” design.
 *
 * Load each family as a CSS variable so ledger.css can compose the full
 * editorial system (display / body / figures) without leaking fonts into
 * any other design route.
 */

/** Display serif — big broadsheet headlines. Expose the optical-size axis so
 *  large settings render with the sharp, high-contrast cut of the family. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

/** Body serif — long-form editorial text with a true italic for asides. */
export const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
})

/** Mono — tabular figures for ledger data, folios and small-caps labels. */
export const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-spline-mono',
  display: 'swap',
})
