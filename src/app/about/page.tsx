import type { Metadata } from 'next'
import clsx from 'clsx'
import { pageMetadata } from '@/lib/metadata'
import '../engine-network/engine-network.css'
import '../engine-network/site-pages.css'
import './about.css'
import { bricolage, fragmentMono } from '../engine-network/fonts'
import Reveal from '../engine-network/Reveal'
import { SiteFooter, SiteHeader } from '../engine-network/SiteChrome'

export const metadata: Metadata = {
  title: pageMetadata.about.title,
  description: pageMetadata.about.description,
  alternates: { canonical: '/about/' },
}

export default function AboutPage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable)}>
      <SiteHeader />
      <main>
        <section className="eng-page-hero">
          <div className="eng-container">
            <p className="eng-kicker">About FinTrace</p>
            <h1 className="eng-page-h1">
              Forensic rigour, <span className="eng-gold-text">run as a service.</span>
            </h1>
            <p className="eng-lede">
              FinTrace exists to do one job at a forensic standard: turn thousands of pages of bank statements into
              evidence a legal team can rely on — and hand back the hours that work used to take.
            </p>
          </div>
        </section>

        <div className="eng-page-strip">
          <span>Specialist forensic service</span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Engaged per matter
          </span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Australia-wide
          </span>
        </div>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The origin</p>
              <h2 className="eng-h2">
                Built on a real matter, <span className="eng-gold-text">not a demo.</span>
              </h2>
            </Reveal>
            <Reveal className="eng-ab-prose" delay={90}>
              <p>
                FinTrace was proven inside a live property matter: thousands of pages of statements, about fifty
                accounts and fifteen years of history. The manual review was estimated at fifty hours of lawyer time.
                The engine delivered the ledger and the findings in about ten.
              </p>
              <p>
                Those findings closely matched the analysis the instructing lawyer prepared independently, at a fifth of
                the time. That matter set the standard for the service.
              </p>
              <p className="eng-page-strip eng-ab-strip">
                ≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements
              </p>
            </Reveal>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">Service, not software</p>
              <h2 className="eng-h2">
                Nothing to license. <span className="eng-gold-text">Nothing to learn.</span>
              </h2>
            </Reveal>
            <Reveal className="eng-ab-prose" delay={90}>
              <p>
                FinTrace is engaged the way you’d brief a forensic accountant, not the way you’d buy software. There’s
                no platform to procure, no seats to license and no training to roll out — you send the statements and
                the engine does the work.
              </p>
              <p>
                Per-matter engagement suits government procurement and private practice alike: one flat engagement fee,
                one per-page rate, scoped in writing before the work begins.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The standard</p>
              <h2 className="eng-h2">
                If it can’t be checked, <span className="eng-gold-text">it isn’t a finding.</span>
              </h2>
            </Reveal>
            <Reveal className="eng-ab-prose" delay={90}>
              <p>
                Every line in the ledger and every finding in the report cites the exact page of the source PDF it came
                from. Anything the engine asserts, a human can verify in seconds — which makes the output
                human-verifiable and court-ready.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-plate eng-cta">
              <span className="eng-cta-sheen" aria-hidden="true" />
              <p className="eng-kicker">Engage the service</p>
              <h2 className="eng-h2">
                See it against <span className="eng-gold-text">your matter.</span>
              </h2>
              <p className="eng-lede eng-cta-lede">
                The fastest way to judge FinTrace is to put a real matter in front of it.
              </p>
              <div className="eng-hero-ctas">
                <a className="eng-btn-gold eng-btn-loop" href="/contact/">
                  Request a matter assessment
                </a>
                <a className="eng-btn-ghost" href="/engagement/">
                  Engagement &amp; pricing
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
