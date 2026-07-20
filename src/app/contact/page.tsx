import type { Metadata } from 'next'
import clsx from 'clsx'
import { pageMetadata } from '@/lib/metadata'
import '../engine-network/engine-network.css'
import '../engine-network/site-pages.css'
import './contact.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from '../engine-network/fonts'
import { SiteFooter, SiteHeader } from '../engine-network/SiteChrome'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
  alternates: { canonical: '/contact/' },
}

const NEXT_STEPS = [
  { numeral: '01', name: 'Assessment', copy: 'We review the outline and confirm the engine fits the matter.' },
  { numeral: '02', name: 'Quote', copy: 'You receive the engagement quoted in writing.' },
  { numeral: '03', name: 'Handover', copy: 'Only then do statements change hands, in whatever form you hold them.' },
]

export default function ContactPage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <SiteHeader contactHref="#enquire" />
      <main>
        <section className="eng-page-hero">
          <div className="eng-container">
            <p className="eng-kicker">Start a matter</p>
            <h1 className="eng-page-h1">
              Tell us about <span className="eng-gold-text">the matter.</span>
            </h1>
            <p className="eng-lede">
              A few lines are enough for an initial assessment: the type of dispute, roughly how many pages and
              accounts, the timeframe you’re working to. We’ll come back with whether the engine fits and what the
              engagement would cost.
            </p>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container eng-ct-container eng-ct-grid">
            <aside className="eng-ct-aside">
              <p className="eng-kicker">What happens next</p>
              <div className="eng-ct-next">
                {NEXT_STEPS.map((step) => (
                  <div className="eng-ct-next-row" key={step.numeral}>
                    <p className="eng-ct-numeral">{step.numeral}</p>
                    <div>
                      <h2>{step.name}</h2>
                      <p>{step.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="eng-ct-availability">Engaged per matter · Australia-wide</p>
            </aside>

            <section className="eng-plate eng-ct-form-plate" id="enquire" aria-labelledby="enquire-heading">
              <h2 id="enquire-heading">Request a matter assessment</h2>
              <p className="eng-ct-form-intro">
                No confidential detail is needed at this stage. Please don’t attach or paste statement data.
              </p>
              <ContactForm />
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
