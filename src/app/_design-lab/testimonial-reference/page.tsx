import type { Metadata } from 'next'
import clsx from 'clsx'
import { pageMetadata } from '@/lib/metadata'
import '../../engine-network/engine-network.css'
import '../../engine-network/site-pages.css'
import './testimonial.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from '../../engine-network/fonts'
import ClientVoice, { type ClientVoicePosition } from '../../engine-network/ClientVoice'
import FramedClientVoice from '../../engine-network/FramedClientVoice'
import { SiteFooter, SiteHeader } from '../../engine-network/SiteChrome'

export const metadata: Metadata = {
  title: pageMetadata.testimonial.title,
  description: pageMetadata.testimonial.description,
  // Internal review surface: keep it out of the index and off crawlers even
  // though the sitemap already omits it and no production page links to it.
  robots: { index: false, follow: false },
}

const LAYOUT_VARIANTS: Array<{ label: string; position: ClientVoicePosition }> = [
  { label: 'Portrait left', position: 'left' },
  { label: 'Portrait right', position: 'right' },
  { label: 'Portrait below', position: 'footer' },
]

const TOTAL_VARIANTS = LAYOUT_VARIANTS.length + 2

function ReviewReference({ index, label }: { index: number; label: string }) {
  return (
    <p className="eng-ts-ref">
      <span className="eng-ts-ref-num">{String(index).padStart(2, '0')}</span> of{' '}
      {String(TOTAL_VARIANTS).padStart(2, '0')}
      <span className="eng-ts-ref-label">{label}</span>
    </p>
  )
}

export default function TestimonialReferencePage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <SiteHeader />
      <main>
        <section className="eng-page-hero">
          <div className="eng-container">
            <h1 className="eng-page-h1">
              Testimonial layouts <span className="eng-gold-text">for review</span>
            </h1>
          </div>
        </section>

        <div className="eng-page-strip">
          <span>Same approved wording</span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Three portrait positions
          </span>
          <span className="eng-page-strip-item">
            <span aria-hidden="true">·</span>
            Two historical references
          </span>
        </div>

        {LAYOUT_VARIANTS.map((variant, index) => (
          <section className="eng-page-section" key={variant.position}>
            <div className="eng-container">
              <ReviewReference index={index + 1} label={variant.label} />
              <ClientVoice position={variant.position} delay={0} />
            </div>
          </section>
        ))}

        <section className="eng-page-section">
          <div className="eng-container">
            <ReviewReference index={4} label="Selected production frame · approved wording" />
            <FramedClientVoice />
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <ReviewReference index={5} label="Exact origin/main reference" />
            <FramedClientVoice exactOriginMain />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
