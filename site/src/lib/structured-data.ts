import { site } from '../config/site.ts'
import { absoluteUrl, documentTitle, pageMetadata, type PublicPageKey } from './metadata.ts'

/** Serialise reviewed public facts without allowing HTML-closing text into the script element. */
export function serialiseStructuredData(value: object) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/** Publish a stable WebSite, organisation and page identity without inventing contact details. */
export function buildStructuredData(pageKey: PublicPageKey) {
  const page = pageMetadata[pageKey]
  const pageUrl = absoluteUrl(page.route)
  const organisationId = `${site.siteUrl}/#organisation`
  const websiteId = `${site.siteUrl}/#website`
  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': organisationId,
      name: site.name,
      url: `${site.siteUrl}/`,
      description: site.description,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${site.siteUrl}/`,
      name: site.name,
      description: site.description,
      inLanguage: site.language,
      publisher: { '@id': organisationId },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: documentTitle(pageKey),
      description: page.description,
      inLanguage: site.language,
      isPartOf: { '@id': websiteId },
      about: { '@id': organisationId },
    },
  ]

  if (pageKey === 'home') {
    graph.push({
      '@type': 'Service',
      '@id': `${site.siteUrl}/#service`,
      name: 'Forensic bank-statement analysis',
      description: site.description,
      serviceType: 'Forensic bank-statement analysis',
      areaServed: { '@type': 'Country', name: 'Australia' },
      audience: { '@type': 'Audience', audienceType: 'Legal teams' },
      provider: { '@id': organisationId },
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
