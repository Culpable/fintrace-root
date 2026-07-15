import { Archivo_Black, IBM_Plex_Mono } from 'next/font/google'

/**
 * Typographic identity for “The Exhibit” design only.
 *
 * IBM Plex Mono carries the entire document voice — body copy, data,
 * labels — echoing court transcripts and typewritten evidence schedules.
 * Archivo Black exists solely for stamped headlines and the logotype,
 * where sheer letterform weight reads as a physical rubber stamp.
 */
export const exDisplay = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ex-display',
  display: 'swap',
})

export const exMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ex-mono',
  display: 'swap',
})
