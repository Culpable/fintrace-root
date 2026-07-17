import type { Metadata } from 'next'
import Link from 'next/link'
import './ledger.css'
import { fraunces, newsreader, splineSansMono } from './fonts'
import Reveal from './Reveal'
import CountStat from './CountStat'
import ReconcilingLedger from './ReconcilingLedger'
import { internalRobots } from '../internal-design-metadata'

/**
 * Design 01 — “The Ledger”.
 *
 * A light editorial broadsheet: the financial pages of a great newspaper
 * crossed with a hand-ruled accounting ledger. The courtroom-safe trust
 * anchor of the six FinTrace concepts. Voice: calm, unhurried authority.
 */
export const metadata: Metadata = {
  title: 'The Ledger',
  description:
    'Every dollar, accounted for. FinTrace reads thousands of statement pages and returns one court-ready spreadsheet, a written findings report, and a citation for every line.',
  robots: internalRobots,
}

/** The four-step method, presented as broadsheet column entries. */
const METHOD = [
  {
    no: 'i.',
    title: 'The bundle, as it comes',
    body: 'Statements arrive from any bank, in any order, scanned paper included. FinTrace identifies the institution, the account holder and the period on its own — no sorting, no cover sheets.',
  },
  {
    no: 'ii.',
    title: 'Every line, extracted',
    body: 'Thousands of pages become one structured spreadsheet: file, person, date, financial year, description, debit, credit, amount. One row per transaction, none missing.',
  },
  {
    no: 'iii.',
    title: 'Every line, categorised',
    body: 'Woolworths becomes groceries; Sportsbet becomes gambling. Patterns emerge from the noise because every entry is classified the same way, every time.',
  },
  {
    no: 'iv.',
    title: 'The findings, written up',
    body: 'Anomalies are flagged and set out in a written report — each finding cited to the exact page of the source PDF, so every claim can be checked by hand.',
  },
]

/** The findings index: what FinTrace surfaces from the raw record. */
const FINDINGS = [
  {
    index: 'F. 01',
    title: 'Cash-withdrawal patterns',
    body: 'Repeated ATM and branch withdrawals that step around reporting habits — sized, dated and mapped against the account’s ordinary rhythm.',
    note: 'Each instance cited to its page.',
  },
  {
    index: 'F. 02',
    title: 'Gambling and crypto activity',
    body: 'Wagering deposits and exchange transfers surfaced by name and pattern, however irregular the descriptions.',
    note: 'Categorised consistently across accounts.',
  },
  {
    index: 'F. 03',
    title: 'Transfers between related accounts',
    body: 'Money moving between spouses, companies and family members — matched across institutions so the full route is visible.',
    note: 'Follows funds across ~50 accounts.',
  },
  {
    index: 'F. 04',
    title: 'Cross-currency matches',
    body: 'Outbound transfers paired with their foreign-currency counterparts — in one matter, rupee-to-AUD movements through Wise, matched both ways.',
    note: 'Matched despite the currency change.',
  },
  {
    index: 'F. 05',
    title: 'Every finding, cited',
    body: 'Nothing rests on the tool’s word. Each flagged line carries a citation to the source PDF page, so a lawyer — or a court — can verify it in seconds.',
    note: 'Human-verifiable. No hallucination risk.',
  },
]

/** Audiences, ordered from the proven wedge outward. */
const READERS = [
  {
    title: 'Family law practices',
    tag: 'The proven wedge',
    lead: true,
    body: 'Property matters hinge on tracing money through statements. One matter: thousands of pages, roughly fifty accounts, fifteen years.',
  },
  {
    title: 'Public trustees and government legal',
    tag: 'Per-matter engagement',
    body: 'Overloaded teams with no billable-hour incentive — engaged as a specialist provider, matter by matter, to suit procurement.',
  },
  {
    title: 'Forensic accountants and investigators',
    tag: 'Structured evidence',
    body: 'Manual Excel conversion and surface-level review, superseded. The full record arrives structured, categorised and cited.',
  },
  {
    title: 'Insolvency practitioners',
    tag: 'Dissipated assets',
    body: 'Trace where the money went before the appointment date — across accounts, entities and currencies.',
  },
  {
    title: 'Estate and misappropriation matters',
    tag: 'Financial abuse',
    body: 'Executor misconduct and family members helping themselves: the pattern is in the statements, if every page is read.',
  },
]

