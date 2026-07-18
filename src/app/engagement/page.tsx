import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import clsx from 'clsx'
import { pageMetadata } from '@/lib/metadata'
import '../engine-network/engine-network.css'
import '../engine-network/site-pages.css'
import './engagement.css'
import { bricolage, fragmentMono } from '../engine-network/fonts'
import Reveal from '../engine-network/Reveal'
import { SiteFooter, SiteHeader } from '../engine-network/SiteChrome'

export const metadata: Metadata = {
  title: pageMetadata.engagement.title,
  description: pageMetadata.engagement.description,
  alternates: { canonical: '/engagement/' },
}

const STEPS = [
  {
    numeral: '01',
    name: 'Enquiry',
    copy: 'Outline the matter — the dispute, roughly how many pages and accounts, the timeframe you’re working to. No statements yet.',
  },
  {
    numeral: '02',
    name: 'Assessment',
    copy: 'We confirm the engine fits the matter and quote the engagement in writing: the flat fee and the per-page rate.',
  },
  {
    numeral: '03',
    name: 'Handover',
    copy: 'You send the statements as they are — no sorting, no renaming, no cover sheet. Scanned paper is fine.',
  },
  {
    numeral: '04',
    name: 'Delivery',
    copy: 'You receive the Excel ledger and the written findings report, every finding cited to its source page.',
  },
]

export default function EngagementPage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable)}>
      <SiteHeader />
      <main>
        <section className="eng-page-hero">
          <div className="eng-container">
            <p className="eng-kicker">Engagement &amp; pricing</p>
            <h1 className="eng-page-h1">
              A flat fee to engage. <span className="eng-gold-text">Per-page from there.</span>
            </h1>
            <p className="eng-lede">
              No subscriptions, no licences, no minimum term. FinTrace is engaged per matter: a flat engagement fee plus
              per-page pricing, quoted in writing once the matter is scoped.
            </p>
          </div>
        </section>

        <div className="eng-page-strip">
          <span>No software licence</span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            No subscription
          </span>
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
              <p className="eng-kicker">The engagement</p>
              <h2 className="eng-h2">
                From enquiry <span className="eng-gold-text">to evidence.</span>
              </h2>
            </Reveal>
            <div className="eng-eg-steps">
              {STEPS.map((step, index) => (
                <Reveal as="article" key={step.numeral} className="eng-eg-step" delay={index * 70}>
                  <p className="eng-eg-numeral" style={{ '--i': index } as CSSProperties}>
                    {step.numeral}
                  </p>
                  <h3>{step.name}</h3>
                  <p>{step.copy}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">The deliverables</p>
              <h2 className="eng-h2">
                A ledger you can filter. <span className="eng-gold-text">Findings you can file.</span>
              </h2>
            </Reveal>
            <div className="eng-eg-cards">
              <Reveal>
                <article className="eng-card">
                  <h3>The ledger</h3>
                  <p>
                    One Excel workbook holding every transaction — file name, person, date, financial year, description,
                    debit and credit, amount, category — with every line categorised and ready to interrogate.
                  </p>
                </article>
              </Reveal>
              <Reveal delay={90}>
                <article className="eng-card">
                  <h3>The findings report</h3>
                  <p>
                    A written account of what the analysis surfaced: cash-withdrawal patterns, gambling and crypto
                    activity, transfers between related accounts, cross-currency matches. Each finding cites the exact
                    source page.
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-section-head">
              <p className="eng-kicker">Pricing</p>
              <h2 className="eng-h2">
                Quoted before <span className="eng-gold-text">the work begins.</span>
              </h2>
            </Reveal>
            <Reveal className="eng-eg-prose" delay={90}>
              <p>
                Two numbers, agreed in writing before any work starts: a flat engagement fee and a per-page rate for the
                statements processed. Both follow the initial assessment, so procurement sees the full shape of the cost
                before committing.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <Reveal className="eng-plate eng-cta">
              <span className="eng-cta-sheen" aria-hidden="true" />
              <p className="eng-kicker">Start a matter</p>
              <h2 className="eng-h2">
                Two numbers. <span className="eng-gold-text">One enquiry away.</span>
              </h2>
              <div className="eng-hero-ctas">
                <a className="eng-btn-gold eng-btn-loop" href="/contact/">
                  Request a matter assessment
                </a>
                <a className="eng-btn-ghost" href="/contact/#enquire">
                  Start an enquiry
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
