import type { CSSProperties } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import './engine-network.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from './fonts'
import CurrencyMatch from './CurrencyMatch'
import Hero from './Hero'
import LedgerPlate from './LedgerPlate'
import Reveal from './Reveal'
import Stat from './Stat'
import { SiteFooter, SiteHeader } from './SiteChrome'
import TraceDiagram from './TraceDiagram'

/**
 * Engine variant V4 — "Network". THE FLAGSHIP (round-four decision).
 *
 * The base Evidence Engine's obsidian-and-gold system with a trace-led hero:
 * documents pass the scanning gate and re-emerge as an account-network
 * constellation — glowing account nodes joined by golden threads, one flagged
 * hop in restrained crimson.
 *
 * Below the fold this page now consolidates every selected set-piece into one
 * story — the evidence, structured (the reconciling ledger table from
 * /engine-ledger), connected (the account-network trace diagram from
 * /engine-trace), and matched (the cross-currency reconstruction) — so the
 * flagship demonstrates the full arc: pages → ledger → network → finding.
 * Every interactive element carries the better-ui polish pass (press
 * feedback, hit areas, layered depth shadows).
 */
/* ---------------------------------------------------------------------------
 * Static content — hoisted to module scope so nothing re-renders it.
 * ------------------------------------------------------------------------- */

