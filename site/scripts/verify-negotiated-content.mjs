import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://bulma.com.au').origin;
const outputPath = process.argv[3];
const results = [];

// Compare deployed representations with the exact build whose semantic tests passed.
for (const [route, asset] of [['/', 'index'], ['/pricing/', 'pricing/index'], ['/about/', 'about/index'], ['/privacy-policy/', 'privacy-policy/index']]) {
  const response = await fetch(`${origin}${route}`, { headers: { Accept: 'text/markdown' } });
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/);
  const body = await response.text();
  assert.equal(body, readFileSync(resolve(import.meta.dirname, `../dist/_agent-markdown/${asset}.md`), 'utf8'), route);
  results.push({ route, markdownMatchesBuild: true });
}

// Reproduce the cross-representation ETag request that previously crashed the Worker.
const html = await fetch(`${origin}/pricing/`, { headers: { Accept: 'text/html' } });
assert.equal(html.status, 200);
const etag = html.headers.get('etag');
assert.ok(etag, 'HTML response must expose an ETag for conditional verification');
const conditionalMarkdown = await fetch(`${origin}/pricing/`, { headers: { Accept: 'text/markdown', 'If-None-Match': etag } });
assert.equal(conditionalMarkdown.status, 200);
assert.equal(await conditionalMarkdown.text(), readFileSync(resolve(import.meta.dirname, '../dist/_agent-markdown/pricing/index.md'), 'utf8'));
const conditionalHtml = await fetch(`${origin}/pricing/`, { headers: { Accept: 'text/html', 'If-None-Match': etag } });
assert.equal(conditionalHtml.status, 304);
assert.equal(await conditionalHtml.text(), '');
const redirect = await fetch(`${origin}/pricing`, { redirect: 'manual', headers: { Accept: 'text/markdown' } });
assert.equal(redirect.status, 307);
assert.equal(await redirect.text(), '');
const head = await fetch(`${origin}/pricing/`, { method: 'HEAD', headers: { Accept: 'text/markdown', 'If-None-Match': etag } });
assert.equal(head.status, 200);
assert.equal(await head.text(), '');
results.push({ conditionalMarkdown: 200, conditionalHtml: 304, markdownRedirect: 307, headBodyEmpty: true });

const privacy = await fetch(`${origin}/privacy-policy/`);
assert.equal(privacy.status, 200);
assert.doesNotMatch(await privacy.text(), /general example only/);
const evidence = { origin, checkedAt: new Date().toISOString(), results, privacyDisclaimerRemoved: true };
if (outputPath) writeFileSync(resolve(outputPath), `${JSON.stringify(evidence, null, 2)}\n`);
console.log('PASS deployed Markdown matches semantic-tested build; conditional HTML/Markdown, redirects, HEAD and privacy copy');
