import type { Metadata } from 'next'
import Link from 'next/link'
import { Newsreader, Spline_Sans_Mono } from 'next/font/google'
import './internal-design.css'
import { internalRobots } from '../internal-design-metadata'

/**
 * FinTrace Design Lab — gallery index.
 *
 * Lists the six candidate homepage designs so reviewers can open each
 * full concept and compare brand directions side by side. The gallery
 * itself stays visually neutral so it never biases the comparison.
 */

// Load the gallery's own type pairing: an editorial serif for the wordmark
// and concept names, and a mono for lab-style annotations.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
})

const splineMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-spline-mono',
})

export const metadata: Metadata = {
  title: 'FinTrace — Design Lab',
  description: 'Six candidate homepage designs for the FinTrace brand, presented for internal review.',
  robots: internalRobots,
}

/** Static register of the six design concepts shown in the index. */
const DESIGNS = [
  {
    number: '01',
    name: 'The Ledger',
    href: '/ledger/',
    voice: 'Editorial broadsheet — calm authority. “Every dollar, accounted for.”',
    mode: 'Light',
    // Dominant palette swatches shown as dots beside each concept
    swatches: ['#f7f3ea', '#1a1712', '#a62d24'],
    tint: 'rgba(247, 243, 234, 0.05)',
    accent: '#e8dfc9',
  },
  {
    number: '02',
    name: 'Follow the Money',
    href: '/trace/',
    voice: 'Investigative network — cinematic evidence wall. “Money leaves a trail.”',
    mode: 'Dark',
    swatches: ['#0a0e18', '#d92b2b', '#d9a441'],
    tint: 'rgba(217, 43, 43, 0.06)',
    accent: '#e05c5c',
  },
  {
    number: '03',
    name: 'From Chaos to Clarity',
    href: '/clarity/',
    voice: 'Swiss precision — engineered calm. “Fifty hours of statements. Done in ten.”',
    mode: 'Light',
    swatches: ['#ffffff', '#14171a', '#1743e8'],
    tint: 'rgba(23, 67, 232, 0.07)',
    accent: '#6f8bf2',
  },
  {
    number: '04',
    name: 'The Evidence Engine',
    href: '/engine/',
    voice: 'Obsidian and gold — the WebGL showpiece. “Forensic infrastructure.”',
    mode: 'Dark',
    swatches: ['#0d0b09', '#d4a94e', '#9a938a'],
    tint: 'rgba(212, 169, 78, 0.07)',
    accent: '#d4a94e',
  },
  {
    number: '05',
    name: 'The Exhibit',
    href: '/exhibit/',
    voice: 'Brutalist court exhibit — stamped, annotated, sourced. “No finding without a source.”',
    mode: 'Light',
    swatches: ['#fcfcfa', '#111111', '#c8102e'],
    tint: 'rgba(200, 16, 46, 0.06)',
    accent: '#e5556d',
  },
  {
    number: '06',
    name: 'Chambers',
    href: '/chambers/',
    voice: 'Quiet luxury — engraved discretion. “Forensic analysis, quietly done.”',
    mode: 'Dark',
    swatches: ['#0e2a1e', '#f2ecdd', '#c2a35c'],
    tint: 'rgba(194, 163, 92, 0.07)',
    accent: '#c2a35c',
  },
]

/** Register of the Evidence Engine variations built after round-one feedback
 *  chose /engine/ as the base direction. The base stays untouched for
 *  reference; each variation changes a controlled set of variables. All five
 *  are dark, keep the base type pairing, and carry the reconstructed
 *  cross-currency match set-piece. */
const ENGINE_VARIATIONS = [
  {
    number: 'V1',
    name: 'Refined',
    href: '/engine-refined/',
    voice: 'The control — a calm band of legible ledger-row records; interaction polish throughout.',
    mode: 'Dark',
  },
  {
    number: 'V2',
    name: 'Trace',
    href: '/engine-trace/',
    voice: 'Evidence cards dock into a branching network; gold account trace + cross-currency match.',
    mode: 'Dark',
  },
  {
    number: 'V3',
    name: 'Ledger',
    href: '/engine-ledger/',
    voice: 'Documents entered line by line into one spreadsheet; the reconciling table, engine edition.',
    mode: 'Dark',
  },
  {
    number: 'V4',
    name: 'Network',
    href: '/engine-network/',
    voice: 'Account-network constellation hero — accounts and threads drawn in engine gold.',
    mode: 'Dark',
  },
  {
    number: 'V5',
    name: 'Flow',
    href: '/engine-flow/',
    voice: 'Money-trail hero — traced routes carrying amount pulses to their destination accounts.',
    mode: 'Dark',
  },
]

