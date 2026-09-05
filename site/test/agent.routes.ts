import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Page } from '@playwright/test'

export type PublicRoute = {
  route: string
  marker: string
}

export type AgentInteractionState = {
  name: string
  setup: (page: Page) => Promise<void>
}

export const PUBLIC_ROUTES = [
  { route: '/', marker: 'The evidence engine.' },
  { route: '/about/', marker: 'Forensic rigour, run as a service.' },
  { route: '/engagement/', marker: 'Engaged per matter. Quoted up front.' },
  { route: '/contact/', marker: 'Tell us what you’re working on.' },
  { route: '/privacy/', marker: 'Privacy at FinTrace.' },
] as const satisfies readonly PublicRoute[]

export const UNKNOWN_ROUTE = '/agent-readiness/missing-route-7f48d4/'
export const ACCESSIBILITY_ROUTES = [...PUBLIC_ROUTES.map(({ route }) => route), UNKNOWN_ROUTE] as const
export const USER_TRIGGERED_AGENT_USER_AGENTS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'] as const
export const MAX_CUMULATIVE_LAYOUT_SHIFT = 0.1
export const WEBMCP_AUTOSUBMIT_TOOL_ALLOWLIST: readonly string[] = []

const formValues = {
  name: 'Test User',
  email: 'test@example.com',
  organisation: 'Example Firm',
  message: 'Please confirm service fit and an indicative timeframe.',
} as const

async function fillEnquiryForm(page: Page) {
  await page.getByLabel('Name').fill(formValues.name)
  await page.getByLabel('Work email').fill(formValues.email)
  await page.getByLabel('Firm or organisation').fill(formValues.organisation)
  await page.getByLabel('Your enquiry').fill(formValues.message)
}

export const AGENT_INTERACTION_STATES: Readonly<Record<string, readonly AgentInteractionState[]>> = {
  '/contact/': [
    {
      name: 'sending',
      setup: async (page) => {
        await page.evaluate(() => {
          window.fetch = () => new Promise<Response>(() => undefined)
        })
        await fillEnquiryForm(page)
        await page.getByRole('button', { name: 'Send enquiry' }).click()
        await page.getByText('Sending your enquiry…').waitFor()
      },
    },
    {
      name: 'success',
      setup: async (page) => {
        await page.evaluate(() => {
          window.fetch = async () => new Response('{}', { status: 200 })
        })
        await fillEnquiryForm(page)
        await page.getByRole('button', { name: 'Send enquiry' }).click()
        await page.getByText('Enquiry received.').waitFor()
      },
    },
    {
      name: 'error',
      setup: async (page) => {
        await page.evaluate(() => {
          window.fetch = async () => new Response('{"error":"Test failure"}', { status: 500 })
        })
        await fillEnquiryForm(page)
        await page.getByRole('button', { name: 'Send enquiry' }).click()
        await page.locator('.eng-ct-error[role="alert"]').waitFor()
      },
    },
  ],
}

function outputFileForRoute(route: string) {
  return route === '/' ? resolve('dist/index.html') : resolve('dist', route.slice(1), 'index.html')
}

export function assertBuiltRouteInventory() {
  for (const { route } of PUBLIC_ROUTES) {
    const outputFile = outputFileForRoute(route)
    if (!existsSync(outputFile)) {
      throw new Error(`Built route is missing at ${outputFile}. Run pnpm build first.`)
    }
  }
  if (!existsSync(resolve('dist/404.html'))) {
    throw new Error('Built 404 document is missing. Run pnpm build first.')
  }
}

export function materialStatesForRoute(route: string) {
  return AGENT_INTERACTION_STATES[route] ?? []
}

/**
 * The site under test. Defaults to the local preview server; a hosted run
 * points it at the deployed origin, which must then count as first-party or
 * the request blocker below would refuse the navigation itself.
 */
const firstPartyOrigin = process.env.PLAYWRIGHT_BASE_URL
  ? new URL(process.env.PLAYWRIGHT_BASE_URL).origin
  : null

function isFirstPartyUrl(rawUrl: string) {
  const url = new URL(rawUrl)
  if (['about:', 'blob:', 'data:'].includes(url.protocol)) return true
  if (firstPartyOrigin && url.origin === firstPartyOrigin) return true
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
}

function isMixpanelTrackUrl(rawUrl: string) {
  const url = new URL(rawUrl)
  return url.origin === 'https://api-js.mixpanel.com' && url.pathname === '/track/'
}

export async function blockExternalRequests(page: Page) {
  await page.route('**/*', async (route) => {
    const requestUrl = route.request().url()
    if (isFirstPartyUrl(requestUrl)) {
      await route.continue()
      return
    }
    if (isMixpanelTrackUrl(requestUrl)) {
      // Fulfil the documented production analytics request inside Chromium. Aborting it would create a
      // synthetic console error, while every other external request remains blocked below.
      await route.fulfill({ status: 200, contentType: 'text/plain', body: '1' })
      return
    }
    await route.abort('blockedbyclient')
  })
}

export async function waitForStableDocument(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready
  })
}

assertBuiltRouteInventory()