export default function LedgerPage() {
  return (
    <div className={`dsn-ledger ${fraunces.variable} ${newsreader.variable} ${splineSansMono.variable}`}>
      {/* ------------------------------------------------ masthead */}
      <header className="lg-masthead">
        <div className="lg-shell lg-masthead-row">
          <a className="lg-logotype" href="#top">
            Fin<em>Trace</em>
            <span className="lg-logotype-tick">.</span>
          </a>
          <span className="lg-masthead-line">Forensic financial analysis — Australia</span>
          <a className="lg-masthead-cta" href="mailto:hello@fintrace.com.au">
            Request a matter assessment
          </a>
        </div>
      </header>

      <main id="top">
        {/* ------------------------------------------------ hero */}
        <section className="lg-hero">
          <div className="lg-shell">
            <div className="lg-hero-kicker lg-enter" style={{ '--enter-i': 0 } as React.CSSProperties}>
              <span className="lg-label">The financial pages, read in full</span>
            </div>
            <h1 className="lg-hero-headline lg-enter" style={{ '--enter-i': 1 } as React.CSSProperties}>
              Every dollar, accounted for<span className="lg-full-stop">.</span>
            </h1>
            <p className="lg-hero-deck lg-enter" style={{ '--enter-i': 2 } as React.CSSProperties}>
              FinTrace reads every page of every bank statement in a matter — thousands of them, in any state —
              and returns one court-ready spreadsheet, a written findings report, and a citation for every line.
            </p>
            <div className="lg-hero-meta lg-enter" style={{ '--enter-i': 3 } as React.CSSProperties}>
              <a className="lg-btn" href="mailto:hello@fintrace.com.au">
                Request a matter assessment
              </a>
              <a className="lg-btn lg-btn-ghost" href="#method">
                Read the method
              </a>
            </div>

            {/* Signature set-piece: the self-reconciling ledger. */}
            <ReconcilingLedger />
          </div>
        </section>

        {/* ------------------------------------------------ 01 · the method */}
        <section className="lg-section" id="method">
          <div className="lg-shell">
            <Reveal>
              <div className="lg-dept">
                <span className="lg-dept-no">01</span>
                <span className="lg-label">The method</span>
              </div>
              <div className="lg-dept-rule" />
              <div className="lg-rise" style={{ marginTop: '2.5rem' }}>
                <p className="lg-narrative lg-dropcap">
                  A matter arrives as boxes. Statements from a dozen institutions, scanned at odd angles, out of
                  order, spanning years — the part of a financial dispute no one is paid enough to enjoy. FinTrace
                  takes the bundle exactly as it comes and returns the record as it should have been kept all
                  along.
                </p>
              </div>
              <div className="lg-method-grid">
                {METHOD.map((step, index) => (
                  <div className="lg-method-item lg-rise-child" style={{ '--stagger-i': index } as React.CSSProperties} key={step.title}>
                    <span className="lg-method-no">{step.no}</span>
                    <h3 className="lg-method-title">{step.title}</h3>
                    <p className="lg-method-body">{step.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ 02 · what surfaces */}
        <section className="lg-section" id="findings">
          <div className="lg-shell">
            <Reveal>
              <div className="lg-dept">
                <span className="lg-dept-no">02</span>
                <span className="lg-label">What surfaces</span>
              </div>
              <div className="lg-dept-rule" />
              <div style={{ marginTop: '1rem' }}>
                {FINDINGS.map((finding, index) => (
                  <div className="lg-finding lg-rise-child" style={{ '--stagger-i': index } as React.CSSProperties} key={finding.index}>
                    <span className="lg-finding-index">{finding.index}</span>
                    <div>
                      <h3 className="lg-finding-title">{finding.title}</h3>
                      <p className="lg-finding-body">{finding.body}</p>
                    </div>
                    <span className="lg-finding-note">{finding.note}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ 03 · the record */}
        <section className="lg-proof lg-section" id="record">
          <div className="lg-shell">
            <Reveal>
              <div className="lg-dept">
                <span className="lg-dept-no">03</span>
                <span className="lg-label">The record</span>
              </div>
              <div className="lg-dept-rule" />
              <div className="lg-stat-grid" style={{ marginTop: '2.5rem' }}>
                <div className="lg-stat lg-rise-child" style={{ '--stagger-i': 0 } as React.CSSProperties}>
                  <div className="lg-stat-value">
                    <CountStat from={50} to={10} />
                    <span className="lg-stat-unit"> hrs</span>
                  </div>
                  <div className="lg-stat-label">A fifty-hour brief, delivered in ten*</div>
                </div>
                <div className="lg-stat lg-rise-child" style={{ '--stagger-i': 1 } as React.CSSProperties}>
                  <div className="lg-stat-value">
                    <CountStat to={50} />
                  </div>
                  <div className="lg-stat-label">Accounts traced in a single matter</div>
                </div>
                <div className="lg-stat lg-rise-child" style={{ '--stagger-i': 2 } as React.CSSProperties}>
                  <div className="lg-stat-value">
                    <CountStat to={15} />
                    <span className="lg-stat-unit"> yrs</span>
                  </div>
                  <div className="lg-stat-label">Of statements, read line by line</div>
                </div>
                <div className="lg-stat lg-rise-child" style={{ '--stagger-i': 3 } as React.CSSProperties}>
                  <div className="lg-stat-value">
                    <CountStat to={100} />
                    <span className="lg-stat-unit">%</span>
                  </div>
                  <div className="lg-stat-label">Of findings cited to a source page</div>
                </div>
              </div>
              <p className="lg-pull lg-rise">
                “The findings corresponded, line for line, with the analysis the instructing lawyer prepared
                independently for his client and the other side.”
              </p>
              <div className="lg-footnote lg-rise">
                <span className="lg-footnote-mark">*</span>
                <span>
                  From a completed matter: a brief estimated at fifty hours of manual review, returned in about
                  ten — spreadsheet, findings report and citations included.
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ 04 · the readership */}
        <section className="lg-section" id="readership" style={{ paddingTop: 'clamp(3.25rem, 7vw, 5.5rem)' }}>
          <div className="lg-shell">
            <Reveal>
              <div className="lg-dept">
                <span className="lg-dept-no">04</span>
                <span className="lg-label">The readership</span>
              </div>
              <div className="lg-dept-rule" />
              <div className="lg-reader-grid">
                {READERS.map((reader, index) => (
                  <div className="lg-reader lg-rise-child" style={{ '--stagger-i': index } as React.CSSProperties} key={reader.title}>
                    <h3 className="lg-reader-title">{reader.title}</h3>
                    <span className={`lg-reader-tag${reader.lead ? ' is-lead' : ''}`}>{reader.tag}</span>
                    <p className="lg-reader-body">{reader.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ 05 · engagement */}
        <section className="lg-cta lg-section" id="engage" style={{ paddingTop: 'clamp(3.25rem, 7vw, 5.5rem)' }}>
          <div className="lg-shell">
            <Reveal>
              <div className="lg-rise">
                <span className="lg-label">05 — Engagement</span>
                <h2 className="lg-cta-headline" style={{ marginTop: '1.5rem' }}>
                  A service, not software<span className="lg-full-stop">.</span>
                </h2>
                <p className="lg-cta-body">
                  FinTrace is engaged per matter — a flat cost plus per-page pricing, agreed before work begins.
                  You brief the documents; you receive the spreadsheet, the findings report and the citations.
                  Nothing to install, nothing to learn.
                </p>
                <div className="lg-hero-meta" style={{ justifyContent: 'center' }}>
                  <a className="lg-btn" href="mailto:hello@fintrace.com.au">
                    Request a matter assessment
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------ footer */}
      <footer className="lg-footer">
        <div className="lg-shell lg-footer-grid">
          <span className="lg-logotype" style={{ fontSize: '1.25rem' }}>
            Fin<em>Trace</em>
            <span className="lg-logotype-tick">.</span>
          </span>
          <span className="lg-footer-small">
            Forensic financial analysis — every figure traceable to its source
          </span>
          <span className="lg-footer-small">
            <a href="mailto:hello@fintrace.com.au">hello@fintrace.com.au</a>
          </span>
        </div>
      </footer>

      {/* Unobtrusive return to the design-lab gallery. */}
      <Link className="lg-lab-chip" href="/internal-design/">
        Design lab — 01 of 06
      </Link>
    </div>
  )
}
