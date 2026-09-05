import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = new URL(process.argv[2] ?? 'https://fintrace.com.au').origin;
const outputPath = process.argv[3];
const results = [];

// Compare deployed representations with the exact build whose semantic tests passed.
for (const [route, asset] of [
  ['/', 'index'],
  ['/about/', 'about/index'],
  ['/engagement/', 'engagement/index'],
  ['/contact/', 'contact/index'],
  ['/privacy/', 'privacy/index'],
]) {
  const response = await fetch(`${origin}${route}`, { headers: { Accept: 'text/markdown' } });
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get('content-type') ?? '', /text\/markdown/);
  const body = await response.text();
  assert.equal(body, readFileSync(resolve(import.meta.dirname, `../dist/_agent-markdown/${asset}.md`), 'utf8'), route);
  results.push({ route, markdownMatchesBuild: true });
}

// Reproduce the cross-representation ETag request that previously crashed the Worker.
const html = await fetch(`${origin}/engagement/`, { headers: { Accept: 'text/html' } });
assert.equal(html.status, 200);
const etag = html.headers.get('etag');
assert.ok(etag, 'HTML response must expose an ETag for conditional verification');
const conditionalMarkdown = await fetch(`${origin}/engagement/`, { headers: { Accept: 'text/markdown', 'If-None-Match': etag } });
assert.equal(conditionalMarkdown.status, 200);
assert.equal(await conditionalMarkdown.text(), readFileSync(resolve(import.meta.dirname, '../dist/_agent-markdown/engagement/index.md'), 'utf8'));
const conditionalHtml = await fetch(`${origin}/engagement/`, { headers: { Accept: 'text/html', 'If-None-Match': etag } });
assert.equal(conditionalHtml.status, 304);
assert.equal(await conditionalHtml.text(), '');
const redirect = await fetch(`${origin}/engagement`, { redirect: 'manual', headers: { Accept: 'text/markdown' } });
assert.equal(redirect.status, 307);
assert.equal(await redirect.text(), '');
const head = await fetch(`${origin}/engagement/`, { method: 'HEAD', headers: { Accept: 'text/markdown', 'If-None-Match': etag } });
assert.equal(head.status, 200);
assert.equal(await head.text(), '');
results.push({ conditionalMarkdown: 200, conditionalHtml: 304, markdownRedirect: 307, headBodyEmpty: true });

// The deployed copy must carry the FinTrace evidence story and the D-13 host.
const home = await fetch(`${origin}/`, { headers: { Accept: 'text/markdown' } });
const homeMarkdown = await home.text();
for (const marker of ['ATM WITHDRAWAL - CROWS NEST', '\u22129,701.95', 'A$9,500 \u00b7 07 MAR 2024 \u00b7 SEE P. 214', '100%']) {
  assert.ok(homeMarkdown.includes(marker), `home Markdown is missing ${marker}`);
}
const about = await fetch(`${origin}/about/`, { headers: { Accept: 'text/markdown' } });
assert.match(await about.text(), /\u224850 hrs estimated/);
const privacy = await fetch(`${origin}/privacy/`);
assert.equal(privacy.status, 200);
const privacyHtml = await privacy.text();
assert.match(privacyHtml, /The site is served by Cloudflare\./);
assert.doesNotMatch(privacyHtml, /statically hosted by GitHub Pages/);
const evidence = { origin, checkedAt: new Date().toISOString(), results, privacyHostUpdated: true };
if (outputPath) writeFileSync(resolve(outputPath), `${JSON.stringify(evidence, null, 2)}\n`);
console.log('PASS deployed Markdown matches the built documents; conditional HTML/Markdown, redirects, HEAD, evidence-story content and the privacy host');
