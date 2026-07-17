import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import './engine-ledger.css'
import { bricolage, fragmentMono } from './fonts'
import CurrencyMatch from './CurrencyMatch'
import Hero from './Hero'
import LedgerPlate from './LedgerPlate'
import Reveal from './Reveal'
import Stat from './Stat'
import { internalRobots } from '../internal-design-metadata'

/**
 * Evidence Engine variant — "Ledger" (/engine-ledger).
 *
 * The chosen obsidian-and-gold system with three controlled changes:
 *   1. Hero output: documents passing the golden gate are entered onto ONE
 *      large spreadsheet — headers, gridlines, row numbers, transaction rows
 *      landing line by line — so the right-hand side reads unmistakably as
 *      a ledger being filled.
 *   2. A centrepiece section: the reconciling statement table (proven on
 *      /ledger/) reborn entirely in engine language, with a flawless
 *      flag-draw treatment.
 *   3. The cross-currency match set-piece, reconstructed in engine gold.
 * The /engine/ base remains untouched for comparison.
 */
export const metadata: Metadata = {
  title: 'The Evidence Engine — Ledger',
  description:
    'FinTrace Evidence Engine, ledger variant — the reconciling statement table in obsidian and gold. Thousands of pages become one source-linked ledger.',
  robots: internalRobots,
}

/* ---------------------------------------------------------------------------
 * Static content — hoisted to module scope so nothing re-renders it.
 * ------------------------------------------------------------------------- */

/** The four engine stages shown in the process section. */
const STAGES = [
  {
    numeral: '01',
    name: 'Intake',
    copy: 'Bulk PDFs in any order, from any bank — scanned paper and born-digital alike. No pre-sorting, no templates: the engine reads bank, account holder and dates itself.',
  },
  {
    numeral: '02',
    name: 'Extraction',
    copy: 'Thousands of pages become one structured Excel ledger: file name, person, date, financial year, description, debit, credit, amount, category.',
  },
  {
    numeral: '03',
    name: 'Analysis',
    copy: 'The engine looks deeper — cash-withdrawal patterns, gambling and crypto activity, transfers between related accounts, and cross-currency matches.',
  },
  {
    numeral: '04',
    name: 'Findings',
    copy: 'A written findings report in which every finding cites the exact source page. Human-verifiable, court-ready — evidence, not output.',
  },
]

/** Specification rows for the capabilities section. */
const SPECS = [
  {
    index: '01',
    name: 'Universal intake',
    copy: 'Any bank, any order, any era of statement — scanned paper handled alongside born-digital PDFs, with no pre-sorting required.',
    tag: 'Input',
  },
  {
    index: '02',
    name: 'Structured ledger',
    copy: 'One Excel workbook holding every transaction: file, person, date, financial year, description, debit and credit, amount, category.',
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
    copy: 'Cash-withdrawal patterns, gambling and crypto activity, and transactions that sit outside the account’s normal rhythm — flagged, not buried.',
    tag: 'Analysis',
  },
  {
    index: '05',
    name: 'Cross-account tracing',
    copy: 'Money followed between related accounts, including cross-currency matches — rupees to Australian dollars through Wise, reconciled line to line.',
    tag: 'Analysis',
  },
  {
    index: '06',
    name: 'Source-linked findings',
    copy: 'A written report in which every finding traces to the exact source PDF page. Human-verifiable at every step — no hallucination risk.',
    tag: 'Report',
  },
]

/** Audience cards; the first is the proven wedge and spans wider on desktop. */
const AUDIENCES = [
  {
    name: 'Family law property matters',
    copy: 'Property pools that turn on years of statements — the matters FinTrace was proven on: thousands of pages, dozens of accounts, fifteen years of history.',
    note: 'The proven wedge',
    featured: true,
  },
  {
    name: 'Public trustees & government legal',
    copy: 'Engaged per matter as a specialist provider — suited to procurement, and to overloaded teams with every reason to save time.',
    featured: false,
  },
  {
    name: 'Forensic accountants & investigators',
    copy: 'Replaces manual Excel conversion and surface-level reporting with a structured, source-linked ledger from day one.',
    featured: false,
  },
  {
    name: 'Insolvency practitioners',
    copy: 'Dissipated assets followed across accounts, currencies and years — with the paper trail to prove it.',
    featured: false,
  },
  {
    name: 'Estate & financial-abuse matters',
    copy: 'Executor misconduct and elder financial abuse, evidenced line by line and traced back to source.',
    featured: false,
  },
]

