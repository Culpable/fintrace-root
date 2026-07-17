import type { Metadata } from 'next'
import Link from 'next/link'
import './trace.css'
import { archivo, plexMono } from './fonts'
import MoneyFlow from './MoneyFlow'
import Reveal from './Reveal'
import Stat from './Stat'
import TraceNetwork from './TraceNetwork'
import { internalRobots } from '../internal-design-metadata'

export const metadata: Metadata = {
  title: 'Follow the Money',
  description:
    'Design concept 02 — an investigative network-trace homepage for FinTrace, the forensic bank-statement analysis service for legal teams.',
  robots: internalRobots,
}

/** The four-step method, numbered like stages of a trace. */
const STEPS = [
  {
    n: '01',
    title: 'Ingest',
    body: 'Every statement, no pre-sorting. Bulk PDFs from any bank, in any order — scanned paper included. FinTrace identifies the bank, the account holder and the period automatically.',
  },
  {
    n: '02',
    title: 'Reconstruct',
    body: 'One ledger across every account. Thousands of pages become a single structured Excel — person, date, financial year, description, debit, credit, amount — with every transaction categorised automatically.',
  },
  {
    n: '03',
    title: 'Trace',
    body: 'Follow the money between accounts. Cash-withdrawal patterns, gambling and crypto activity, transfers between related accounts, cross-currency matches. The trail is reconstructed hop by hop.',
  },
  {
    n: '04',
    title: 'Report',
    body: 'Findings you can put before a court. A written findings report in which every line traces back to the exact source PDF page. Human-verifiable. No hallucination risk.',
  },
]

/** Findings catalogue - each card carries a mock source reference on hover. */
const FINDINGS = [
  {
    id: 'F-01',
    title: 'Cash-withdrawal patterns',
    body: 'Repeated ATM and branch withdrawals surfaced by size, rhythm and proximity — the classic prelude to undisclosed transfers.',
    src: 'SRC: STMT-041 · P.7',
  },
  {
    id: 'F-02',
    title: 'Gambling & crypto exposure',
    body: 'Wagering accounts, casinos and exchange on-ramps identified and totalled per person, per financial year.',
    src: 'SRC: STMT-113 · P.22',
  },
  {
    id: 'F-03',
    title: 'Related-account transfers',
    body: 'Money moving between spouses, children, companies and trusts — linked across statements that were never meant to be read together.',
    src: 'SRC: STMT-078 · P.3',
  },
  {
    id: 'F-04',
    title: 'Cross-currency matching',
    body: 'A rupee debit overseas matched to an Australian dollar credit at home, reconciled through the FX rate on the day.',
    src: 'SRC: STMT-152 · P.11',
  },
  {
    id: 'F-05',
    title: 'Automatic categorisation',
    body: 'Woolworths becomes groceries; Sportsbet becomes gambling. Every line classified so patterns become visible at a glance.',
    src: 'SRC: LEDGER · COL. I',
  },
  {
    id: 'F-06',
    title: 'Court-ready output',
    body: 'One structured spreadsheet and a written findings report — file name, person, date, amount, category — ready for review and disclosure.',
    src: 'SRC: REPORT · §4',
  },
]

/** Who engages FinTrace, indexed like appendices to a brief. */
const AUDIENCES = [
  {
    id: 'A-01',
    title: 'Family law practices',
    body: 'Property matters that hinge on tracing money through years of statements — the proven wedge.',
  },
  {
    id: 'A-02',
    title: 'Public trustees & government legal',
    body: 'Overloaded teams where hours saved matter more than hours billed.',
  },
  {
    id: 'A-03',
    title: 'Forensic accountants & investigators',
    body: 'Manual Excel conversion and surface-level reporting, superseded in one engagement.',
  },
  {
    id: 'A-04',
    title: 'Insolvency practitioners',
    body: 'Dissipated assets traced across accounts, entities and currencies.',
  },
  {
    id: 'A-05',
    title: 'Estate & misappropriation matters',
    body: 'Executor misconduct and elder financial abuse, evidenced line by line.',
  },
]

