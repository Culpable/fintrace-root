import Link from 'next/link'

type SiteHeaderProps = {
  contactHref?: string
}

/** Render the production sub-page header with stable links into the public site. */
export function SiteHeader({ contactHref = '/contact/' }: SiteHeaderProps) {
  return (
    <header className="eng-header">
      <Link href="/" className="eng-wordmark" aria-label="FinTrace home">
        <span>Fin</span>
        <span className="eng-wordmark-bar" aria-hidden="true" />
        <span className="eng-gold-text">Trace</span>
      </Link>
      <nav className="eng-header-nav" aria-label="Site pages">
        <Link href="/about/">About</Link>
        <Link href="/engagement/">Engagement</Link>
        <Link href="/contact/">Contact</Link>
        <a className="eng-btn-gold eng-btn-sm" href={contactHref}>
          Request assessment
        </a>
      </nav>
    </header>
  )
}

/** Keep production footer content identical across the home page and sub-pages. */
export function SiteFooter() {
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
          <Link href="/">Home</Link>
          <Link href="/about/">About</Link>
          <Link href="/engagement/">Engagement &amp; pricing</Link>
          <Link href="/contact/">Contact</Link>
        </nav>
        <div className="eng-footer-meta">
          <Link href="/contact/">Request a matter assessment</Link>
          <p>Engaged per matter · Australia-wide</p>
        </div>
      </div>
      <div className="eng-container eng-footer-small">
        <p>© 2026 FinTrace. Every finding traceable to its source.</p>
      </div>
    </footer>
  )
}
