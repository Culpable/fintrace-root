import { expect, test } from '@playwright/test'
import {
  PUBLIC_ROUTES,
  WEBMCP_AUTOSUBMIT_TOOL_ALLOWLIST,
  blockExternalRequests,
  waitForStableDocument,
} from './agent.routes'

type WebMcpIssue = {
  element: string
  message: string
}

for (const { route } of PUBLIC_ROUTES) {
  test(`${route} exposes valid declarative WebMCP forms`, async ({ page }) => {
    await blockExternalRequests(page)
    await page.goto(route, { waitUntil: 'load' })
    await waitForStableDocument(page)

    const issues = await page.locator('form').evaluateAll(
      (forms, autosubmitAllowlist): WebMcpIssue[] => {
        const pageToolNames = new Set<string>()
        const discoveredIssues: WebMcpIssue[] = []

        forms.forEach((form, formIndex) => {
          const element = form.id ? `form#${form.id}` : `form:nth-of-type(${formIndex + 1})`
          const toolName = form.getAttribute('toolname')?.trim() ?? ''
          const toolDescription = form.getAttribute('tooldescription')?.trim() ?? ''

          if (!toolName || !toolDescription) {
            discoveredIssues.push({ element, message: 'Every form must provide toolname and tooldescription.' })
          }
          if (toolName.length > 30) discoveredIssues.push({ element, message: 'toolname exceeds 30 characters.' })
          if (toolDescription.length > 500) {
            discoveredIssues.push({ element, message: 'tooldescription exceeds 500 characters.' })
          }
          if (toolName && pageToolNames.has(toolName)) {
            discoveredIssues.push({ element, message: `Duplicate toolname: ${toolName}.` })
          }
          if (toolName) pageToolNames.add(toolName)
          if (form.hasAttribute('toolautosubmit') && !autosubmitAllowlist.includes(toolName)) {
            discoveredIssues.push({ element, message: `toolautosubmit is not authorised for ${toolName || 'form'}.` })
          }

          const fieldNames = new Map<string, string>()
          const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
            'input:not([type=hidden]):not([type=submit]):not([type=reset]):not([type=button]):not(:disabled), select:not(:disabled), textarea:not(:disabled)',
          )

          fields.forEach((field, fieldIndex) => {
            const fieldElement = field.id ? `${element} #${field.id}` : `${element} field:${fieldIndex + 1}`
            const name = field.name.trim()
            const parameterDescription = field.getAttribute('toolparamdescription')?.trim() ?? ''
            const fieldType = field instanceof HTMLInputElement ? field.type : field.tagName.toLowerCase()

            if (!name) {
              discoveredIssues.push({ element: fieldElement, message: 'Every successful form control needs a name.' })
            } else if (
              fieldNames.has(name) &&
              !(['radio', 'checkbox'].includes(fieldType) && fieldNames.get(name) === fieldType)
            ) {
              discoveredIssues.push({ element: fieldElement, message: `Duplicate field name in form: ${name}.` })
            } else {
              fieldNames.set(name, fieldType)
            }
            if (name.length > 30) {
              discoveredIssues.push({ element: fieldElement, message: 'Field name exceeds 30 characters.' })
            }
            if (parameterDescription.length > 150) {
              discoveredIssues.push({ element: fieldElement, message: 'toolparamdescription exceeds 150 characters.' })
            }
            if (field.labels?.length === 0 && !parameterDescription) {
              discoveredIssues.push({
                element: fieldElement,
                message: 'Provide an associated label or toolparamdescription.',
              })
            }
          })
        })

        return discoveredIssues
      },
      [...WEBMCP_AUTOSUBMIT_TOOL_ALLOWLIST],
    )

    expect(issues).toEqual([])
  })
}
