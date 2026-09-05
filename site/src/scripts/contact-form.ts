import { trackAnalytics } from '@/lib/analytics/client.ts'

/**
 * Enquiry submission state machine.
 *
 * Ported from the production React form with the same four states, the same
 * request, the same copy and the same analytics calls. The three state panels
 * are prerendered, so a transition is a `hidden` toggle rather than a render.
 */
type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

const form = document.querySelector<HTMLFormElement>('form.eng-ct-form')

if (form) {
  const panels = {
    error: form.querySelector<HTMLElement>('[data-form-panel="error"]'),
    success: form.querySelector<HTMLElement>('[data-form-panel="success"]'),
    sending: form.querySelector<HTMLElement>('[data-form-panel="sending"]'),
  }
  const submitButton = form.querySelector<HTMLButtonElement>('[data-form-submit]')

  let submitStatus: SubmitStatus = 'idle'
  let hasTrackedStart = false

  const setStatus = (status: SubmitStatus) => {
    submitStatus = status
    const isSubmitting = status === 'sending'

    if (panels.error) panels.error.hidden = status !== 'error'
    if (panels.sending) panels.sending.hidden = !isSubmitting
    // The success panel replaces the button, exactly as the React branch did.
    if (panels.success) panels.success.hidden = status !== 'success'
    if (submitButton) {
      submitButton.hidden = status === 'success'
      submitButton.disabled = isSubmitting
      submitButton.textContent = isSubmitting ? 'Sending' : 'Send enquiry'
    }
    form.setAttribute('aria-busy', String(isSubmitting))
  }

  const handleFormInteraction = () => {
    if (hasTrackedStart) return
    hasTrackedStart = true
    trackAnalytics({ name: 'Enquiry Started', placement: 'form' })
  }

  form.addEventListener('focusin', handleFormInteraction)
  form.addEventListener('input', handleFormInteraction)
  form.addEventListener('change', () => {
    if (submitStatus === 'success' || submitStatus === 'error') setStatus('idle')
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (submitStatus === 'sending') return

    let failureStage: 'response' | 'network' = 'network'
    setStatus('sending')

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        failureStage = 'response'
        let message = 'Form submission failed'
        try {
          const data: { error?: string } = await response.json()
          if (data.error) message = data.error
        } catch {
          // Preserve the stable user-facing fallback when Formspree returns a
          // non-JSON error response.
        }
        throw new Error(message)
      }

      form.reset()
      setStatus('success')
      trackAnalytics({ name: 'Enquiry Submitted', placement: 'form' })
    } catch {
      // Keep every typed value in place so a retry never forces the user to
      // reconstruct the enquiry.
      setStatus('error')
      trackAnalytics({ name: 'Enquiry Submission Failed', placement: 'form', failure_stage: failureStage })
    }
  })

  form.setAttribute('aria-busy', 'false')
}

export {}
