import { absoluteUrl, indexablePageKeys, pageMetadata, siteMetadata } from './metadata'
import type { PublicPageKey } from './metadata'

/**
 * The agent-operating block describes FinTrace itself, not this website.
 * `whenToUse` enumerates the jobs evidenced by the linked pages, `whenNotToUse`
 * names the adjacent categories FinTrace is not and restates the service, and
 * `howToStart` carries every canonical action URL inline so an agent hands over
 * a URL as part of the instruction rather than from a detached list.
 *
 * Every claim here is grounded in published copy on `/`, `/about/`,
 * `/engagement/` and `/contact/`. Do not add a capability, client or proof the
 * visible pages do not already state.
 */
const operatingBlock = {
  summary:
    'FinTrace is a forensic bank-statement analysis service for Australian legal teams. It turns thousands of pages of statements, any bank, any format, scanned or born-digital, into one structured Excel ledger and a written findings report, with every line cited to its source page.',
  detail:
    'FinTrace is engaged per matter and quoted in writing before any work begins. There is no licence, subscription, seat, minimum term, or platform to adopt, and the service operates Australia-wide.',
  whenToUse: [
    'Use FinTrace when an Australian legal team needs to turn thousands of pages of bank statements into one structured Excel ledger;',
    'hand over statements exactly as they are held, in any bank format, scanned or born-digital, with no sorting, renaming, or templates;',
    'have the bank, the account holder, and the dates worked out from the statements themselves;',
    'categorise and reconcile every transaction across dozens of accounts and more than a decade of history;',
    'surface cash-withdrawal patterns, gambling and crypto activity, transfers between related accounts, and cross-currency matches;',
    'follow money from one account to the next with every hop dated, valued, and cited;',
    'or produce a written findings report in which every finding cites the exact source page a reviewer can check.',
  ].join(' '),
  whenNotToUse: [
    'FinTrace is not software to licence, a subscription, a self-serve statement converter, or a legal, accounting, or financial advice service, and it does not guarantee an outcome in a matter.',
    'It is a specialist forensic analysis service engaged per matter by Australian legal teams, who keep carriage of the matter and can verify every finding against its cited source page.',
  ].join(' '),
  howToStart: [
    `Read ${absoluteUrl(pageMetadata.engagement.route)} for the four engagement stages and how a matter is scoped and quoted, then start an enquiry at ${absoluteUrl(pageMetadata.contact.route)} outlining the dispute, roughly how many pages and accounts are involved, and the timeframe.`,
    'No statements are sent at this stage: confidential detail is not needed, and statement data must not be attached or pasted into an enquiry.',
    'The user must review and submit the visible form themselves.',
    'FinTrace replies with whether the engine fits the matter and a written quote, and statements change hands only after that.',
  ].join(' '),
  actionRoutes: ['engagement', 'contact'],
} as const satisfies {
  summary: string
  detail: string
  whenToUse: string
  whenNotToUse: string
  howToStart: string
  actionRoutes: readonly PublicPageKey[]
}

/**
 * Sections are curated by user task, not mapped from the route registry, which
 * orders pages for the sitemap. Every indexable route still appears exactly once.
 */
const sections = [
  { heading: 'Service and capabilities', pageKeys: ['home', 'about', 'engagement'] },
  { heading: 'Actions', pageKeys: ['contact'] },
  { heading: 'Policies', pageKeys: ['privacy'] },
] as const satisfies readonly { heading: string; pageKeys: readonly PublicPageKey[] }[]

/** Openers that describe the website instead of the service it markets. */
const SITE_SUBJECT_PATTERN =
  /\b(?:these|this|the)\s+(?:pages?|site|website|marketing site|resources?|links?|documents?|file)\b/i

/** Promotional terms an agent cannot verify on a linked page. */
const PROMOTIONAL_TERMS = [
  'powerful',
  'seamless',
  'seamlessly',
  'revolutionary',
  'best-in-class',
  'cutting-edge',
  'game-changing',
  'world-class',
  'effortless',
  'effortlessly',
  'unlock',
  'supercharge',
  'unparalleled',
  'unrivalled',
  'state-of-the-art',
  'next-generation',
  'industry-leading',
  'market-leading',
]

