import { Archivo, IBM_Plex_Mono } from 'next/font/google'

/**
 * Typographic identity for the "Follow the Money" concept.
 *
 * Archivo (variable, with the width axis loaded) supplies the wide,
 * authoritative display voice; IBM Plex Mono carries every piece of
 * evidence data: labels, amounts, dates, coordinates and kickers.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})