export default function TracePage() {
  return (
    <div className={`dsn-trace ${archivo.variable} ${plexMono.variable}`}>
      {/* Unobtrusive return route to the design-lab index */}
      <Link href="/internal-design/" className="lab-chip">
        ← Design lab
      </Link>

      {/* ---- Header ---- */}
      <header className="tr-header">
        <div className="ctn tr-header-row">
          <Link href="/trace/" className="tr-logo" aria-label="FinTrace home">
            FIN<span className="tr-logo-trace">TRACE</span>
          </Link>
          <div className="tr-header-right">
            <a href="mailto:hello@fintrace.com.au" className="tr-header-mail">
              hello@fintrace.com.au
            </a>
            <a href="#cta" className="btn-primary">
              Request assessment
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ---- Hero: headline over the live evidence graph ---- */}
        <section className="tr-hero">
          <TraceNetwork />
          <div className="tr-hero-scrim" aria-hidden="true" />
          <div className="ctn tr-hero-inner">
            <p className="kicker">
              <span className="kicker-dash" /> MATTER 2214 — TRACE ANALYSIS ACTIVE
            </p>
            <h1 className="tr-h1">
              MONEY LEAVES
              <br />
              <span className="tr-h1-thread">A TRAIL.</span>
            </h1>
            <p className="tr-hero-sub">
              FinTrace follows it — through thousands of pages, fifty accounts and fifteen years of bank statements —
              and shows the exact source page for every step.
            </p>
            <div className="tr-hero-ctas">
              <a href="#cta" className="btn-primary">
                Request a matter assessment
              </a>
              <a href="#method" className="btn-ghost">
                See the method ↓
              </a>
            </div>
          </div>
          <div className="tr-hero-meta">
            <div className="ctn tr-hero-meta-row">
              <span>INPUT: BULK PDF · ANY BANK · ANY ORDER · SCANNED PAPER INCLUDED</span>
              <span className="tr-md-only">OUTPUT: ONE LEDGER · ONE REPORT · EVERY SOURCE</span>
            </div>
          </div>
        </section>

        {/* ---- Method: four numbered stages + the FX match diagram ---- */}
        <section id="method" className="tr-section">
          <div className="ctn">
            <Reveal className="rv">
              <p className="kicker">
                <span className="kicker-dash" /> THE METHOD
              </p>
              <h2 className="tr-h2">From a carton of statements to court-ready evidence.</h2>
            </Reveal>
            <div className="tr-steps">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} className="rv tr-step" delay={i * 110}>
                  <span className="tr-step-n">{step.n}</span>
                  <h3 className="tr-step-title">{step.title}</h3>
                  <p className="tr-step-body">{step.body}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="tr-mf-band" threshold={0.35}>
              <p className="kicker">
                <span className="kicker-dash" /> CROSS-CURRENCY MATCH — RECONSTRUCTED
              </p>
              <MoneyFlow />
            </Reveal>
          </div>
        </section>

        {/* ---- Findings catalogue ---- */}
        <section id="findings" className="tr-section tr-section-raised">
          <div className="ctn">
            <Reveal className="rv">
              <p className="kicker">
                <span className="kicker-dash" /> FINDINGS
              </p>
              <h2 className="tr-h2">What the trace surfaces.</h2>
            </Reveal>
            <div className="tr-cards">
              {FINDINGS.map((f, i) => (
                <Reveal key={f.id} className="rv tr-card" delay={(i % 3) * 100}>
                  <span className="tr-card-id">{f.id}</span>
                  <h3 className="tr-card-title">{f.title}</h3>
                  <p className="tr-card-body">{f.body}</p>
                  <span className="tr-card-src">{f.src}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Proof: the field result ---- */}
        <section className="tr-section">
          <div className="ctn tr-proof">
            <Reveal className="rv">
              <p className="kicker kicker-centre">
                <span className="kicker-dash" /> FIELD RESULT
              </p>
              <p className="tr-proof-display">
                <span className="tr-proof-est">
                  EST. 50 HRS
                  <span className="tr-strike" aria-hidden="true" />
                </span>
                <span className="tr-proof-arrow" aria-hidden="true">
                  →
                </span>
                <span className="tr-proof-done">
                  DELIVERED IN <Stat end={10} />
                </span>
              </p>
              <p className="tr-proof-copy">
                A real matter, estimated at fifty hours of manual review, was delivered in about ten. The findings
                closely matched the analysis the instructing lawyer prepared independently — and every finding carried
                its source.
              </p>
            </Reveal>
            <Reveal className="rv tr-proof-stats" delay={150}>
              <div className="tr-proof-stat">
                <span className="tr-proof-stat-n">1,000s</span>
                <span className="tr-proof-stat-l">PAGES ANALYSED</span>
              </div>
              <div className="tr-proof-stat">
                <span className="tr-proof-stat-n">
                  <Stat end={50} />
                </span>
                <span className="tr-proof-stat-l">ACCOUNTS TRACED</span>
              </div>
              <div className="tr-proof-stat">
                <span className="tr-proof-stat-n">
                  <Stat end={15} />
                </span>
                <span className="tr-proof-stat-l">YEARS COVERED</span>
              </div>
              <div className="tr-proof-stat">
                <span className="tr-proof-stat-n">
                  <Stat end={100} suffix="%" />
                </span>
                <span className="tr-proof-stat-l">FINDINGS SOURCED</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---- Audience register ---- */}
        <section className="tr-section tr-section-raised">
          <div className="ctn">
            <Reveal className="rv">
              <p className="kicker">
                <span className="kicker-dash" /> WHO ENGAGES FINTRACE
              </p>
              <h2 className="tr-h2">Built for teams whose job is to follow the money.</h2>
            </Reveal>
            <div className="tr-aud">
              {AUDIENCES.map((a, i) => (
                <Reveal key={a.id} className="rv tr-aud-row" delay={i * 80}>
                  <span className="tr-aud-id">{a.id}</span>
                  <h3 className="tr-aud-title">{a.title}</h3>
                  <p className="tr-aud-body">{a.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Final call to action ---- */}
        <section id="cta" className="tr-section tr-cta">
          <div className="ctn">
            <Reveal className="rv tr-cta-inner">
              <p className="kicker kicker-centre">
                <span className="kicker-dash" /> ENGAGEMENT
              </p>
              <h2 className="tr-cta-h">PUT THE TRAIL IN FRONT OF US.</h2>
              <p className="tr-cta-copy">
                FinTrace is a specialist forensic service, engaged per matter — flat cost plus per-page pricing, not a
                software subscription. Send the statements; receive the ledger, the trace and the findings report.
              </p>
              <div className="tr-hero-ctas tr-cta-ctas">
                <a href="mailto:hello@fintrace.com.au" className="btn-primary">
                  Request a matter assessment
                </a>
                <a href="mailto:hello@fintrace.com.au" className="tr-header-mail">
                  hello@fintrace.com.au
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="tr-footer">
        <div className="ctn tr-footer-row">
          <span className="tr-logo tr-logo-sm">
            FIN<span className="tr-logo-trace">TRACE</span>
          </span>
          <span className="tr-footer-note">Forensic statement analysis — a specialist service, engaged per matter.</span>
          <span className="tr-footer-meta">DESIGN 02 · FOLLOW THE MONEY</span>
        </div>
      </footer>
    </div>
  )
}
