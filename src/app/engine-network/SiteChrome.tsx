import Link from 'next/link'

type SitePage = 'home' | 'about' | 'engagement' | 'contact' | 'privacy'

type SiteHeaderProps = {
  contactHref?: string
  currentPage?: SitePage
  /** Mark the homepage overlay so its duplicate CTA can yield to the hero CTA on phones. */
  hero?: boolean
}

/** Render the production sub-page header with stable links into the public site. */
export function SiteHeader({ contactHref = '/contact/', currentPage, hero = false }: SiteHeaderProps) {
  return (
    <>
      <a className="eng-skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className={hero ? 'eng-header eng-header-hero' : 'eng-header'}>
        <Link
          href="/"
          className="eng-wordmark"
          aria-label="FinTrace home"
          aria-current={currentPage === 'home' ? 'page' : undefined}
        >
          <span>Fin</span>
          <span className="eng-wordmark-bar" aria-hidden="true" />
          <span className="eng-gold-text">Trace</span>
        </Link>
        <nav className="eng-header-nav" aria-label="Site pages">
          <Link href="/about/" aria-current={currentPage === 'about' ? 'page' : undefined}>
            About
          </Link>
          <Link href="/engagement/" aria-current={currentPage === 'engagement' ? 'page' : undefined}>
            Engagement
          </Link>
          <Link href="/contact/" aria-current={currentPage === 'contact' ? 'page' : undefined}>
            Contact
          </Link>
          {/* Render route hrefs through Link so the contact page is prefetched and
              the transition stays client-side; keep hash hrefs as native anchors so
              the contact page's own button still jumps to #enquire on the same page. */}
          {contactHref.startsWith('/') ? (
            <Link
              className="eng-btn-gold eng-btn-sm"
              href={contactHref}
              data-analytics-cta
              data-analytics-placement="header"
              data-analytics-destination={contactHref.includes('#enquire') ? 'contact_enquire' : 'contact'}
            >
              Request assessment
            </Link>
          ) : (
            <a
              className="eng-btn-gold eng-btn-sm"
              href={contactHref}
              data-analytics-cta
              data-analytics-placement="header"
              data-analytics-destination={contactHref.includes('#enquire') ? 'contact_enquire' : 'contact'}
            >
              Request assessment
            </a>
          )}
        </nav>
      </header>
    </>
  )
}

type SiteFooterProps = {
  currentPage?: SitePage
}

/** Keep production footer content identical across the home page and sub-pages. */
export function SiteFooter({ currentPage }: SiteFooterProps) {
  return (
    <footer className="eng-footer">
      <div className="eng-container eng-footer-inner">
        <div>
          <p className="eng-wordmark eng-footer-mark">
            <span>Fin</span>
            <span className="eng-wordmark-bar" aria-hidden="true" />
            <span className="eng-gold-text">Trace</span>
          </p>
          <p className="eng-footer-line">Forensic financial analysis for the legal profession.</p>
        </div>
        <nav className="eng-footer-nav" aria-label="Site pages">
          <Link href="/" aria-current={currentPage === 'home' ? 'page' : undefined}>
            Home
          </Link>
          <Link href="/about/" aria-current={currentPage === 'about' ? 'page' : undefined}>
            About
          </Link>
          <Link href="/engagement/" aria-current={currentPage === 'engagement' ? 'page' : undefined}>
            Engagement &amp; pricing
          </Link>
          <Link href="/contact/" aria-current={currentPage === 'contact' ? 'page' : undefined}>
            Contact
          </Link>
          <Link href="/privacy/" aria-current={currentPage === 'privacy' ? 'page' : undefined}>
            Privacy
          </Link>
        </nav>
        <div className="eng-footer-meta">
          <Link
            href="/contact/"
            data-analytics-cta
            data-analytics-placement="footer"
            data-analytics-destination="contact"
          >
            Request a matter assessment
          </Link>
          <p>Engaged per matter · Australia-wide</p>
        </div>
      </div>
      <div className="eng-container eng-footer-small">
        <p>© 2026 FinTrace. Every finding traceable to its source.</p>
      </div>
    </footer>
  )
}
