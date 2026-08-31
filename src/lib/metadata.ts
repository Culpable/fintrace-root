import type { Metadata } from 'next'

/** Keep crawler-facing identity and route facts in one reviewed source. */
export const siteMetadata = {
  name: 'FinTrace',
  title: 'FinTrace: forensic bank-statement analysis for legal teams',
  description:
    'FinTrace is an AI-assisted forensic bank-statement analysis service for legal teams, delivering a structured ledger and source-linked findings.',
  siteUrl: 'https://fintrace.com.au',
  ogImage: '/images/og/fintrace-og.png',
  ogImageAlt: 'FinTrace forensic bank-statement analysis for legal teams',
  locale: 'en-AU',
} as const

export const pageMetadata = {
  home: {
    route: '/',
    title: siteMetadata.title,
    description: siteMetadata.description,
    llmsLabel: 'FinTrace overview',
    llmsDescription:
      'The four stages from intake to findings, what the ledger and the findings report contain, and how every line is tied back to its source page.',
  },
  about: {
    route: '/about/',
    title: 'About',
    description:
      'FinTrace is a specialist AI-assisted forensic bank-statement analysis service for legal teams - engaged per matter, Australia-wide, verifiable to source pages.',
    llmsLabel: 'About FinTrace',
    llmsDescription:
      'The service-not-software model, the verification standard, and a recent matter delivered in about ten hours against a fifty-hour manual estimate.',
  },
  engagement: {
    route: '/engagement/',
    title: 'Engagement & pricing',
    description:
      'FinTrace is engaged per matter - AI-assisted analysis quoted in writing after an initial assessment. No licences, no subscriptions.',
    llmsLabel: 'Engagement and pricing',
    llmsDescription:
      'The four engagement stages, the Excel ledger and findings-report deliverables, and how each matter is scoped and quoted in writing before work starts.',
  },
  contact: {
    route: '/contact/',
    title: 'Contact',
    description:
      'Send FinTrace an enquiry: outline what you need and the timeframe, and we will come back with whether the engine fits and what it would cost.',
    llmsLabel: 'Request a matter assessment',
    llmsDescription:
      'Outline the dispute, the rough page and account counts, and the timeframe. No statements or confidential detail at this stage.',
  },
  privacy: {
    route: '/privacy/',
    title: 'Privacy',
    description: 'How the FinTrace public website, anonymous analytics and enquiry form handle information.',
    llmsLabel: 'Privacy',
    llmsDescription:
      'What the website, its anonymous analytics, and the enquiry form collect, how long it is kept, and the choices available.',
  },
  // Noindexed internal review surface — kept here so every route's metadata
  // stays in one place, even though this page is never indexed or linked.
  testimonial: {
    title: 'Testimonial drafts',
    description: 'Draft client testimonials under review. Not published.',
  },
} as const

export type PublicPageKey = 'home' | 'about' | 'engagement' | 'contact' | 'privacy'

/** Canonical production-page order shared by the sitemap, llms.txt and tests. */
export const indexablePageKeys = [
  'home',
  'about',
  'engagement',
  'contact',
  'privacy',
] as const satisfies readonly PublicPageKey[]

export function absoluteUrl(path: string) {
  return new URL(path, `${siteMetadata.siteUrl}/`).toString()
}

export function documentTitle(pageKey: PublicPageKey) {
  const page = pageMetadata[pageKey]
  return pageKey === 'home' ? page.title : `${page.title} | ${siteMetadata.name}`
}

/** Give every indexable page complete, self-referential search and share metadata. */
export function createPageMetadata(pageKey: PublicPageKey): Metadata {
  const page = pageMetadata[pageKey]
  const title = documentTitle(pageKey)

  return {
    title: pageKey === 'home' ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: page.route },
    robots: { index: true, follow: true },
    openGraph: {
      siteName: siteMetadata.name,
      url: absoluteUrl(page.route),
      locale: siteMetadata.locale,
      type: 'website',
      title,
      description: page.description,
      images: [
        {
          url: siteMetadata.ogImage,
          width: 1200,
          height: 630,
          alt: siteMetadata.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.description,
      images: [{ url: siteMetadata.ogImage, alt: siteMetadata.ogImageAlt }],
    },
  }
}
