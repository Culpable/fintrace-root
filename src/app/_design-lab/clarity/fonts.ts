import { Familjen_Grotesk, Spline_Sans_Mono } from 'next/font/google'

/**
 * Typographic identity for the “From Chaos to Clarity” design study.
 *
 * Familjen Grotesk carries the Swiss International voice: geometric,
 * quietly characterful, and excellent at both 11px micro-labels and
 * 96px display settings. Spline Sans Mono handles every figure and
 * data cell so the “spreadsheet” language of the product reads as a
 * deliberate typographic system rather than a default code font.
 *
 * Both are variable fonts, so no explicit weight list is required and
 * the full weight axis ships in a single self-hosted file per face.
 */
export const familjen = Familjen_Grotesk({
  subsets: ['latin'],
  variable: '--font-familjen',
  display: 'swap',
})

export const splineMono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-spline-mono',
  display: 'swap',
})
