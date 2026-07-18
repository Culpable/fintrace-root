import type { Metadata } from 'next'
import { siteMetadata } from '@/lib/metadata'
import './globals.css'

/**
 * Root layout for the FinTrace production site and internal design lab.
 *
 * Fonts are intentionally NOT loaded here: each design route loads its own
 * next/font instances so every concept ships a self-contained typographic
 * identity and no page pays for another page's fonts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  openGraph: {
    siteName: siteMetadata.name,
    url: siteMetadata.siteUrl,
    locale: siteMetadata.locale,
    type: 'website',
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: 'FinTrace — forensic financial analysis for legal matters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  )
}
