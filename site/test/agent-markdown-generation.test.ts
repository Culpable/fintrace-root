import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { generateAgentMarkdown, mainHtmlToMarkdown } from '../scripts/generate-agent-markdown.mjs'

const testDirectory = mkdtempSync(join(tmpdir(), 'fintrace-agent-markdown-test-'))

after(() => {
  const result = spawnSync('trash', [testDirectory], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('agent Markdown publishes the stat final value and the opted-in trace annotations', () => {
  const markdown = mainHtmlToMarkdown(`
    <section>
      <h2>The outcome</h2>
      <p>
        <span role="text" aria-label="100%"><span aria-hidden="true">0%</span></span>
        <span>of findings cited</span>
      </p>
      <div class="tnet-root" aria-hidden="true" data-agent-include>
        <span class="tnet-label" data-path-index="1">CASH</span>
        <span class="tnet-note" data-hop-index="1">A$9,500 · 07 MAR 2024 · SEE P. 214</span>
      </div>
      <div data-agent-ignore>
        <p>Decorative duplicate</p>
      </div>
    </section>
  `)

  // The animated numeral publishes its final value, never the starting 0.
  assert.match(markdown, /100% of findings cited/)
  // The starting value must not survive anywhere as its own token.
  assert.doesNotMatch(markdown, /(?<!10)0% of findings cited/)
  assert.match(markdown, /A\$9,500 · 07 MAR 2024 · SEE P\. 214/)
  assert.doesNotMatch(markdown, /Decorative duplicate/)
})

test('agent Markdown decodes named, decimal, and hexadecimal entities in metadata and body text', async () => {
  writeFileSync(join(testDirectory, 'index.html'), `
    <!doctype html>
    <html>
      <head>
        <title>FinTrace&#x27;s forensic engine</title>
        <meta name="description" content="We&#x27;re ready &amp; you&#39;d agree.">
        <link rel="canonical" href="https://fintrace.com.au/">
      </head>
      <body>
        <main><p>We&#x27;re ready, you&#39;d agree, and Nick Brookes uses FinTrace &#38; its ledger.</p></main>
      </body>
    </html>
  `)

  await generateAgentMarkdown({
    outputDirectory: testDirectory,
    origin: 'https://fintrace.com.au',
    vercelRoutesModule: undefined,
  })

  const generated = readFileSync(join(testDirectory, '_agent-markdown/index.md'), 'utf8')
  assert.match(generated, /title: "FinTrace's forensic engine"/)
  assert.match(generated, /description: "We're ready & you'd agree\."/)
  assert.match(generated, /We're ready, you'd agree, and Nick Brookes uses FinTrace & its ledger\./)
  assert.doesNotMatch(generated, /&(?:amp|#(?:\d+|x[\da-f]+));/i)
})
