import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from './Reveal'
import { chambersBody, chambersDisplay, chambersEngraved } from './fonts'
import './chambers.css'

/**
 * Design 6 — “Chambers”.
 *
 * The most conservative, gravitas-led concept of the six: the quiet luxury
 * of established legal chambers. Deep green fields, parchment plates,
 * aged-gold hairlines and engraved Cinzel labels. Wow through restraint:
 * a letterpress hero reveal, a settling wax seal, and rules that draw
 * themselves open as the reader descends.
 */

export const metadata: Metadata = {
  title: 'Chambers',
  description:
    'Design 6 — Chambers: quiet luxury and engraved discretion for FinTrace, the specialist forensic financial analysis service to the legal profession.',
}

/* ---------------------------------------------------------------------------
 * Static content registers.
 * Keep every copy block in one place so voice edits never require touching
 * markup, and so the section components below stay purely presentational.
 * ------------------------------------------------------------------------- */

/** Four movements of a matter, presented as an engraved order of service. */
const ENGAGEMENT_STEPS = [
  {
    numeral: 'I',
    title: 'Delivery',
    body: 'Provide the statements exactly as they are — any bank, any order, scanned paper included. No sorting, no preparation, no schedule of documents required.',
  },
  {
    numeral: 'II',
    title: 'Conversion',
    body: 'Thousands of pages become a single structured schedule: person, date, financial year, description, debit, credit, amount and category — every line in its place.',
  },
  {
    numeral: 'III',
    title: 'Analysis',
    body: 'Every transaction is categorised, and the record is read as a whole: patterns, anomalies and movements between accounts are identified and matched.',
  },
  {
    numeral: 'IV',
    title: 'Findings',
    body: 'A written report of findings, with every finding cited to its source page. Verifiable by hand, and fit to be put before the other side or the court.',
  },
]

/** What the analysis surfaces — the capabilities register. */
const CAPABILITIES = [
  {
    title: 'Cash-withdrawal patterns',
    body: 'Repeated and structured withdrawals surfaced across accounts and across years, not page by page.',
  },
  {
    title: 'Gambling and crypto activity',
    body: 'Flagged by merchant and counterparty, and read against the household’s ordinary pattern of spending.',
  },
  {
    title: 'Movements between accounts',
    body: 'Transfers between family members and related entities matched on both sides of the ledger.',
  },
  {
    title: 'Cross-currency matches',
    body: 'Funds followed across currencies — rupee-to-AUD transfers through Wise, reconciled to the dollar.',
  },
  {
    title: 'Complete categorisation',
    body: 'Every transaction classified — Woolworths to groceries — so counsel reads a record, not a riddle.',
  },
]

/** The engraved case-record statistics from a real matter. */
const CASE_STATS = [
  { label: 'Hours, as estimated', value: '50' },
  { label: 'Hours, as delivered', value: '10' },
  { label: 'Accounts traced', value: '50' },
  { label: 'Years of statements', value: '15' },
]

/** Whom the service is retained by. */
const AUDIENCES = [
  {
    name: 'Family-law practices',
    body: 'Property matters that turn on tracing money through the parties’ accounts — the service’s proven ground.',
  },
  {
    name: 'Public trustees & government legal',
    body: 'Per-matter engagement suited to procurement, for teams with heavy books and no appetite for software.',
  },
  {
    name: 'Forensic accountants & investigators',
    body: 'The manual conversion and first-pass review of statements, done before the real work begins.',
  },
  {
    name: 'Insolvency practitioners',
    body: 'Dissipated assets followed through the record, however many accounts they pass through.',
  },
  {
    name: 'Estates & misappropriation matters',
    body: 'Executor misconduct and financial abuse, evidenced line by line and cited to the page.',
  },
]

/* ---------------------------------------------------------------------------
 * Small presentational pieces.
 * ------------------------------------------------------------------------- */

/** Engraved FinTrace wordmark: hairline rules above and below the name. */
function Wordmark() {
  return (
    <span className="inline-flex flex-col gap-1.5">
      <span className="ch-wordmark-rule" aria-hidden="true" />
      <span className="ch-wordmark-name">FinTrace</span>
      <span className="ch-wordmark-rule" aria-hidden="true" />
      <span className="ch-wordmark-sub">Forensic Financial Analysis</span>
    </span>
  )
}

