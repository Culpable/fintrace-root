import type { Metadata } from 'next'
import './globals.css'

/**
 * Root layout for the FinTrace design lab.
 *
 * Fonts are intentionally NOT loaded here: each design route loads its own
 * next/font instances so every concept ships a self-contained typographic
 * identity and no page pays for another page's fonts.
 */
export const metadata: Metadata = {
  title: {
    default: 'FinTrace — Design Lab',
    template: '%s — FinTrace Design Lab',
  },
  description:
    'Six candidate homepage designs for FinTrace, the forensic bank-statement analysis service for legal teams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  )
}