export default function DesignLabIndex() {
  return (
    <main
      className={`dsn-gallery ${newsreader.variable} ${splineMono.variable} relative min-h-dvh`}
      style={{ backgroundColor: 'var(--lab-bg)', color: 'var(--lab-ink)' }}
    >
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 sm:px-10">
        {/* Masthead: wordmark + lab designation */}
        <header className="lab-rise flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-3xl italic" style={{ fontFamily: 'var(--font-newsreader)' }}>
              FinTrace
            </span>
            <span
              className="text-[11px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
            >
              Design Lab
            </span>
          </div>
          <span
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
          >
            Six candidate directions
          </span>
        </header>

        {/* Brief for reviewers */}
        <p
          className="lab-rise mt-14 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ fontFamily: 'var(--font-newsreader)', color: 'var(--lab-muted)', animationDelay: '90ms' }}
        >
          Six directions for the FinTrace brand — a forensic financial analysis service that turns bulk bank
          statements into court-ready evidence. Open each concept to review its full homepage.
        </p>

        {/* Concept index */}
        <div className="mt-12 flex-1">
          {DESIGNS.map((design, index) => (
            <Link
              key={design.href}
              href={design.href}
              className="lab-row lab-rise group block py-7"
              style={
                {
                  animationDelay: `${180 + index * 90}ms`,
                  '--row-tint': design.tint,
                  '--row-accent': design.accent,
                } as React.CSSProperties
              }
            >
              <div className="flex items-baseline gap-5 sm:gap-8">
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                >
                  {design.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2
                      className="lab-name text-3xl leading-tight sm:text-[2.6rem]"
                      style={{ fontFamily: 'var(--font-newsreader)' }}
                    >
                      {design.name}
                    </h2>
                    <span
                      className="text-[10px] tracking-[0.25em] uppercase"
                      style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                    >
                      {design.mode}
                    </span>
                  </div>
                  <p
                    className="mt-2 max-w-xl text-[13px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                  >
                    {design.voice}
                  </p>
                </div>
                {/* Palette preview + directional arrow */}
                <div className="hidden shrink-0 items-center gap-4 sm:flex">
                  <span className="flex gap-1.5">
                    {design.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="h-3 w-3 rounded-full border border-white/10"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                  <span className="lab-arrow text-xl" style={{ fontFamily: 'var(--font-newsreader)' }}>
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Evidence Engine variations — round two, built from the chosen base */}
        <section className="mt-16">
          <div className="lab-rise flex flex-wrap items-baseline justify-between gap-3" style={{ animationDelay: '700ms' }}>
            <h2 className="text-2xl italic" style={{ fontFamily: 'var(--font-newsreader)' }}>
              The Evidence Engine — variations
            </h2>
            <span
              className="text-[10px] tracking-[0.25em] uppercase"
              style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
            >
              Rounds two &amp; three · base kept as reference
            </span>
          </div>
          <div className="mt-6">
            {ENGINE_VARIATIONS.map((variation, index) => (
              <Link
                key={variation.href}
                href={variation.href}
                className="lab-row lab-rise group block py-5"
                style={
                  {
                    animationDelay: `${790 + index * 80}ms`,
                    '--row-tint': 'rgba(212, 169, 78, 0.07)',
                    '--row-accent': '#d4a94e',
                  } as React.CSSProperties
                }
              >
                <div className="flex items-baseline gap-5 sm:gap-8">
                  <span
                    className="text-sm tabular-nums"
                    style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                  >
                    {variation.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="lab-name text-2xl leading-tight" style={{ fontFamily: 'var(--font-newsreader)' }}>
                        {variation.name}
                      </h3>
                      <span
                        className="text-[10px] tracking-[0.25em] uppercase"
                        style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                      >
                        {variation.mode}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 max-w-xl text-[13px] leading-relaxed"
                      style={{ fontFamily: 'var(--font-spline-mono)', color: 'var(--lab-muted)' }}
                    >
                      {variation.voice}
                    </p>
                  </div>
                  <span className="lab-arrow hidden text-xl sm:block" style={{ fontFamily: 'var(--font-newsreader)' }}>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Lab footer */}
        <footer
          className="lab-rise mt-16 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-[11px] tracking-[0.15em] uppercase"
          style={{
            fontFamily: 'var(--font-spline-mono)',
            color: 'var(--lab-muted)',
            borderColor: 'var(--lab-line)',
            animationDelay: '1220ms',
          }}
        >
          <span>Static Next.js export — localhost:3004</span>
          <span>Internal review only</span>
        </footer>
      </div>
    </main>
  )
}