/** Centred lozenge divider used between major passages of a section. */
function Divider({ className }: { className?: string }) {
  return (
    <div className={`ch-divider ${className ?? ''}`} aria-hidden="true">
      <span />
    </div>
  )
}

/**
 * Wax-seal emblem: a milled-edge circular seal carrying the FT monogram.
 * Pure inline SVG so the mark ships with the page and scales crisply.
 */
function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {/* Milled outer edge suggested by a fine dashed ring */}
      <circle cx="60" cy="60" r="57" fill="none" stroke="var(--ch-gold)" strokeWidth="1.4" strokeDasharray="2.5 3.2" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ch-gold)" strokeWidth="0.8" opacity="0.75" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="var(--ch-gold)" strokeWidth="0.5" opacity="0.4" />
      {/* Engraved lozenges at the cardinal points of the inner ring */}
      <rect x="57.5" y="24.5" width="5" height="5" fill="var(--ch-gold)" transform="rotate(45 60 27)" opacity="0.9" />
      <rect x="57.5" y="90.5" width="5" height="5" fill="var(--ch-gold)" transform="rotate(45 60 93)" opacity="0.9" />
      {/* Monogram and founding year in the engraved face */}
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fill="var(--ch-gold)"
        fontSize="28"
        letterSpacing="6"
        style={{ fontFamily: 'var(--font-ch-engraved), serif' }}
      >
        FT
      </text>
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fill="var(--ch-gold)"
        fontSize="6.5"
        letterSpacing="3"
        opacity="0.85"
        style={{ fontFamily: 'var(--font-ch-engraved), serif' }}
      >
        MMXXVI
      </text>
    </svg>
  )
}

/* ---------------------------------------------------------------------------
 * Page sections.
 * ------------------------------------------------------------------------- */

/** Header: wordmark to the left, a single engraved call to action right. */
function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <Link href="/chambers/" className="ch-press" style={{ animationDelay: '80ms' }}>
          <Wordmark />
        </Link>
        <a
          href="mailto:hello@fintrace.com.au"
          className="ch-textlink ch-press hidden sm:inline-block"
          style={{ animationDelay: '160ms' }}
        >
          Request an assessment
        </a>
      </div>
    </header>
  )
}

