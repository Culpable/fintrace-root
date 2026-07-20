import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { exDisplay, exMono } from './fonts'
import Reveal from './Reveal'
import HeroRegister from './HeroRegister'
import FindingFlip from './FindingFlip'
import './exhibit.css'
import { internalRobots } from '../internal-design-metadata'

/**
 * Design 5 — “The Exhibit”.
 *
 * Brutalist court-exhibit documentation: the homepage is composed as a
 * tendered evidence bundle. Stamps, annexures, registration marks and a
 * footnoted source register make FinTrace’s core promise — every finding
 * traceable to its source page — the literal design language of the page.
 */
export const metadata: Metadata = {
  title: 'The Exhibit',
  description:
    'FinTrace design concept five: a brutalist court-exhibit treatment — stamped, annotated and sourced. No finding without a source.',
  robots: internalRobots,
}

/** Footnote marker linking a claim to its entry in the source register. */
function Fn({ n }: { n: number }) {
  return (
    <sup>
      <a href={`#ex-src-${n}`} aria-label={`Source register entry ${n}`}>
        {n}
      </a>
    </sup>
  )
}

/** Print-style registration crosshair. Parent must be position:relative. */
function RegMarks() {
  const mark = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
  return (
    <>
      <span className="ex-regmark top-3 left-3">{mark}</span>
      <span className="ex-regmark top-3 right-3">{mark}</span>
      <span className="ex-regmark bottom-3 left-3">{mark}</span>
      <span className="ex-regmark right-3 bottom-3">{mark}</span>
    </>
  )
}

/** Uniform section header: red index chip, procedural note, display title. */
function SectionHead({ index, note, title }: { index: string; note: string; title: string }) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-center gap-4">
        <span className="ex-shead-index">{index}</span>
        <span className="ex-shead-note">{note}</span>
      </div>
      <h2 className="ex-display ex-h2 mt-5">{title}</h2>
    </Reveal>
  )
}

/** Perforated tear-line separating major sections of the bundle. */
function TearLine() {
  return (
    <div className="ex-tear mx-auto max-w-6xl" aria-hidden>
      <span>FT-05</span>
    </div>
  )
}

/**
 * Decorative barcode encoding “FINTRACE”: bar widths and gaps derive
 * deterministically from character codes so the output is stable across
 * server and client renders (a requirement for static export).
 */
function Barcode({ className }: { className?: string }) {
  const bars: ReactNode[] = []
  let x = 0
  for (const [i, ch] of 'FINTRACE'.split('').entries()) {
    const code = ch.charCodeAt(0)
    const wide = (code % 4) + 1
    bars.push(<rect key={`a${i}`} x={x} y={0} width={wide} height={28} fill="currentColor" />)
    x += wide + ((code >> 2) % 3) + 1
    const narrow = ((code >> 3) % 3) + 1
    bars.push(<rect key={`b${i}`} x={x} y={0} width={narrow} height={28} fill="currentColor" />)
    x += narrow + 2
  }
  return (
    <svg viewBox={`0 0 ${x} 28`} className={className} aria-hidden preserveAspectRatio="none">
      {bars}
    </svg>
  )
}

/** Annexure register: FinTrace capabilities, filed as numbered annexures. */
const ANNEXURES = [
  {
    id: 'A-01',
    title: 'Bulk conversion',
    body: 'Thousands of pages of PDF bank statements — any bank, any order, scanned paper included. No pre-sorting, no classification, no renaming. Bank, account holder and dates are extracted automatically.',
  },
  {
    id: 'A-02',
    title: 'Structured schedule',
    body: 'Every transaction lands in one court-ready Excel: file name, person, date, financial year, description, debit or credit, amount, category.',
  },
  {
    id: 'A-03',
    title: 'Auto-categorisation',
    body: 'Each line is classified as it is extracted, so counsel reads a categorised schedule rather than raw bank copy.',
    specimen: (
      <>
        WOOLWORTHS METRO 3121&nbsp;&nbsp;→&nbsp;&nbsp;<b>GROCERIES</b>
      </>
    ),
  },
  {
    id: 'A-04',
    title: 'Pattern detection',
    body: 'Cash-withdrawal cycles, gambling and crypto activity, and transactions inconsistent with the account’s ordinary conduct are flagged for examination.',
  },
  {
    id: 'A-05',
    title: 'Inter-account tracing',
    body: 'Money is followed between related accounts — including cross-currency matches, such as rupee-to-AUD transfers routed through an international money-transfer service.',
    specimen: (
      <>
        ₹ 12,40,000 (INTL TRANSFER)&nbsp;&nbsp;→&nbsp;&nbsp;<b>$22,614.80 AUD — MATCHED</b>
      </>
    ),
  },
  {
    id: 'A-06',
    title: 'Findings report',
    body: 'A written report of findings accompanies the schedule. Every finding is referenced to the exact source PDF page, so each one can be verified by a human — no unsourced assertions.',
  },
]

