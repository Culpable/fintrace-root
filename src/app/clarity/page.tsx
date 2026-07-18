import type { Metadata } from 'next'
import Link from 'next/link'
import './clarity.css'
import { familjen, splineMono } from './fonts'
import HeroTransformation from './HeroTransformation'
import Reveal from './Reveal'
import { internalRobots } from '../internal-design-metadata'

/**
 * Design 3 — “From Chaos to Clarity”.
 *
 * Swiss International Style: a ruthless grid, luminous white space and a
 * single electric cobalt. The page itself performs the product promise —
 * strewn scanned statements snap into a pristine, flagged spreadsheet.
 */
export const metadata: Metadata = {
  title: 'From Chaos to Clarity',
  description:
    'Design study 03 — FinTrace turns thousands of pages of bank statements into one court-ready spreadsheet: every transaction categorised, every anomaly flagged, every line traceable to its source.',
  robots: internalRobots,
}

/** The four-step engagement, rendered as a numbered Swiss grid. */
const PIPELINE_STEPS = [
  {
    title: 'Deliver the bundle',
    body: 'Send every statement you hold — any bank, any order, scanned paper included. No sorting, no renaming, no preparation.',
  },
  {
    title: 'Structured extraction',
    body: 'Every page becomes structured data: person, date, financial year, description, debit, credit, amount.',
  },
  {
    title: 'Categorise and screen',
    body: 'Each transaction is categorised, then screened for patterns: cash cycles, gambling, crypto, related-account transfers, cross-currency matches.',
  },
  {
    title: 'Court-ready output',
    body: 'One spreadsheet and a written findings report. Every line carries a reference to its source PDF page.',
  },
]

/** What the analysis surfaces, expressed as evidence-grade capability cards. */
const CAPABILITIES = [
  {
    tag: 'Pattern',
    title: 'Cash-withdrawal cycles',
    body: 'Repeated ATM withdrawals and structured cash movements, surfaced with dates, amounts and locations.',
  },
  {
    tag: 'Exposure',
    title: 'Gambling and crypto',
    body: 'Deposits to betting platforms and exchanges, identified and quantified by financial year.',
  },
  {
    tag: 'Linkage',
    title: 'Related-account transfers',
    body: 'Money moving between connected accounts, matched at both ends of the transfer.',
  },
  {
    tag: 'Match',
    title: 'Cross-currency tracing',
    body: 'Foreign transfers paired with their AUD counterparts — a rupee-to-AUD Wise settlement, found and matched.',
  },
  {
    tag: 'Structure',
    title: 'Auto-categorisation',
    body: 'Woolworths becomes groceries. Every transaction classified into a consistent, reviewable taxonomy.',
  },
  {
    tag: 'Trace',
    title: 'Source traceability',
    body: 'Every figure links to the exact page it came from. Findings are verified by people, not taken on faith.',
  },
]

/** Headline numbers from a real matter, revealed with a masked slide-up. */
const PROOF_STATS = [
  { value: '3,214', label: 'Pages of statements' },
  { value: '~50', label: 'Accounts traced' },
  { value: '15', label: 'Years of records' },
  { value: '1', label: 'Spreadsheet delivered' },
]

/** Who the service is built for, as a numbered index. */
const AUDIENCES = [
  {
    name: 'Family-law property matters',
    body: 'The sweet spot: matters that hinge on tracing money through years of bank statements.',
  },
  {
    name: 'Misappropriation and financial abuse',
    body: 'Executor misconduct, powers of attorney, a family member with access to the accounts.',
  },
  {
    name: 'Public trustees and government legal',
    body: 'Overloaded books and no fee pressure — engaged per matter, procurement-friendly.',
  },
  {
    name: 'Forensic accountants and investigators',
    body: 'Replace manual Excel conversion with a structured, fully sourced dataset.',
  },
  {
    name: 'Insolvency practitioners',
    body: 'Trace dissipated assets across accounts, entities and currencies.',
  },
]


/**
 * Chaos→clarity mark: four scattered cells resolving into one solid
 * cobalt square — the whole product story in fourteen pixels.
 */
