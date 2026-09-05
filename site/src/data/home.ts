/**
 * Homepage content, hoisted out of the page so the markup stays readable.
 */

/** The four engine stages shown in the process section. */
export const STAGES = [
  {
    numeral: '01',
    name: 'Intake',
    copy: 'You hand over the statements exactly as you hold them — no sorting, no renaming, no templates. The engine works out the bank, the account holder and the dates on its own.',
  },
  {
    numeral: '02',
    name: 'Extraction',
    copy: 'Thousands of pages collapse into one structured Excel ledger: every transaction from every account, entered, dated and reconciled in a single workbook.',
  },
  {
    numeral: '03',
    name: 'Analysis',
    copy: 'The engine reads for meaning, not just data — spending patterns, anomalies, and money moving between related accounts and across currencies.',
  },
  {
    numeral: '04',
    name: 'Findings',
    copy: 'A written findings report — every finding cited to the exact source page it came from. Human-verifiable, court-ready: evidence, not output.',
  },
]

/** Specification rows for the capabilities section. */
export const SPECS = [
  {
    index: '01',
    name: 'Universal intake',
    copy: 'Any bank, any order, any era of statement: scanned paper handled alongside born-digital PDFs, with no pre-sorting required.',
    tag: 'Input',
  },
  {
    index: '02',
    name: 'Structured ledger',
    copy: 'One Excel workbook holding every transaction: file name, person, date, financial year, description, debit and credit, amount, category.',
    tag: 'Output',
  },
  {
    index: '03',
    name: 'Auto-categorisation',
    copy: 'Every line classified — Woolworths to groceries — so the ledger is ready to filter, pivot and interrogate the day it arrives.',
    tag: 'Analysis',
  },
  {
    index: '04',
    name: 'Anomaly detection',
    copy: 'Cash-withdrawal patterns, gambling and crypto activity and transactions that sit outside the account’s normal rhythm: flagged, not buried.',
    tag: 'Analysis',
  },
  {
    index: '05',
    name: 'Cross-account tracing',
    copy: 'Money followed between related accounts, including cross-currency matches: Australian dollars to euros through an international transfer, reconciled line to line.',
    tag: 'Analysis',
  },
  {
    index: '06',
    name: 'Source-linked findings',
    copy: 'A written report in which every finding traces to the exact source PDF page. Human-verifiable at every step: no hallucination risk.',
    tag: 'Report',
  },
]

/** Audience cards; the first is the core matter type and spans wider on desktop. */
export const AUDIENCES = [
  {
    name: 'Family law property matters',
    copy: 'Property pools that turn on years of statements: contributions, drawings and transfers traced across every account in the pool.',
    note: 'The core matter type',
    featured: true,
  },
  {
    name: 'In-house & institutional legal teams',
    copy: 'Engaged per matter as a specialist provider: nothing to roll out, suited to overloaded teams with every reason to save time.',
    featured: false,
  },
  {
    name: 'Forensic accountants & investigators',
    copy: 'Replaces manual Excel conversion and surface-level reporting with a structured, source-linked ledger from day one.',
    featured: false,
  },
  {
    name: 'Insolvency practitioners',
    copy: 'Dissipated assets followed across accounts, currencies and years, with the paper trail to prove it.',
    featured: false,
  },
  {
    name: 'Estate & financial-abuse matters',
    copy: 'Executor misconduct and elder financial abuse, evidenced line by line and traced back to source.',
    featured: false,
  },
]
