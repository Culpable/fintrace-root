import { absoluteUrl, documentTitle, pageMetadata, siteMetadata, type PublicPageKey } from '@/lib/metadata'

type StructuredDataProps = {
  page: PublicPageKey
}

/** Serialise reviewed public facts without allowing HTML-closing text into the script element. */
function serialiseStructuredData(value: object) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/** Publish a stable WebSite, organisation and page identity without inventing contact details. */
export default function StructuredData({ page: pageKey }: StructuredDataProps) {
  const page = pageMetadata[pageKey]
  const pageUrl = absoluteUrl(page.route)
  const organisationId = `${siteMetadata.siteUrl}/#organisation`
  const websiteId = `${siteMetadata.siteUrl}/#website`
  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': organisationId,
      name: siteMetadata.name,
      url: `${siteMetadata.siteUrl}/`,
      description: siteMetadata.description,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${siteMetadata.siteUrl}/`,
      name: siteMetadata.name,
      description: siteMetadata.description,
      inLanguage: siteMetadata.locale,
      publisher: { '@id': organisationId },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: documentTitle(pageKey),
      description: page.description,
      inLanguage: siteMetadata.locale,
      isPartOf: { '@id': websiteId },
      about: { '@id': organisationId },
    },
  ]

  if (pageKey === 'home') {
    graph.push({
      '@type': 'Service',
      '@id': `${siteMetadata.siteUrl}/#service`,
      name: 'Forensic bank-statement analysis',
      description: siteMetadata.description,
      serviceType: 'Forensic bank-statement analysis',
      areaServed: { '@type': 'Country', name: 'Australia' },
      audience: { '@type': 'Audience', audienceType: 'Legal teams' },
      provider: { '@id': organisationId },
    })
  }

  return (
    <script
      id={`structured-data-${pageKey}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serialiseStructuredData({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  )
}