function LogoMark() {
  return (
    <svg viewBox="0 0 30 14" width="30" height="14" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="2" width="3" height="3" fill="var(--cobalt)" opacity="0.5" transform="rotate(14 2 3.5)" />
      <rect x="5" y="8.5" width="3" height="3" fill="var(--cobalt)" opacity="0.65" transform="rotate(-10 6.5 10)" />
      <rect x="8.5" y="1" width="3" height="3" fill="var(--cobalt)" opacity="0.45" transform="rotate(24 10 2.5)" />
      <rect x="11.5" y="6" width="3" height="3" fill="var(--cobalt)" opacity="0.85" transform="rotate(-18 13 7.5)" />
      <rect x="16" y="0" width="14" height="14" fill="var(--cobalt)" />
    </svg>
  )
}


/** Bespoke FinTrace logotype for this concept: mark + tight grotesk. */
function Logotype() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">FinTrace</span>
    </span>
  )
}


/** Sticky minimal header: logotype, designation, contact actions. */
function Header() {
  return (
    <header className="cl-header">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <Logotype />
          <span className="cl-microlabel hidden lg:inline">Forensic statement analysis</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/contact/" className="cl-mono hidden text-xs tracking-wide md:inline hover:text-[var(--cobalt)]">
            Contact FinTrace
          </a>
          <a href="/contact/" className="cl-btn !px-4 !py-2 text-sm">
            Request assessment
          </a>
        </div>
      </div>
    </header>
  )
}


/** Hero: the claim, then the proof performed live by the set-piece. */
function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 md:px-10 md:pt-24">
      <Reveal>
        <p className="cl-reveal cl-microlabel">FinTrace — Forensic statement analysis</p>
        <h1
          className="cl-reveal mt-6 max-w-4xl text-[clamp(3.1rem,8vw,6.4rem)] leading-[0.98] font-semibold tracking-[-0.03em]"
          style={{ '--d': '90ms' } as React.CSSProperties}
        >
          Chaos in<span style={{ color: 'var(--cobalt)' }}>.</span>
          <br />
          Clarity out<span style={{ color: 'var(--cobalt)' }}>.</span>
        </h1>
        <p
          className="cl-reveal mt-8 max-w-2xl text-lg leading-relaxed"
          style={{ color: 'var(--muted)', '--d': '180ms' } as React.CSSProperties}
        >
          FinTrace converts thousands of pages of bank statements — any bank, any order, scanned or digital — into one
          court-ready spreadsheet. Every transaction categorised. Every anomaly flagged. Every line traceable to its
          source page.
        </p>
        <div className="cl-reveal mt-10 flex flex-wrap items-center gap-8" style={{ '--d': '270ms' } as React.CSSProperties}>
          <a href="/contact/" className="cl-btn">
            Request a matter assessment
          </a>
          <a href="#how-it-works" className="cl-btn-ghost">
            See how it works <span className="cl-arrow">↓</span>
          </a>
        </div>
      </Reveal>

      {/* The signature transformation stage */}
      <div className="mt-16 md:mt-20">
        <HeroTransformation />
      </div>
    </section>
  )
}


