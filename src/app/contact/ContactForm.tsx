'use client'

import { useState, type FormEvent } from 'react'

// Keep the public form ID isolated here so endpoint changes never touch the submission state machine.
const FORMSPREE_FORM_ID = 'xwvgoenw'
const FORMSPREE_ACTION = `https://formspree.io/f/${FORMSPREE_FORM_ID}`

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const isSubmitting = submitStatus === 'sending'

  function handleFormChange() {
    if (submitStatus === 'success' || submitStatus === 'error') {
      setSubmitStatus('idle')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const form = event.currentTarget

    setSubmitStatus('sending')

    try {
      const response = await fetch(FORMSPREE_ACTION, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        let message = 'Form submission failed'
        try {
          const data: { error?: string } = await response.json()
          if (data.error) {
            message = data.error
          }
        } catch {
          // Preserve the stable user-facing fallback when Formspree returns a non-JSON error response.
        }
        throw new Error(message)
      }

      form.reset()
      setSubmitStatus('success')
    } catch {
      // Keep every typed value in place so a retry never forces the user to reconstruct the enquiry.
      setSubmitStatus('error')
    }
  }

  return (
    <form
      className="eng-ct-form"
      action={FORMSPREE_ACTION}
      method="POST"
      onChange={handleFormChange}
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
      <input type="hidden" name="_subject" value="New matter enquiry — fintrace.com.au" />
      <input type="hidden" name="form_source" value="contact_page" />
      <input
        className="eng-ct-honeypot"
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="eng-ct-field">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="eng-ct-field">
        <label htmlFor="contact-email">Work email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="eng-ct-field">
        <label htmlFor="contact-organisation">Firm or organisation</label>
        <input id="contact-organisation" name="organisation" type="text" autoComplete="organization" required />
      </div>
      <div className="eng-ct-field">
        <label htmlFor="contact-matter-type">Matter type</label>
        <select id="contact-matter-type" name="matter_type" defaultValue="" required>
          <option value="" disabled>
            Select the closest fit
          </option>
          <option>Family law property matter</option>
          <option>Estate or financial-abuse matter</option>
          <option>Insolvency or asset tracing</option>
          <option>Forensic investigation</option>
          <option>Other</option>
        </select>
      </div>
      <div className="eng-ct-field">
        <label htmlFor="contact-volume">Approximate volume</label>
        <select id="contact-volume" name="volume" defaultValue="">
          <option value="" disabled>
            Select if known
          </option>
          <option>Under 500 pages</option>
          <option>500–2,000 pages</option>
          <option>2,000–10,000 pages</option>
          <option>More than 10,000 pages</option>
          <option>Not sure yet</option>
        </select>
      </div>
      <div className="eng-ct-field">
        <label htmlFor="contact-message">The matter</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="The dispute, the account footprint, the timeframe — a few lines is plenty."
        />
      </div>

      {submitStatus === 'error' ? (
        <div className="eng-ct-status eng-ct-error" role="alert">
          <h3>Enquiry not sent</h3>
          <p>Your details are still filled in above. Please check your connection and retry.</p>
        </div>
      ) : null}

      <div className="eng-ct-submit-region">
        {submitStatus === 'success' ? (
          <p className="eng-ct-status eng-ct-success" role="status">
            Enquiry received. We’ll respond using the work email you provided.
          </p>
        ) : (
          <>
            <button className="eng-btn-gold" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending' : 'Send enquiry'}
            </button>
            {isSubmitting ? (
              <p className="eng-ct-loading" role="status">
                Sending your enquiry…
              </p>
            ) : null}
          </>
        )}
      </div>
    </form>
  )
}