/** The four engine stages shown in the process section. */
const STAGES = [
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
const SPECS = [
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
const AUDIENCES = [
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

type EngineNetworkPageProps = {
  showDesignLabLink: boolean
}

export default function EngineNetworkPage({ showDesignLabLink }: EngineNetworkPageProps) {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <SiteHeader hero />
      <main>
        <Hero />

        {/* ---------------------------- Process ---------------------------- */}
        <section className="eng-section" id="process">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The process</p>
              <h2 className="eng-h2">
                Four stages. <span className="eng-gold-text">One chain of evidence.</span>
              </h2>
            </Reveal>
            <Reveal className="eng-stages-wrap">
              {/* Progress line draws across (or down, on mobile) once visible */}
              <span className="eng-stage-line" aria-hidden="true" />
              <div className="eng-stages">
                {STAGES.map((stage, index) => (
                  <article key={stage.numeral} className="eng-stage" style={{ '--i': index } as CSSProperties}>
                    <p className="eng-stage-numeral">{stage.numeral}</p>
                    <h3>{stage.name}</h3>
                    <p className="eng-stage-copy">{stage.copy}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------ Reconciled ledger -----------------------
            Act one of the evidence story: thousands of pages become one
            structured, source-linked ledger (set-piece from /engine-ledger) */}
        <section className="eng-section eng-cv" id="ledger">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The evidence, structured</p>
              <h2 className="eng-h2">
                Every line entered. <span className="eng-gold-text">Every line sourced.</span>
              </h2>
              <p className="eng-lede">
                Before anything can be proven, it has to be structured. Thousands of pages become one ledger — every
                line entered, categorised and reconciled, and the one that warrants attention flagged with its source
                page attached.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <LedgerPlate />
            </Reveal>
          </div>
        </section>

        {/* ------------------------- Trace analysis -------------------------
            Act two: the ledger's accounts are mapped and the money is
            followed between them (set-piece from /engine-trace) */}
        <section className="eng-section eng-cv" id="tracing">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The evidence, connected</p>
              <h2 className="eng-h2">
                Every account. <span className="eng-gold-text">One trail of evidence.</span>
              </h2>
              <p className="eng-lede">
                Bank statements show each account in isolation. The engine connects them, following the money from one
                account to the next — through cash, related accounts and international transfers. Every hop is dated,
                valued and cited to its source page.
              </p>
            </Reveal>
            <Reveal className="eng-plate eng-tnet-plate" delay={120}>
              <TraceDiagram />
              <p className="eng-diagram-caption">
                The route, reconstructed from the extract above. The flagged withdrawal is the single crimson hop.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ----------------------- Cross-currency match ---------------------
            Act three: the trail holds even where the money changes currency */}
        <section className="eng-section eng-cv" id="match">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The evidence, matched</p>
              <h2 className="eng-h2">
                Same funds. <span className="eng-gold-text">Two currencies.<br />One match.</span>
              </h2>
              <p className="eng-lede">
                A transfer that changes currency is where most trails go cold. This one doesn’t: the dollars leaving
                Australia are matched to the euros that arrive overseas two days later, with the amount and the exchange
                rate reconciled on both sides.
              </p>
            </Reveal>
            <Reveal className="eng-plate eng-ecm-plate" delay={120}>
              <CurrencyMatch />
            </Reveal>
          </div>
        </section>

        {/* -------------------------- Capabilities ------------------------- */}
        <section className="eng-section eng-cv" id="capabilities">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">Specifications</p>
              <h2 className="eng-h2">Built to withstand scrutiny.</h2>
              <p className="eng-lede">
                Trust is the entire product. Each capability exists so a finding can be put in front of a senior lawyer,
                opposing counsel — or a court — and hold.
              </p>
            </Reveal>
            <div className="eng-specs">
              {SPECS.map((spec, index) => (
                <Reveal as="article" key={spec.index} className="eng-spec" delay={index * 70}>
                  <p className="eng-spec-index">{spec.index}</p>
                  <h3 className="eng-spec-name">{spec.name}</h3>
                  <p className="eng-spec-copy">{spec.copy}</p>
                  <p className="eng-spec-tag">{spec.tag}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- Outcome ---------------------------- */}
        <section className="eng-section eng-cv" id="proof">
          <div className="eng-container">
            <Reveal className="eng-plate eng-proof">
              <p className="eng-kicker">The outcome</p>
              <h2 className="eng-h2">
                Statements in. <span className="eng-gold-text">Evidence out.</span>
              </h2>
              <div className="eng-proof-stats">
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">1,000s</p>
                  <p className="eng-stat-label">Of pages consolidated into a single ledger</p>
                </div>
                <div className="eng-proof-stat">
                  {/* Keep the plate's single animated numeral: a count-up to full coverage */}
                  <p className="eng-stat-value">
                    <Stat to={100} suffix="%" duration={2200} />
                  </p>
                  <p className="eng-stat-label">Of findings cited to the exact source page</p>
                </div>
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">Decades</p>
                  <p className="eng-stat-label">Of statements reconciled end to end</p>
                </div>
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">0</p>
                  <p className="eng-stat-label">Software to license, install or learn</p>
                </div>
              </div>
              <p className="eng-proof-note">
                If it can’t be checked, it isn’t a finding: anything the engine asserts, a human can verify against
                its source page in seconds.
              </p>
            </Reveal>
          </div>
        </section>

        {/* --------------------------- Audiences --------------------------- */}
        <section className="eng-section eng-cv" id="for">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">Commissioned for</p>
              <h2 className="eng-h2">For matters that hinge on the money.</h2>
            </Reveal>
            <div className="eng-audience-grid">
              {/* Reveal handles the entrance on the grid cell; the inner article
                  owns the hover lift so the two transforms never fight */}
              {AUDIENCES.map((audience, index) => (
                <Reveal key={audience.name} className={clsx(audience.featured && 'eng-cell-featured')} delay={index * 80}>
                  <article className={clsx('eng-card', audience.featured && 'eng-card-featured')}>
                    {audience.note ? <p className="eng-card-note">{audience.note}</p> : null}
                    <h3>{audience.name}</h3>
                    <p>{audience.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ CTA ------------------------------ */}
        <section className="eng-section eng-cv" id="engage">
          <div className="eng-container">
            <Reveal className="eng-plate eng-cta">
              <span className="eng-cta-sheen" aria-hidden="true" />
              <p className="eng-kicker">Engage the service</p>
              <h2 className="eng-h2">
                Put the engine <span className="eng-gold-text">on your matter.</span>
              </h2>
              <p className="eng-lede eng-cta-lede">
                FinTrace is a specialist forensic service, engaged per matter and quoted in writing before the work
                begins. Send the statements; receive the ledger, the findings and the sources to back them.
              </p>
              <div className="eng-hero-ctas">
                <Link
                  className="eng-btn-gold eng-btn-loop"
                  href="/contact/"
                  data-analytics-cta
                  data-analytics-placement="section"
                  data-analytics-destination="contact"
                >
                  Request a matter assessment
                </Link>
                <Link
                  className="eng-btn-ghost"
                  href="/contact/#enquire"
                  data-analytics-cta
                  data-analytics-placement="section"
                  data-analytics-destination="contact_enquire"
                >
                  Start an enquiry
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      {showDesignLabLink ? (
        <Link href="/internal-design/" className="eng-lab-chip">
          <span aria-hidden="true">←</span>
          Design lab · Engine variant - network
        </Link>
      ) : null}
    </div>
  )
}