/** How it works: four numbered steps under self-drawing cobalt rules. */
function PipelineSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="cl-reveal cl-microlabel">The process</p>
        <h2 className="cl-reveal mt-4 text-4xl font-semibold tracking-tight md:text-5xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Four steps. No prep.
        </h2>
      </Reveal>
      <Reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {PIPELINE_STEPS.map((step, i) => (
          <div
            key={step.title}
            className="cl-reveal relative border-t pt-5"
            style={{ borderColor: 'var(--hairline)', '--d': `${i * 130}ms` } as React.CSSProperties}
          >
            {/* Cobalt rule that draws across the hairline on reveal */}
            <div className="cl-rule absolute inset-x-0 -top-px" style={{ '--d': `${i * 130 + 150}ms` } as React.CSSProperties} />
            <p className="cl-mono text-xs font-medium tracking-[0.14em]" style={{ color: 'var(--cobalt)' }}>
              {`0${i + 1}`}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {step.body}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}


/** The analysis layer: six capability cards that straighten into the grid. */
function CapabilitiesSection() {
  return (
    <section className="border-y" style={{ borderColor: 'var(--hairline)', background: 'var(--panel)' }}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="cl-reveal cl-microlabel">The analysis</p>
          <h2 className="cl-reveal mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl" style={{ '--d': '80ms' } as React.CSSProperties}>
            Beyond extraction. Into evidence.
          </h2>
        </Reveal>
        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.title}
              className="cl-card border bg-white p-6"
              style={{ borderColor: 'var(--hairline)', '--d': `${i * 90}ms` } as React.CSSProperties}
            >
              <span
                className="cl-mono inline-block border px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase"
                style={{ color: 'var(--cobalt)', borderColor: 'currentcolor' }}
              >
                {cap.tag}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {cap.body}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}


/** Proof: real-matter numbers and the 50→10 hour bars, drawn to scale. */
function ProofSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="cl-reveal cl-microlabel">A real matter</p>
        <h2 className="cl-reveal mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Quoted at fifty hours.
          <br />
          Delivered in ten.
        </h2>
      </Reveal>

      <Reveal className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {PROOF_STATS.map((stat, i) => (
          <div key={stat.label}>
            <div className="cl-maskline text-5xl font-semibold tracking-[-0.03em] md:text-6xl">
              <span style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>{stat.value}</span>
            </div>
            <p className="cl-microlabel mt-3">{stat.label}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-20 space-y-9">
        <div>
          <p className="cl-microlabel mb-2.5">Manual review — 50 hrs</p>
          <div className="cl-bar w-full" style={{ background: 'var(--hairline)' }} />
        </div>
        <div>
          <p className="cl-microlabel mb-2.5" style={{ color: 'var(--cobalt)' }}>
            FinTrace — 10 hrs
          </p>
          <div className="cl-bar w-1/5" style={{ background: 'var(--cobalt)', '--d': '350ms' } as React.CSSProperties} />
        </div>
        <p className="cl-reveal max-w-2xl text-base leading-relaxed" style={{ color: 'var(--muted)', '--d': '500ms' } as React.CSSProperties}>
          The findings matched the analysis the instructing lawyer prepared independently — and the matter moved weeks
          sooner. Every figure remained traceable to its source page throughout.
        </p>
      </Reveal>
    </section>
  )
}


/** Who it serves: a numbered Swiss index with hairline separations. */
function AudienceSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10 md:pb-32">
      <Reveal>
        <p className="cl-reveal cl-microlabel">Who it serves</p>
        <h2 className="cl-reveal mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Wherever the money must be followed.
        </h2>
      </Reveal>
      <Reveal className="mt-14 border-t" style={{ borderColor: 'var(--hairline)' }} as="div">
        {AUDIENCES.map((audience, i) => (
          <div key={audience.name} className="cl-audience-row cl-reveal" style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <span className="cl-mono text-xs font-medium tracking-[0.14em]" style={{ color: 'var(--cobalt)' }}>
              {`0${i + 1}`}
            </span>
            <h3 className="text-lg font-semibold tracking-tight">{audience.name}</h3>
            <p className="text-sm leading-relaxed md:text-base" style={{ color: 'var(--muted)' }}>
              {audience.body}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}


/** Closing call to action on an ink-black band. */
function CtaSection() {
  return (
    <section style={{ background: 'var(--ink)' }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:px-10 md:py-32">
        <Reveal>
          <h2 className="cl-reveal text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Send the statements.
            <br />
            Get the story.
          </h2>
        </Reveal>
        <Reveal>
          <p className="cl-reveal text-base leading-relaxed" style={{ color: '#b9bec6' }}>
            FinTrace is a specialist forensic service, engaged per matter — a flat engagement cost plus per-page
            pricing. No software to licence, no seats to manage. You send the bundle; we return the evidence.
          </p>
          <div className="cl-reveal mt-8 flex flex-wrap items-center gap-8" style={{ '--d': '120ms' } as React.CSSProperties}>
            <a href="/contact/" className="cl-btn">
              Request a matter assessment
            </a>
            <a href="/contact/" className="cl-mono text-xs tracking-wide text-white hover:text-[#8fa4f5]">
              Contact FinTrace
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}


/** Minimal footer with the study designation. */
function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-6 py-10 md:px-10">
        <div className="flex items-center gap-5">
          <Logotype />
          <span className="cl-microlabel hidden sm:inline">Forensic statement analysis — Australia</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <a href="/contact/" className="cl-mono text-xs tracking-wide hover:text-[var(--cobalt)]">
            Contact FinTrace
          </a>
          <span className="cl-microlabel">Design study 03 — From Chaos to Clarity</span>
        </div>
      </div>
    </footer>
  )
}


export default function ClarityPage() {
  return (
    <div className={`dsn-clarity ${familjen.variable} ${splineMono.variable}`}>
      <Header />
      <main>
        <Hero />
        <PipelineSection />
        <CapabilitiesSection />
        <ProofSection />
        <AudienceSection />
        <CtaSection />
      </main>
      <Footer />

      {/* Persistent hop back to the design-lab index */}
      <Link href="/internal-design/" className="cl-labchip">
        Design lab — index
      </Link>
    </div>
  )
}