/** Hero: the letterpress reveal beneath a breathing candle-warm light. */
function Hero() {
  return (
    <section className="ch-grain-light relative overflow-hidden" style={{ backgroundColor: 'var(--ch-green)' }}>
      <div className="ch-candle" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-40 pb-24 text-center sm:px-10 sm:pt-48 sm:pb-32">
        {/* Engraved designation line pressed in first */}
        <p className="ch-label ch-press" style={{ animationDelay: '350ms' }}>
          A specialist forensic service to the legal profession
        </p>

        {/* Upper hairline draws outward from centre */}
        <div className="ch-hairline ch-rule-draw mx-auto mt-8 max-w-md" style={{ animationDelay: '550ms' }} />

        {/* The headline settles like type pressed into paper */}
        <h1
          className="ch-display ch-press mx-auto mt-10 max-w-3xl text-[2.6rem] leading-[1.08] sm:text-6xl md:text-[4.4rem]"
          style={{ animationDelay: '700ms' }}
        >
          Forensic analysis,
          <br />
          <em className="font-light italic">quietly done.</em>
        </h1>

        {/* Lower hairline mirrors the first */}
        <div className="ch-hairline ch-rule-draw mx-auto mt-10 max-w-md" style={{ animationDelay: '850ms' }} />

        {/* Deck copy with the seal settling in beside it */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-12 sm:text-left">
          <p className="ch-muted-on-green ch-press text-lg leading-relaxed" style={{ animationDelay: '1050ms' }}>
            FinTrace takes delivery of bank statements in their thousands — any bank, any order, scanned paper included
            — and returns a single court-ready schedule, a written report of findings, and a citation for every line.
          </p>
          <Seal className="ch-seal w-28 flex-none sm:w-36" />
        </div>

        {/* Calls to action, pressed in last */}
        <div
          className="ch-press mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10"
          style={{ animationDelay: '1250ms' }}
        >
          <a href="mailto:hello@fintrace.com.au" className="ch-btn ch-btn--on-green">
            Request a matter assessment
          </a>
          <a href="#engagement" className="ch-textlink">
            The manner of engagement
          </a>
        </div>
      </div>
    </section>
  )
}

/** The four movements of an engagement, set as an order of service. */
function Engagement() {
  return (
    <section
      id="engagement"
      className="ch-grain-dark relative"
      style={{ backgroundColor: 'var(--ch-parchment)', color: 'var(--ch-ink)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="text-center">
          <p className="ch-label">The manner of engagement</p>
          <h2 className="ch-display mx-auto mt-6 max-w-2xl text-4xl sm:text-5xl">From delivery to findings.</h2>
        </Reveal>

        <Reveal className="ch-hairline ch-reveal--rule mx-auto mt-12 max-w-xs" as="div" />

        {/* Four numbered movements; each rises in turn */}
        <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENT_STEPS.map((step, index) => (
            <Reveal key={step.numeral} delay={index * 120}>
              <div className="ch-numeral">{step.numeral}</div>
              <p className="ch-label mt-5" style={{ color: 'var(--ch-ink)' }}>
                {step.title}
              </p>
              <p className="ch-muted-on-parchment mt-4 text-[0.98rem] leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Capabilities on the green field, beside a cited excerpt slip. */
function Capabilities() {
  return (
    <section className="ch-grain-light relative" style={{ backgroundColor: 'var(--ch-green)' }}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="max-w-2xl">
          <p className="ch-label">The analysis</p>
          <h2 className="ch-display mt-6 text-4xl sm:text-5xl">What the record reveals.</h2>
        </Reveal>

        <div className="mt-16 grid items-start gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Register of capabilities with engraved lozenge markers */}
          <ul className="space-y-10">
            {CAPABILITIES.map((capability, index) => (
              <Reveal as="li" key={capability.title} delay={index * 90} className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="mt-2 h-[7px] w-[7px] flex-none rotate-45 border"
                  style={{ borderColor: 'var(--ch-gold)' }}
                />
                <div>
                  <h3
                    className="ch-label"
                    style={{ color: 'var(--ch-cream)', letterSpacing: '0.24em', fontSize: '0.78rem' }}
                  >
                    {capability.title}
                  </h3>
                  <p className="ch-muted-on-green mt-3 leading-relaxed">{capability.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          {/* The citation slip: traceability made literal */}
          <Reveal delay={200}>
            <figure className="ch-citation p-8 sm:p-10">
              <figcaption className="ch-label" style={{ color: 'var(--ch-oxblood)', letterSpacing: '0.3em' }}>
                Cited
              </figcaption>
              <blockquote className="mt-6 text-[1.05rem] leading-relaxed italic">
                Finding 14 — a pattern of cash withdrawals, $9,800 at a time, March to June 2021, across three
                accounts.
              </blockquote>
              <p className="ch-muted-on-parchment mt-6 text-sm leading-relaxed">
                Source: ANZ_Statement_2021_03.pdf, page 47, line 12.
              </p>
              <div className="ch-hairline mt-8" />
              <p className="ch-muted-on-parchment mt-6 text-sm leading-relaxed">
                Every finding cites its source — the file and the page — so it can be verified by hand before it is
                relied upon. Nothing rests on the tool’s word alone.
              </p>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** The case-record plate: engraved statistics from a real matter. */
function CaseRecord() {
  return (
    <section
      className="ch-grain-dark relative"
      style={{ backgroundColor: 'var(--ch-parchment-soft)', color: 'var(--ch-ink)' }}
    >
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="text-center">
          <p className="ch-label">The case record</p>
          <h2 className="ch-display mx-auto mt-6 max-w-2xl text-4xl sm:text-5xl">
            From a recent family-law property matter.
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="ch-plate mt-16 px-8 py-12 sm:px-14 sm:py-16">
            <div className="grid gap-y-12 text-center sm:grid-cols-2 lg:grid-cols-4">
              {CASE_STATS.map((stat) => (
                <div key={stat.label} className="px-2">
                  <div className="ch-stat-number">{stat.value}</div>
                  <p className="ch-label mt-4" style={{ color: 'var(--ch-ink-soft)', letterSpacing: '0.26em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <Divider className="mx-auto mt-12 max-w-md" />
            <p className="ch-muted-on-parchment mx-auto mt-10 max-w-2xl text-center leading-relaxed">
              Thousands of pages, delivered back as one schedule and a written report. The findings closely matched the
              solicitor’s own analysis, prepared independently for the client and the other side.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** A single grand pull quote on the green field. */
function PullQuote() {
  return (
    <section className="ch-grain-light relative" style={{ backgroundColor: 'var(--ch-green-deep)' }}>
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-10 sm:py-32">
        <Reveal>
          <div className="ch-display text-7xl leading-none" style={{ color: 'var(--ch-gold)' }} aria-hidden="true">
            “
          </div>
          <blockquote className="ch-display mt-2 text-3xl leading-snug italic sm:text-4xl">
            The findings closely matched what we had sent, independently, to our client and to the other side.
          </blockquote>
          <p className="ch-label mt-10">A principal solicitor — family-law property matter</p>
        </Reveal>
      </div>
    </section>
  )
}

/** Whom we serve: an engraved directory of practice areas. */
function Audiences() {
  return (
    <section
      className="ch-grain-dark relative"
      style={{ backgroundColor: 'var(--ch-parchment)', color: 'var(--ch-ink)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="text-center">
          <p className="ch-label">Whom we serve</p>
          <h2 className="ch-display mx-auto mt-6 max-w-2xl text-4xl sm:text-5xl">
            Retained wherever money must be followed.
          </h2>
        </Reveal>

        {/* Directory rows: name to the left, particulars to the right */}
        <div className="mt-16">
          {AUDIENCES.map((audience, index) => (
            <Reveal
              key={audience.name}
              delay={index * 80}
              className="ch-directory-row grid gap-3 px-4 py-8 sm:grid-cols-[1fr_1.4fr] sm:gap-10 sm:px-8"
            >
              <h3 className="ch-label self-start" style={{ color: 'var(--ch-ink)', fontSize: '0.78rem' }}>
                {audience.name}
              </h3>
              <p className="ch-muted-on-parchment leading-relaxed">{audience.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Final call to action: a formal invitation card on the green field. */
function Invitation() {
  return (
    <section className="ch-grain-light relative" style={{ backgroundColor: 'var(--ch-green)' }}>
      <div className="mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <div className="ch-plate px-8 py-14 text-center sm:px-14 sm:py-16" style={{ color: 'var(--ch-ink)' }}>
            <p className="ch-label" style={{ color: 'var(--ch-oxblood)', letterSpacing: '0.32em' }}>
              An invitation to the profession
            </p>
            <h2 className="ch-display mx-auto mt-8 max-w-md text-4xl sm:text-[2.9rem]">
              Submit a matter for assessment.
            </h2>
            <Divider className="mx-auto mt-8 max-w-[10rem]" />
            <p className="ch-muted-on-parchment mx-auto mt-8 max-w-md leading-relaxed">
              Engagements are accepted per matter — a flat cost with per-page pricing, agreed before work begins.
              Statements are received in confidence; findings are returned in a form that stands before a court.
            </p>
            <a href="mailto:hello@fintrace.com.au" className="ch-btn ch-btn--solid mt-12">
              Request a matter assessment
            </a>
            <p className="ch-muted-on-parchment mt-8 text-sm tracking-wide">hello@fintrace.com.au</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Footer: the closing plate of the brochure. */
function Footer() {
  return (
    <footer
      className="ch-grain-light relative"
      style={{ backgroundColor: 'var(--ch-green-deep)', color: 'var(--ch-cream)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:px-10">
        <Wordmark />
        <p className="ch-muted-on-green mx-auto mt-8 max-w-md text-sm leading-relaxed">
          Engaged per matter · Flat cost with per-page pricing · Australia
        </p>
        <a
          href="mailto:hello@fintrace.com.au"
          className="ch-textlink mt-6 inline-block"
          style={{ letterSpacing: '0.18em' }}
        >
          hello@fintrace.com.au
        </a>
        <div className="ch-hairline mx-auto mt-12 max-w-xs" />
        <p className="ch-muted-on-green mt-8 text-xs tracking-[0.22em] uppercase">
          © MMXXVI FinTrace — Forensic Financial Analysis
        </p>
      </div>
    </footer>
  )
}

/* ---------------------------------------------------------------------------
 * Page assembly.
 * ------------------------------------------------------------------------- */

export default function ChambersPage() {
  return (
    <div
      className={`dsn-chambers ${chambersDisplay.variable} ${chambersBody.variable} ${chambersEngraved.variable} relative`}
    >
      <Header />
      <main>
        <Hero />
        <Engagement />
        <Capabilities />
        <CaseRecord />
        <PullQuote />
        <Audiences />
        <Invitation />
      </main>
      <Footer />

      {/* Fixed return link to the design-lab gallery */}
      <Link href="/" className="ch-lab-chip">
        Design lab
      </Link>
    </div>
  )
}