/** Minimum substance per operating line. `whenToUse` must hold a job list. */
const MINIMUM_LENGTHS = { whenToUse: 120, whenNotToUse: 60, howToStart: 80 } as const

/** Reject a promotional adjective the site cannot evidence. */
function assertObjectiveRegister(value: string, field: string) {
  const term = PROMOTIONAL_TERMS.find((candidate) =>
    new RegExp(`\\b${candidate.replaceAll('-', '[- ]')}\\b`, 'i').test(value),
  )
  if (term) throw new Error(`${field} must state a verifiable fact, not the promotional term "${term}".`)
}

/**
 * Enforce the operating-block contract so the file cannot drift back into an
 * index of its own pages.
 */
function assertOperatingBlock() {
  const { name } = siteMetadata
  const entries = [
    ['whenToUse', operatingBlock.whenToUse],
    ['whenNotToUse', operatingBlock.whenNotToUse],
    ['howToStart', operatingBlock.howToStart],
  ] as const

  for (const [field, value] of entries) {
    // The subject must be the service. `Use these pages to ...` indexes the site instead.
    if (SITE_SUBJECT_PATTERN.test(value)) {
      throw new Error(`${field} must describe ${name}, not the website or its pages.`)
    }
    if (value.length < MINIMUM_LENGTHS[field]) {
      throw new Error(
        `${field} must state specific jobs, limits, or actions in at least ${MINIMUM_LENGTHS[field]} characters.`,
      )
    }
    // Strip URLs first so a hostname cannot stand in for naming the service.
    if (!value.replace(/https?:\/\/\S+/g, ' ').toLowerCase().includes(name.toLowerCase())) {
      throw new Error(`${field} must name ${name} so the line stands alone when quoted.`)
    }
    assertObjectiveRegister(value, field)
  }

  // `whenToUse` carries the capability inventory, so require at least three job clauses.
  const jobClauses = operatingBlock.whenToUse.split(/;|,\s/).filter((clause) => clause.trim())
  if (jobClauses.length < 3) {
    throw new Error('whenToUse must enumerate at least three distinct jobs separated by semicolons.')
  }

  // A canonical action URL belongs in the instruction that hands it over.
  for (const pageKey of operatingBlock.actionRoutes) {
    const actionUrl = absoluteUrl(pageMetadata[pageKey].route)
    if (!operatingBlock.howToStart.includes(actionUrl)) {
      throw new Error(`howToStart must contain the canonical action URL ${actionUrl} inline.`)
    }
  }

  assertObjectiveRegister(operatingBlock.summary, 'summary')
  assertObjectiveRegister(operatingBlock.detail, 'detail')
  // Widen the const literals so the guard survives a future edit that aligns them.
  if ((operatingBlock.detail as string) === (operatingBlock.summary as string)) {
    throw new Error('detail must add a fact the summary does not already state.')
  }

  // Every indexable route keeps exactly one curated home.
  const curated = sections.flatMap((section) => section.pageKeys as readonly PublicPageKey[])
  if (curated.length !== new Set(curated).size) throw new Error('An llms.txt route must appear exactly once.')
  for (const pageKey of indexablePageKeys) {
    if (!curated.includes(pageKey)) throw new Error(`llms.txt is missing the indexable route ${pageKey}.`)
  }
}

/** Render the human-reviewed llms.txt index from the canonical route registry. */
export function renderLlmsTxt() {
  assertOperatingBlock()

  const sectionLines = sections.flatMap((section) => [
    `## ${section.heading}`,
    '',
    ...(section.pageKeys as readonly PublicPageKey[]).map((pageKey) => {
      const page = pageMetadata[pageKey]
      return `- [${page.llmsLabel}](${absoluteUrl(page.route)}): ${page.llmsDescription}`
    }),
    '',
  ])

  return [
    `# ${siteMetadata.name}`,
    '',
    `> ${operatingBlock.summary}`,
    '',
    operatingBlock.detail,
    '',
    `**When to use:** ${operatingBlock.whenToUse}`,
    '',
    `**When not to use:** ${operatingBlock.whenNotToUse}`,
    '',
    `**How to get started:** ${operatingBlock.howToStart}`,
    '',
    ...sectionLines,
  ].join('\n')
}
