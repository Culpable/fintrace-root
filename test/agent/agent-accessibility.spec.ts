import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { AGENT_ACCESSIBILITY_RULES } from './agent-accessibility.rules'
import {
  ACCESSIBILITY_ROUTES,
  MAX_CUMULATIVE_LAYOUT_SHIFT,
  blockExternalRequests,
  materialStatesForRoute,
  waitForStableDocument,
} from './agent.routes'

type LayoutShiftEntry = {
  startTime: number
  value: number
}

declare global {
  interface Window {
    __agentLayoutShifts?: LayoutShiftEntry[]
  }
}

async function installLayoutShiftObserver(page: Page) {
  await page.addInitScript(() => {
    window.__agentLayoutShifts = []
    new PerformanceObserver((list) => {
      for (const performanceEntry of list.getEntries()) {
        const entry = performanceEntry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!entry.hadRecentInput) {
          window.__agentLayoutShifts?.push({ startTime: entry.startTime, value: entry.value })
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

async function readCumulativeLayoutShift(page: Page) {
  return page.evaluate(() => {
    const entries = [...(window.__agentLayoutShifts ?? [])].sort((left, right) => left.startTime - right.startTime)
    let maximumSessionValue = 0
    let currentSessionValue = 0
    let firstEntryTime: number | undefined
    let previousEntryTime: number | undefined

    for (const entry of entries) {
      const startsNewSession =
        firstEntryTime === undefined ||
        previousEntryTime === undefined ||
        entry.startTime - previousEntryTime > 1_000 ||
        entry.startTime - firstEntryTime > 5_000

      if (startsNewSession) {
        firstEntryTime = entry.startTime
        currentSessionValue = entry.value
      } else {
        currentSessionValue += entry.value
      }
      previousEntryTime = entry.startTime
      maximumSessionValue = Math.max(maximumSessionValue, currentSessionValue)
    }

    return maximumSessionValue
  })
}

function formatViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations
    .flatMap((violation) =>
      violation.nodes.map((node) =>
        [
          `${violation.id}: ${violation.help}`,
          `target: ${node.target.join(', ')}`,
          `html: ${node.html}`,
          ...(node.failureSummary ?? '').split('\n'),
        ].join('\n'),
      ),
    )
    .join('\n\n')
}

async function scanCurrentState(page: Page) {
  const results = await new AxeBuilder({ page }).withRules([...AGENT_ACCESSIBILITY_RULES]).analyze()
  expect(results.violations, formatViolations(results.violations)).toEqual([])
  expect(await readCumulativeLayoutShift(page)).toBeLessThanOrEqual(MAX_CUMULATIVE_LAYOUT_SHIFT)
}

for (const route of ACCESSIBILITY_ROUTES) {
  const states = [{ name: 'initial', setup: async () => undefined }, ...materialStatesForRoute(route)]

  for (const state of states) {
    test(`${route} exposes an agent-operable ${state.name} state`, async ({ page }) => {
      await installLayoutShiftObserver(page)
      await blockExternalRequests(page)
      await page.goto(route, { waitUntil: 'load' })
      await waitForStableDocument(page)
      await state.setup(page)
      await scanCurrentState(page)
    })
  }
}
