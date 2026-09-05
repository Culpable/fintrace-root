// Proves the enquiry form's wire contract without sending an enquiry.
// Usage: node scripts/verify-contact-contract.mjs [origin]
import { chromium } from '@playwright/test'
import { browserResolverArguments } from './host-override.mjs'

const origin = (process.argv[2] ?? 'http://127.0.0.1:4332').replace(/\/$/, '')
const EXPECTED_FIELDS = ['_subject', 'form_source', '_gotcha', 'name', 'email', 'organisation', 'message']

const browser = await chromium.launch({ args: browserResolverArguments() })
const failures = []
const evidence = {}

for (const [state, fulfil] of [
  ['sending', null],
  ['error', { status: 500, body: '{"error":"Verification failure"}' }],
  ['success', { status: 200, body: '{"ok":true}' }],
]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  let intercepted = null
  await context.route('https://formspree.io/**', async (route) => {
    const request = route.request()
    intercepted = {
      method: request.method(),
      url: request.url(),
      accept: request.headers().accept,
      // The body is multipart form data, so it is read as text and the field
      // names are taken from the part headers.
      raw: request.postData() ?? '',
    }
    if (!fulfil) return new Promise(() => {})
    await route.fulfill({ status: fulfil.status, contentType: 'application/json', body: fulfil.body })
  })

  const page = await context.newPage()
  await page.goto(`${origin}/contact/`, { waitUntil: 'load' })
  await page.fill('#contact-name', 'Contract Check')
  await page.fill('#contact-email', 'contract@example.com')
  await page.fill('#contact-organisation', 'Contract Chambers')
  await page.fill('#contact-message', 'Verifying the submission contract.')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(state === 'sending' ? 1200 : 2000)

  if (!intercepted) failures.push(`${state}: no Formspree request was intercepted`)
  else {
    if (intercepted.method !== 'POST') failures.push(`${state}: method ${intercepted.method}`)
    if (intercepted.url !== 'https://formspree.io/f/xwvgoenw') failures.push(`${state}: endpoint ${intercepted.url}`)
    if (intercepted.accept !== 'application/json') failures.push(`${state}: Accept ${intercepted.accept}`)
    // The multipart body must carry exactly the seven named fields.
    const names = [...intercepted.raw.matchAll(/name="([^"]+)"/g)].map((match) => match[1])
    const missing = EXPECTED_FIELDS.filter((field) => !names.includes(field))
    const extra = names.filter((field) => !EXPECTED_FIELDS.includes(field))
    if (missing.length > 0) failures.push(`${state}: missing fields ${missing.join(', ')}`)
    if (extra.length > 0) failures.push(`${state}: unexpected fields ${extra.join(', ')}`)
    evidence[state] = { fields: names }
  }

  const visible = await page.evaluate(() => ({
    buttonLabel: document.querySelector('form.eng-ct-form [data-form-submit]')?.textContent?.trim() ?? null,
    buttonHidden: document.querySelector('form.eng-ct-form [data-form-submit]')?.hidden ?? null,
    busy: document.querySelector('form.eng-ct-form')?.getAttribute('aria-busy'),
    sendingVisible: document.querySelector('[data-form-panel="sending"]')?.hidden === false,
    successVisible: document.querySelector('[data-form-panel="success"]')?.hidden === false,
    errorVisible: document.querySelector('[data-form-panel="error"]')?.hidden === false,
    nameValue: document.querySelector('#contact-name')?.value ?? '',
    autosubmit: document.querySelector('form.eng-ct-form')?.hasAttribute('toolautosubmit'),
  }))
  evidence[state] = { ...evidence[state], ...visible }

  if (visible.autosubmit) failures.push(`${state}: the form declares toolautosubmit`)
  if (state === 'sending') {
    if (visible.buttonLabel !== 'Sending') failures.push(`sending: button label is "${visible.buttonLabel}"`)
    if (visible.busy !== 'true') failures.push(`sending: aria-busy is "${visible.busy}"`)
    if (!visible.sendingVisible) failures.push('sending: the sending status is not shown')
  }
  if (state === 'error') {
    if (!visible.errorVisible) failures.push('error: the alert panel is not shown')
    // A retry must never force the user to retype the enquiry.
    if (visible.nameValue !== 'Contract Check') failures.push('error: typed values were not preserved')
  }
  if (state === 'success') {
    if (!visible.successVisible) failures.push('success: the status panel is not shown')
    if (visible.buttonHidden !== true) failures.push('success: the submit button is still shown')
    if (visible.nameValue !== '') failures.push('success: the form was not reset')
  }

  await context.close()
}

await browser.close()
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`)
if (failures.length > 0) {
  process.stdout.write(`FAIL contact contract on ${origin}\n${failures.map((failure) => `  - ${failure}`).join('\n')}\n`)
  process.exit(1)
}
process.stdout.write(`PASS contact contract on ${origin}: POST to Formspree with exactly seven named fields; sending, error and success states correct; no enquiry sent\n`)