/** Procedure: the four-step engagement, formatted as filed steps. */
const STEPS = [
  {
    num: '01',
    title: 'Tender',
    body: 'Provide the statements exactly as they exist: mixed banks, mixed accounts, unsorted, scanned. No preparation is required of your team.',
    fn: 3,
  },
  {
    num: '02',
    title: 'Extract',
    body: 'Every line becomes structured data — file name, person, date, financial year, description, debit or credit, amount, category.',
    fn: undefined,
  },
  {
    num: '03',
    title: 'Examine',
    body: 'Patterns are surfaced across accounts and years: cash cycles, gambling and crypto flows, related-party transfers, cross-currency matches.',
    fn: 4,
  },
  {
    num: '04',
    title: 'Deliver',
    body: 'One Excel schedule and a written findings report, every entry referenced to its source page. Machine-built, human-verifiable.',
    fn: 2,
  },
]

/** Service list: who the document is addressed to. */
const PARTIES = [
  {
    index: 'A.',
    name: 'Family law practices',
    note: 'Property matters that hinge on tracing money through years of statements — the proven core of FinTrace’s work.',
  },
  {
    index: 'B.',
    name: 'Misappropriation & financial abuse',
    note: 'Executor misconduct, attorney misuse, a child drawing down a parent’s accounts — conduct made visible line by line.',
  },
  {
    index: 'C.',
    name: 'Public trustees & government legal',
    note: 'Overloaded matters, procurement-friendly per-matter engagement, findings fit to put before a Principal Legal Officer.',
  },
  {
    index: 'D.',
    name: 'Forensic accountants & investigators',
    note: 'Manual Excel conversion and surface-level review, superseded — start the analysis from structured, sourced data.',
  },
  {
    index: 'E.',
    name: 'Insolvency practitioners',
    note: 'Dissipated assets traced across accounts, entities and currencies before they disappear from view.',
  },
]

