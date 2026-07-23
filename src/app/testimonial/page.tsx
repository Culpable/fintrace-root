import type { Metadata } from 'next'
import clsx from 'clsx'
import { pageMetadata } from '@/lib/metadata'
import '../engine-network/engine-network.css'
import '../engine-network/site-pages.css'
import './testimonial.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from '../engine-network/fonts'
import Reveal from '../engine-network/Reveal'
import { SiteFooter, SiteHeader } from '../engine-network/SiteChrome'

export const metadata: Metadata = {
  title: pageMetadata.testimonial.title,
  description: pageMetadata.testimonial.description,
  // Internal review surface: keep it out of the index and off crawlers even
  // though the sitemap already omits it and no production page links to it.
  robots: { index: false, follow: false },
}

/**
 * Nick's kept shortlist — six wordings of the approved "Engraved plate"
 * testimonial, all attributed to him. Each is a draft for Nick to approve or
 * amend before anything is published; the wording is the variable, the plate
 * treatment is fixed. The `eyebrow` is the on-brand mono label that would
 * carry through to the home page, so no wording here is review-only
 * scaffolding — only the "01 of 06" reference marker is.
 *
 * Kept deliberately general per Nick's review: no detail that could identify
 * the matter, no dollar figures (savings stay qualitative), and the four
 * themes he endorsed — time saved, money saved, less monotonous work and the
 * accuracy of the outcomes. Every option names FinTrace directly while
 * retaining the approved themes and using plain, natural wording.
 */
const TESTIMONIALS = [
  {
    eyebrow: 'The time saved',
    quote:
      'FinTrace saved me weeks I would otherwise have spent reading bank statements line by line, freeing me to focus on the work that genuinely needed my expertise.',
  },
  {
    eyebrow: 'The cost saved',
    quote:
      'FinTrace saved my client the cost of having a lawyer spend weeks reviewing bank statements line by line, keeping their legal spend focused where my judgement added the most value.',
  },
  {
    eyebrow: 'The tedious part',
    quote:
      'FinTrace handled the monotonous work of turning bank statements into usable evidence, leaving me free to focus on the issues and decisions that mattered to the client.',
  },
  {
    eyebrow: 'The accuracy',
    quote:
      'FinTrace produced findings that closely matched the conclusions I reached independently, giving me confidence that the analysis had identified what mattered.',
  },
  {
    eyebrow: 'The work no one wants',
    quote:
      'FinTrace handled the part of financial disclosure every family lawyer dreads, removing a major burden and making the rest of the matter easier to manage.',
  },
  {
    eyebrow: 'Verifiable to source',
    quote:
      'FinTrace linked every finding to the exact source page, allowing me to verify the analysis without having to repeat the work myself.',
  },
]

export default function TestimonialPage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <SiteHeader />
      <main>
        <section className="eng-page-hero">
          <div className="eng-container">
            <h1 className="eng-page-h1">
              Testimonials <span className="eng-gold-text">for review</span>
            </h1>
          </div>
        </section>

        <div className="eng-page-strip">
          <span>Same treatment as the home page</span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Draft wording
          </span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Nothing published yet
          </span>
        </div>

        {TESTIMONIALS.map((item, index) => (
          <section className="eng-page-section" key={item.eyebrow}>
            <div className="eng-container">
              <p className="eng-ts-ref">
                <span className="eng-ts-ref-num">{String(index + 1).padStart(2, '0')}</span> of{' '}
                {String(TESTIMONIALS.length).padStart(2, '0')}
              </p>
              <Reveal className="eng-plate">
                <div className="eng-ts-wrap">
                  <p className="eng-kicker">{item.eyebrow}</p>
                  <div className="eng-ts-tick" aria-hidden="true" />
                  <blockquote className="eng-ts-quote">{item.quote}</blockquote>
                  <div className="eng-ts-rule" aria-hidden="true" />
                  <div className="eng-ts-attrib">
                    <span className="eng-ts-photo eng-ts-duo eng-ts-grain">
                      {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimised images; a plain img is the intended path */}
                      <img src="/images/testimonial/nick-brookes.png" alt="Nick Brookes" width={58} height={58} />
                    </span>
                    <span>
                      <span className="eng-ts-name">Nick Brookes</span>
                      <span className="eng-ts-role">Lawyer · HFM Legal</span>
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  )
}
