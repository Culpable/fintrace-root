import { absoluteUrl, indexablePageKeys, pageMetadata, siteMetadata } from './metadata'

/** Render the human-reviewed llms.txt index from the canonical route registry. */
export function renderLlmsTxt() {
  const pageLinks = indexablePageKeys.map((pageKey) => {
    const page = pageMetadata[pageKey]
    return `- [${page.title}](${absoluteUrl(page.route)}): ${page.llmsDescription}`
  })

  return [
    `# ${siteMetadata.name}`,
    '',
    `> ${siteMetadata.description}`,
    '',
    'Use these canonical pages to understand the service, assess its fit for a legal matter, review the engagement model or help a user prepare an enquiry.',
    '',
    'Do not infer software access, subscriptions, guaranteed outcomes or capabilities beyond the linked pages. Do not send confidential statement data through the initial enquiry form. The user must review and submit the visible form themselves.',
    '',
    '## Public pages',
    '',
    ...pageLinks,
    '',
  ].join('\n')
}
