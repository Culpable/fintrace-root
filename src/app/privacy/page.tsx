import clsx from 'clsx'
import Link from 'next/link'
import { createPageMetadata } from '@/lib/metadata'
import StructuredData from '../StructuredData'
import '../engine-network/engine-network.css'
import '../engine-network/site-pages.css'
import './privacy.css'
import { bricolage, fragmentMono, fragmentMonoApprox } from '../engine-network/fonts'
import { SiteFooter, SiteHeader } from '../engine-network/SiteChrome'

export const metadata = createPageMetadata('privacy')

export default function PrivacyPage() {
  return (
    <div className={clsx('dsn-engine-network', bricolage.variable, fragmentMono.variable, fragmentMonoApprox.variable)}>
      <StructuredData page="privacy" />
      <SiteHeader currentPage="privacy" />
      <main id="main-content" tabIndex={-1}>
        <section className="eng-page-hero">
          <div className="eng-container">
            <p className="eng-kicker">Privacy</p>
            <h1 className="eng-page-h1">
              Privacy at <span className="eng-gold-text">FinTrace.</span>
            </h1>
            <p className="eng-lede">
              This notice covers the FinTrace public website and enquiries sent through its contact form.
            </p>
          </div>
        </section>

        <section className="eng-page-section">
          <div className="eng-container">
            <article className="eng-pr-card">
              <p className="eng-pr-updated">
                <strong>Last updated:</strong> 31 August 2026
              </p>

              <h2>What this notice covers</h2>
              <p>
                fintrace.com.au is FinTrace’s public website for its forensic bank-statement analysis service. This
                notice explains the information handled when you visit the site or send an enquiry. It does not cover
                information handled during a separately agreed client engagement.
              </p>

              <h2>Information handled by this site</h2>
              <p>
                The site is statically hosted by GitHub Pages. GitHub may handle standard request, device and security
                information when it serves the site under its{' '}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                  privacy statement
                </a>
                . The site has no user accounts, payment form, advertising tracker, session recording or automatic form
                capture.
              </p>

              <h2>Limited website analytics</h2>
              <p>
                In production, FinTrace uses Mixpanel to measure a small set of site events: page views, assessment-link
                clicks and enquiry-form stages. The analytics setup uses a browser identifier stored in local storage.
                It does not send form values, matter details, raw page addresses, referrers, advertising identifiers or
                recorded sessions. Mixpanel handles analytics information under its{' '}
                <a href="https://mixpanel.com/legal/privacy-policy/">privacy policy</a>.
              </p>

              <h2>Enquiries</h2>
              <p>
                If you use the contact form, FinTrace receives the name, work email, firm or organisation and message
                you choose to send. Formspree processes the submission so FinTrace can receive it under its{' '}
                <a href="https://formspree.io/legal/privacy-policy/">privacy policy</a>. FinTrace uses that information
                to answer your enquiry, assess whether the service fits, prepare a quote, maintain business records,
                meet legal duties and resolve disputes. Do not include confidential statement data in the initial
                enquiry.
              </p>

              <h2>Sharing and retention</h2>
              <p>
                FinTrace does not sell personal information provided through this site. Information may be handled by
                providers that support website hosting, analytics, form delivery, security or professional advice. It
                may also be disclosed when law requires it. Providers can process information outside Australia under
                their own terms and safeguards.
              </p>
              <p>
                FinTrace keeps enquiry information only for as long as it is reasonably needed for the purposes above
                and any applicable record-keeping requirements.
              </p>

              <h2>Your choices and contact</h2>
              <p>
                You can block Mixpanel or clear this site’s local storage through your browser. The site and enquiry
                form still work when analytics is blocked. To ask about, correct or request deletion of personal
                information you sent to FinTrace, use the <Link href="/contact/">contact form</Link>. FinTrace will
                respond subject to applicable legal obligations.
              </p>

              <h2>Changes to this notice</h2>
              <p>
                FinTrace may update this notice when the site, service providers or legal obligations change. The date
                at the top shows the latest published version.
              </p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter currentPage="privacy" />
    </div>
  )
}