/** Site header: bespoke wordmark with the luminous gate bar between Fin and Trace. */
function Header() {
  return (
    <header className="eng-header">
      <Link href="/engine-ledger/" className="eng-wordmark" aria-label="FinTrace — The Evidence Engine, ledger variant">
        <span>Fin</span>
        <span className="eng-wordmark-bar" aria-hidden="true" />
        <span className="eng-gold-text">Trace</span>
      </Link>
      <nav className="eng-header-nav" aria-label="Page sections">
        <a href="#process">Process</a>
        <a href="#capabilities">Capabilities</a>
        <a href="#proof">Proof</a>
        <a className="eng-btn-gold eng-btn-sm" href="mailto:hello@fintrace.com.au">
          Request assessment
        </a>
      </nav>
    </header>
  )
}

export default function EngineLedgerPage() {
  return (
    <div className={clsx('dsn-engine-ledger', bricolage.variable, fragmentMono.variable)}>
      <Header />
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

        {/* ------------------------ Reconciled ledger ----------------------- */}
        <section className="eng-section eng-cv" id="ledger">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The ledger, reconciled</p>
              <h2 className="eng-h2">
                Every line entered. <span className="eng-gold-text">Every line sourced.</span>
              </h2>
              <p className="eng-lede">
                Watch the engine work: statement lines entered, categorised and reconciled — and the one that warrants
                attention, flagged with its source page attached.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <LedgerPlate />
            </Reveal>
          </div>
        </section>

        {/* ----------------------- Cross-currency match --------------------- */}
        <section className="eng-section eng-cv" id="match">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">Traced across currencies</p>
              <h2 className="eng-h2">
                Same funds, two currencies. <span className="eng-gold-text">One match.</span>
              </h2>
              <p className="eng-lede">
                Money that changes currency does not change identity. Rupees leaving an overseas account are matched
                to the dollars that landed here — with source pages cited for both sides.
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
                Trust is the entire product. Each capability exists so a finding can be put in front of a Principal
                Legal Officer — or a court — and hold.
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

        {/* ----------------------------- Proof ----------------------------- */}
        <section className="eng-section eng-cv" id="proof">
          <div className="eng-container">
            <Reveal className="eng-plate eng-proof">
              <p className="eng-kicker">Proven on a live matter</p>
              <h2 className="eng-h2">
                Fifty hours of review. <span className="eng-gold-text">Delivered in about ten.</span>
              </h2>
              <div className="eng-proof-stats">
                <div className="eng-proof-stat">
                  {/* The signature stat runs the meter backwards: 50 → 10 */}
                  <p className="eng-stat-value">
                    <Stat from={50} to={10} suffix=" hrs" duration={2200} />
                  </p>
                  <p className="eng-stat-label">Hours of review on a real matter — from an estimated fifty</p>
                </div>
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">
                    <Stat to={50} prefix="≈" />
                  </p>
                  <p className="eng-stat-label">Accounts traced in a single matter</p>
                </div>
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">
                    <Stat to={15} suffix=" yrs" />
                  </p>
                  <p className="eng-stat-label">Of statements reconciled end to end</p>
                </div>
                <div className="eng-proof-stat">
                  <p className="eng-stat-value">1,000s</p>
                  <p className="eng-stat-label">Of pages consolidated into one ledger</p>
                </div>
              </div>
              <p className="eng-proof-note">
                FinTrace’s findings closely matched the analysis the instructing lawyer prepared independently — and
                arrived in a fifth of the time.
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
                FinTrace is a specialist forensic service, engaged per matter — a flat engagement fee plus per-page
                pricing. Send the statements; receive the ledger, the findings, and the sources to back them.
              </p>
              <div className="eng-hero-ctas">
                <a className="eng-btn-gold eng-btn-loop" href="mailto:hello@fintrace.com.au">
                  Request a matter assessment
                </a>
                <a className="eng-btn-ghost" href="mailto:hello@fintrace.com.au">
                  hello@fintrace.com.au
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ----------------------------- Footer ------------------------------ */}
      <footer className="eng-footer">
        <div className="eng-container eng-footer-inner">
          <div>
            <p className="eng-wordmark eng-footer-mark">
              <span>Fin</span>
              <span className="eng-wordmark-bar" aria-hidden="true" />
              <span className="eng-gold-text">Trace</span>
            </p>
            <p className="eng-footer-line">Forensic financial analysis for the legal profession.</p>
          </div>
          <div className="eng-footer-meta">
            <a href="mailto:hello@fintrace.com.au">hello@fintrace.com.au</a>
            <p>Engaged per matter · Australia-wide</p>
          </div>
        </div>
        <div className="eng-container eng-footer-small">
          <p>© 2026 FinTrace. Every finding traceable to its source.</p>
        </div>
      </footer>

      {/* Fixed return chip to the design-lab index */}
      <Link href="/internal-design/" className="eng-lab-chip">
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" aria-hidden="true">
          <path d="M7 1 2 5l5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Design lab · Engine variant — ledger
      </Link>
    </div>
  )
}
