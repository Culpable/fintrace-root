/**
 * Keep site-wide identity in one source so every route and social crawler
 * receives the same name, canonical origin, description and share image.
 */
export const siteMetadata = {
  name: 'FinTrace',
  title: 'FinTrace: AI forensic financial analysis for legal matters',
  description:
    'FinTrace uses AI to turn bulk bank statements into a structured transaction ledger and source-linked findings - every line verifiable against its source page.',
  siteUrl: 'https://fintrace.com.au',
  ogImage: '/images/og/fintrace-og.png',
  locale: 'en-AU',
} as const

/**
 * Keep bare sub-page titles beside their descriptions so the root layout can
 * apply the shared `| FinTrace` title template without duplicating copy.
 */
export const pageMetadata = {
  home: {
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  about: {
    title: 'About',
    description:
      'FinTrace is a specialist AI-assisted forensic bank-statement analysis service for legal teams - proven on a live matter, engaged per matter, Australia-wide.',
  },
  engagement: {
    title: 'Engagement & pricing',
    description:
      'FinTrace is engaged per matter - AI-assisted analysis at a flat fee plus per-page pricing, quoted after an initial assessment. No licences, no subscriptions.',
  },
  contact: {
    title: 'Contact',
    description:
      'Start a matter assessment: outline the dispute, page volume and timeframe, and FinTrace will come back with fit and a quote.',
  },
} as const
