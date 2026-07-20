import type { Metadata } from 'next'
import clsx from 'clsx'
import Link from 'next/link'
import './engine-network/engine-network.css'
import './engine-network/site-pages.css'
import './not-found.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from './engine-network/fonts'
import { SiteFooter, SiteHeader } from './engine-network/SiteChrome'

// Give the 404 its own tab title via the root layout's `| FinTrace` template
// so an error response never presents itself as the homepage.
export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <SiteHeader />
      <main className="eng-nf-band">
        <svg className="eng-nf-constellation" viewBox="0 0 560 420" aria-hidden="true">
          <line x1="280" y1="210" x2="150" y2="112" />
          <line x1="280" y1="210" x2="420" y2="126" />
          <line className="eng-nf-flag" x1="280" y1="210" x2="190" y2="326" />
          <line x1="280" y1="210" x2="430" y2="310" />
          <circle cx="280" cy="210" r="25" />
          <circle cx="150" cy="112" r="17" />
          <circle cx="420" cy="126" r="20" />
          <circle className="eng-nf-flag" cx="190" cy="326" r="15" />
          <circle cx="430" cy="310" r="16" />
        </svg>
        <div className="eng-container eng-nf-content">
          <p className="eng-kicker">Error 404</p>
          <h1 className="eng-page-h1">
            This page isn’t <span className="eng-gold-text">in the record.</span>
          </h1>
          <p className="eng-lede">The requested address doesn’t correspond to anything we can verify.</p>
          <Link className="eng-btn-gold" href="/">
            Back to the home page
          </Link>
          <p className="eng-nf-meta">404 · Route not found</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