export default function ExhibitPage() {
  return (
    <div className={clsx('dsn-exhibit', exDisplay.variable, exMono.variable, 'min-h-screen')}>
      {/* Ink-bleed filter used by stamped type; kept invisible in the DOM */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="ex-ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </svg>

      {/* Fixed return chip to the design-lab index */}
      <Link href="/internal-design/" className="ex-chip">
        ← Design lab · 05/06
      </Link>

      {/* ============================== HEADER ============================== */}
      <header className="ex-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-5 md:px-10">
          <div>
            <p className="ex-display text-2xl leading-none tracking-tight">
              FIN
              <span className="ex-logo-trace" data-text="TRACE">
                TRACE
              </span>
            </p>
            <p className="mt-1 text-[0.62rem] font-semibold tracking-[0.32em] uppercase">
              Forensic financial analysis
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden text-[0.66rem] tracking-[0.2em] uppercase opacity-60 md:inline">
              Doc. FT-05 / 06
            </span>
            <a className="ex-btn ex-btn-ghost hidden sm:inline-block" href="/contact/">
              Request assessment
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ============================== HERO ============================== */}
        <section className="relative">
          {/* Evidence frame: solid tracer draws the perimeter, dashed frame remains.
              The svg overflows visibly so the centred stroke never gets clipped. */}
          <svg
            className="pointer-events-none absolute inset-3 overflow-visible md:inset-5"
            aria-hidden
            preserveAspectRatio="none"
          >
            <rect
              className="ex-frame-solid-out ex-frame-draw"
              width="100%"
              height="100%"
              pathLength={100}
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              className="ex-frame-dashed"
              width="100%"
              height="100%"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeDasharray="10 7"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:px-14 md:pt-28 md:pb-24">
            {/* Corner exhibit stamp, deliberately overlapping the frame */}
            <div className="ex-stampbox absolute top-8 right-6 px-4 py-2 text-center md:top-12 md:right-12">
              <span className="block text-[0.68rem] font-bold tracking-[0.24em]">EXHIBIT</span>
              <span className="ex-display block text-xl leading-none">FT-01</span>
            </div>

            <Reveal>
              <p className="text-[0.68rem] font-semibold tracking-[0.3em] uppercase opacity-70">
                Tendered for identification — FinTrace, forensic financial analysis
              </p>
            </Reveal>

            <h1 className="ex-display ex-h1 ex-slam ex-ink mt-10 max-w-5xl">
              No finding
              <br />
              without a<br />
              <span className="ex-h1-stamp">source.</span>
            </h1>

            <div className="ex-hero-late mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
              <div>
                <p className="max-w-xl text-[0.92rem] leading-relaxed" style={{ color: 'var(--ex-dim)' }}>
                  FinTrace converts bulk PDF bank statements — any bank, any order, scanned paper included — into
                  a single court-ready schedule of every transaction, then examines it for what warrants
                  attention.
                  <Fn n={1} /> Every finding is referenced to the page it came from.
                  <Fn n={2} /> Nothing is asserted that cannot be checked.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a className="ex-btn" href="/contact/">
                    Request a matter assessment
                  </a>
                  <a className="ex-btn ex-btn-ghost" href="#procedure">
                    Read the procedure ↓
                  </a>
                </div>
              </div>

              {/* Typed matter register: the docket entry set-piece */}
              <HeroRegister
                startDelay={1900}
                rows={[
                  { label: 'Matter no.', value: 'FT-2026-0114' },
                  { label: 'Pages analysed', value: '3,214' },
                  { label: 'Accounts', value: '50' },
                  { label: 'Period', value: '15 years' },
                  { label: 'Status', value: 'Every line traceable', accent: true },
                ]}
              />
            </div>
          </div>
        </section>

        <TearLine />

        {/* ============================ PROCEDURE ============================ */}
        <section id="procedure" className="ex-section relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
            <SectionHead index="Section 01" note="Procedure on engagement" title="The procedure" />
            <div className="mt-12 border-t-2 border-[#111]">
              {STEPS.map((step, i) => (
                <Reveal key={step.num} className="ex-step" delay={i * 70}>
                  <span className="ex-step-num">{step.num}</span>
                  <h3 className="ex-step-title">{step.title}</h3>
                  <p className="ex-step-body">
                    {step.body}
                    {step.fn ? <Fn n={step.fn} /> : null}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TearLine />

        {/* ============================ ANNEXURES ============================ */}
        <section className="ex-section relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
            <SectionHead index="Section 02" note="Capabilities, filed as annexures" title="Annexures" />
            <div className="mt-12">
              {ANNEXURES.map((annexure, i) => (
                <Reveal key={annexure.id} className="ex-annexure" delay={i * 60}>
                  <span className="ex-astamp">{annexure.id}</span>
                  <div>
                    <h3 className="ex-annexure-title">{annexure.title}</h3>
                    <p className="ex-annexure-body">{annexure.body}</p>
                    {annexure.specimen ? <span className="ex-specimen">{annexure.specimen}</span> : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TearLine />

        {/* ======================== SPECIMEN FINDING ======================== */}
        <section className="ex-section relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
            <SectionHead index="Section 03" note="Traceability, demonstrated" title="Specimen finding" />
            <Reveal delay={80}>
              <p className="mt-6 max-w-xl text-[0.88rem] leading-relaxed" style={{ color: 'var(--ex-dim)' }}>
                Below is a finding as it appears in a FinTrace report. Press verify to see the source line it
                stands on — this is how every finding in every report behaves.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <div className="mt-10">
                <FindingFlip />
              </div>
            </Reveal>
          </div>
        </section>

        <TearLine />

        {/* ============================ THE RECORD =========================== */}
        <section className="ex-section relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
            <SectionHead index="Section 04" note="Proof of performance" title="The record" />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Reveal className="ex-stat" delay={0}>
                <p className="ex-stat-num">
                  50<span className="ex-red">→</span>10
                </p>
                <p className="ex-stat-label">
                  Hours estimated vs hours delivered, one real matter
                  <Fn n={1} />
                </p>
              </Reveal>
              <Reveal className="ex-stat" delay={90}>
                <p className="ex-stat-num">3,214</p>
                <p className="ex-stat-label">
                  Pages of statements, converted and examined in a single matter
                  <Fn n={3} />
                </p>
              </Reveal>
              <Reveal className="ex-stat" delay={180}>
                <p className="ex-stat-num">
                  50<span className="ex-red">/</span>15
                </p>
                <p className="ex-stat-label">
                  Accounts traced across fifteen financial years
                  <Fn n={3} />
                </p>
              </Reveal>
            </div>
            <Reveal delay={140}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <span className="ex-corroborated">Corroborated</span>
                <p className="max-w-xl text-[0.88rem] leading-relaxed" style={{ color: 'var(--ex-dim)' }}>
                  The report’s findings matched the analysis the instructing solicitor prepared independently —
                  and sent to his client and the other side.
                  <Fn n={5} />
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <TearLine />

        {/* ========================== PARTIES SERVED ========================= */}
        <section className="ex-section relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
            <SectionHead index="Section 05" note="Service list" title="This document has been served on" />
            <div className="mt-12 border-t-2 border-[#111]">
              {PARTIES.map((party, i) => (
                <Reveal key={party.index} className="ex-party" delay={i * 60}>
                  <span className="ex-party-index">{party.index}</span>
                  <h3 className="ex-party-name">{party.name}</h3>
                  <p className="ex-party-note">{party.note}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== TENDER ============================= */}
        <section className="ex-tender relative">
          <RegMarks />
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-10 md:py-32">
            <Reveal>
              <p className="text-[0.68rem] font-semibold tracking-[0.3em] uppercase opacity-70">
                Section 06 — Notice to produce
              </p>
              <h2 className="ex-display ex-ink mt-8 text-[clamp(2.4rem,7vw,6rem)] leading-[0.95]">
                Tender your
                <br />
                statements.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="ex-tender-note mt-8 max-w-xl text-[0.9rem] leading-relaxed">
                FinTrace is engaged per matter — a flat fee plus a per-page rate.
                <Fn n={6} /> No licences, no software for your team to learn. A specialist forensic service that
                returns evidence, not a login.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a className="ex-btn ex-btn-paper" href="/contact/">
                  Request a matter assessment
                </a>
                <a
                  className="text-[0.8rem] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
                  href="/contact/"
                >
                  Contact FinTrace
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ========================== SOURCE REGISTER ======================== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-10">
            <Reveal>
              <p className="text-[0.7rem] font-bold tracking-[0.26em] uppercase">
                Source register <span className="ex-red">— all claims referenced</span>
              </p>
              <ol className="ex-srcreg mt-6">
                <li id="ex-src-1">
                  <b>1.</b>
                  <span>
                    Family-law property matter, 2025: work estimated at 50 hours of manual conversion and review,
                    completed in approximately 10.
                  </span>
                </li>
                <li id="ex-src-2">
                  <b>2.</b>
                  <span>Specimen reference format: westpac_2019_q3.pdf, page 214, line 8.</span>
                </li>
                <li id="ex-src-3">
                  <b>3.</b>
                  <span>Single-matter scale on record: 3,214 pages, 50 accounts, 15 financial years.</span>
                </li>
                <li id="ex-src-4">
                  <b>4.</b>
                  <span>
                    Cross-currency example: rupee transfers routed through an international money-transfer service, matched to their AUD settlement
                    lines.
                  </span>
                </li>
                <li id="ex-src-5">
                  <b>5.</b>
                  <span>
                    Findings corroborated against the instructing solicitor’s independent analysis in the same
                    matter.
                  </span>
                </li>
                <li id="ex-src-6">
                  <b>6.</b>
                  <span>Engagement terms: flat matter fee plus per-page rate; scoped before commencement.</span>
                </li>
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ============================== FOOTER ============================= */}
        <footer className="ex-footer">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-10 md:px-10">
            <div>
              <p className="ex-display text-base tracking-tight">
                FIN<span className="ex-red">TRACE</span>
              </p>
              <p className="mt-2 uppercase">Forensic financial analysis — prepared as exhibit FT-05 of 06</p>
              <p className="mt-1 uppercase">© 2026 FinTrace · Contact FinTrace</p>
            </div>
            <Barcode className="ex-barcode w-36" />
          </div>
        </footer>
      </main>
    </div>
  )
}
